import { AliceManager } from "ucbuilder/build/codefile/aliceManager";
import { uniqOpt, propOpt } from "ucbuilder/build/common";
import { LoadGlobal } from "ucbuilder/global/loadGlobal";
import { FileDataBank } from "ucbuilder/global/fileDataBank";
import { newObjectOpt } from "ucbuilder/global/objectOpt";
import { openCloser } from "ucbuilder/global/openCloser";
import { rootPathHandler } from "ucbuilder/global/rootPathHandler";
import { ATTR_OF } from "ucbuilder/global/runtimeOpt";
import { ReplaceTextRow, RootPathRow, rootPathRow } from "ucbuilder/global/findAndReplace";
export type VariableList = { [key: string]: string };
  
interface PatternList {
  globalFinderPathPattern: RegExp;
  globalFinderPattern: RegExp;
  styleTagSelector: RegExp;
  styleCommentRegs: RegExp;
  subUcFatcher: RegExp;
  themeCSSLoader: RegExp;
  stylesFilterPattern: RegExp;
  varValuePrinterPattern: RegExp;
  scopeSelector: RegExp;
  rootExcludePattern: RegExp;
}

const patternList: PatternList = {
  globalFinderPathPattern: /path=(["'`])([\s\S]*?)\1/gim,
  globalFinderPattern: /(.|\n)<gload([\n\r\w\W.]*?)>/gim,
  styleTagSelector: /<style([\n\r\w\W.]*?)>([\n\r\w\W.]*?)<\/style>/gi,
  styleCommentRegs: /\/\*([\s\S]*?)\*\//gi,
  subUcFatcher: /\[inside=("|'|`)([\s\S]*?)\1\]([\S\s]*)/gim,
  themeCSSLoader: /\[(theme|css)=(["'`])*([\s\S]*?)\2\]/gim,
  stylesFilterPattern: /(animation-name|\$[lgi]-\w+)\s*:\s*(.*?)\s*;/gim,
  varValuePrinterPattern: /var\s*\(\s*(\$[lgit]-\w+)\s*(.*?)\)\s*\;/gim,
  scopeSelector: /\[SELF_]/gm,
  rootExcludePattern: /(.*?)(:root|:exclude)/gi,
};
interface StyleSeperatorOptions {
  data: string,
  scopeSelectorText?: string,
  callCounter?: number,
  isForRoot?: boolean,
  _rootinfo?: RootPathRow,
  localNodeElement?: HTMLElement,
  cssVarStampKey?: string,
}
const styleSeperatorOptions: StyleSeperatorOptions = {
  data: "",
  scopeSelectorText: "",
  callCounter: 0,
  isForRoot: false,
  _rootinfo: Object.assign({}, rootPathRow),
  localNodeElement: undefined,
  cssVarStampKey: "",
};
export class stylerRegs {
  static pushPublicStyles(callback: () => void): void {
    import("ucbuilder/ResourcesUC").then(({ ResourcesUC }) => {
      rootPathHandler.source.forEach((row: RootPathRow) => {
        let _stylepath: string = row.tInfo.replaceWith + "/styles.scss"; //row.tInfo.replaceLowerCaseText + "/styles.scss";
        //console.log('==>'+_stylepath);

        let node: RootPathRow = row;//rootPathHandler.convertToRow(row, true);
        node.isAlreadyFullPath = true;
        let styler: stylerRegs = new stylerRegs(node, true);
        ResourcesUC.styler.pushChild(node.alices, styler, node.alices);

        let _data: string = FileDataBank.readFile(_stylepath, {
          isFullPath: true,
          replaceContentWithKeys: true,
        });

        if (_data != undefined) {
          LoadGlobal.pushRow({
            url: _stylepath,
            cssContents: styler.parseStyleSeperator_sub({ data: _data }),
            stamp: styler.stamp,
          });
        }
      });
      callback();
    });
  }
  stamp: string = "";
  uniqStamp: string = "";
  static stampNo: number = 0;
  static stampCallTimes: number = 0;
  aliceMng: AliceManager = new AliceManager();
  rootInfo: RootPathRow = undefined;
  nodeName: string = "";
  parent: stylerRegs = undefined;
  children: stylerRegs[] = [];
  alices: string = "";
  path: string = "";

  constructor(rootInfo?: RootPathRow, generateStamp: boolean = true) {
    this.rootInfo = rootInfo;

    stylerRegs.stampCallTimes++;
    if (generateStamp)
      stylerRegs.stampNo++;

    this.stamp = "" + stylerRegs.stampNo;
    this.uniqStamp = "" + stylerRegs.stampCallTimes;
    this.nodeName = "f" + uniqOpt.randomNo();
  }

  cssVars: { key: string; value: string }[] = [];

  LoadGlobalPath(data: string): void {
    let _this = this;
    data.replace(
      patternList.globalFinderPathPattern,
      (match: string, quationMark: string, paths: string) => {
        paths.split(";").forEach((s: string) => {
          LoadGlobal.pushRow({
            url: s.trim(),
            stamp: _this.uniqStamp,  // _this.stamp   <- i changed..dont know why
            reloadDesign: false,
          });
        });
        return "";
      }
    );
  }

  parseStyle(data: string): string {
    let _this = this;

    let rtrn: string = data.replace(
      patternList.globalFinderPattern,
      (match: string, escapeChar: string, contents: string, offset: any, input_string: string) => {
        if (escapeChar === `\\`) return match;
        _this.LoadGlobalPath(contents);
        return "";
      }
    );

    rtrn = rtrn.replace(
      patternList.styleTagSelector,
      function (match: string, styleAttrs: string, styleContent: string, offset: any, input_string: string) {
        return `<style ${styleAttrs}> ${_this.parseStyleSeperator_sub({
          data: styleContent,
        })} </style>`;
      }
    );

    return rtrn;
  }
  opnClsr: openCloser = new openCloser();
  static internalKey: string = 'int' + uniqOpt.randomNo();

  parseStyleSeperator_sub(_args: StyleSeperatorOptions): string {
    let _this = this;
    if (_args.data == undefined) return "";
    let _params = Object.assign({}, styleSeperatorOptions);
    _params = Object.assign(_params, _args);

    _params.callCounter++;
    let externalStyles: string[] = [];
    let isChffd: boolean = false;
    let pstamp_key: string = ATTR_OF.UC.PARENT_STAMP;
    let pstamp_val: string = _this.uniqStamp;  // _this.stamp  <-- i changed dont know why
    if (_params.isForRoot) {
      pstamp_key = ATTR_OF.UC.ROOT_STAMP;

      pstamp_val = '' + (
        _params._rootinfo == undefined
          ? _this.rootInfo.id
          : _params._rootinfo.id);
    }
    let rtrn: string = _params.data.replace(patternList.styleCommentRegs, "");
    rtrn = rtrn.replace(
      patternList.themeCSSLoader,
      (match: string, code: string, quationMark: string, path: string, offset: any, input_string: string) => {
        isChffd = true;

        switch (code) {
          case "theme":
            return FileDataBank.readFile(path);
          case "css":
            let isGoodToAdd: boolean = LoadGlobal.isGoodToPush(path);
            if (isGoodToAdd) {
              let cssContents: string = _this.parseStyleSeperator_sub({
                data: FileDataBank.readFile(path),
              });
              LoadGlobal.pushRow({
                url: path,
                stamp: this.uniqStamp, //this.stamp  <-- i changed dont know why
                reloadDesign: false,
                cssContents: cssContents,
              });
            }
            return "";
        }
      }
    );

    rtrn = rtrn.trim().replace(/(;|,|{|})[\n\r ]*/gi, "$1 ");

    rtrn = this.opnClsr.doTask(
      "{",
      "}",
      rtrn,
      (selectorText: string, styleContent: string, count: number): string => {
        if (count == 1) {
          return `${_this.parseScopeSeperator({
            selectorText: selectorText,
            scopeSelectorText: _params.scopeSelectorText,
            parent_stamp: pstamp_key,
            parent_stamp_value: pstamp_val,
          })}{${styleContent}} `;
        } else {
          let changed: boolean = false;
          selectorText.split(",").forEach((pselctor: string) => {
            pselctor.trim().replace(
              patternList.rootExcludePattern,
              (match: string, rootAlices: string, nmode: string) => {
                switch (nmode) {
                  case ":root":
                    changed = true;
                    if (rootAlices == undefined || rootAlices == '') {
                      externalStyles.push(
                        _this.parseStyleSeperator_sub({
                          data: _params.scopeSelectorText + styleContent,
                          callCounter: _params.callCounter,
                          isForRoot: true,
                          _rootinfo: undefined
                        })
                      );
                    } else {
                      /*console.log('-----');
                      console.log(rootAlices);
                      console.log(nmode);
                      console.log(rootPathHandler.getInfoByAlices(
                        rootAlices  // `@${rootAlices}:`
                      ));*/
                      externalStyles.push(
                        _this.parseStyleSeperator_sub({
                          data: _params.scopeSelectorText + styleContent,
                          callCounter: _params.callCounter,
                          isForRoot: true,
                          _rootinfo: rootPathHandler.getInfoByAlices(
                            rootAlices  // `@${rootAlices}:`
                          ),
                        })
                      );
                    }
                    break;
                  case ":exclude":
                    externalStyles.push(styleContent);
                    changed = true;
                    return "";
                }
                return "";
              }
            );
          });
          if (!changed) {
            changed = false;
            let trimSelector: string = selectorText.trim();
            if (trimSelector.startsWith("@keyframes")) {
              return `${trimSelector}_${this.uniqStamp}{${styleContent}} `;
            } else {
              selectorText.replace(
                patternList.subUcFatcher,
                (match: string, quationMark: string, filePath: string, UCselector: string) => {
                  filePath = filePath.toLowerCase();
                  UCselector = UCselector.trim();
                  let tree: stylerRegs = this.children.find(
                    (s: stylerRegs) => s.path == filePath || s.alices == filePath
                  );
                  if (tree != undefined) {
                    let nscope: string =
                      _params.callCounter == 1
                        ? _this.parseScopeSeperator({
                          selectorText: UCselector,
                          parent_stamp: ATTR_OF.UC.UC_STAMP,  // ATTR_OF.UC.UC_STAMP  <- changed dont know why
                          parent_stamp_value: pstamp_val,
                        })
                        : _params.scopeSelectorText;

                    let css: string = tree.parseStyleSeperator_sub({
                      data: styleContent,
                      scopeSelectorText: nscope,
                      callCounter: _params.callCounter,
                    });

                    externalStyles.push(css);
                    changed = true;
                    return "";
                  }
                  return "";
                }
              );
            }
            return !changed ? `${selectorText} ${styleContent}` : "";
          } else return "";
        }
      }
    );
    rtrn = rtrn.replace(
      patternList.varValuePrinterPattern,
      (match: string, varName: string, defaultVal: string) => {
        let ky: string = varName;//.toLowerCase();
        let scope: string = ky.charAt(1);
        let uniqId: string = stylerRegs.internalKey;

        switch (scope) {
          case "g":
            uniqId = '' + this.rootInfo.id;
            break;
          case "t":
            uniqId = this.stamp;
            break;
          case "l":
            uniqId = this.uniqStamp;
            break;
        }

        return stylerRegs.__VAR.GETVALUE(
          ky.substring(3).trim(),
          uniqId,
          scope,
          defaultVal
        ) + ';';
      }
    );
    rtrn = rtrn.replace(
      patternList.stylesFilterPattern,
      (match: string, key: string, value: string) => {
        let ky: string = key.toLowerCase().trim();
        switch (ky) {
          case "animation-name":
            return `${key}: ${value.trimEnd()}_${this.uniqStamp}; `;
          default:
            let scope: string = ky.charAt(1);
            let __ky = ky.substring(3).trim();
            switch (scope) {
              case "g":
                stylerRegs.__VAR.SETVALUE(
                  { __ky : value },
                  '' + this.rootInfo.id,
                  scope
                );
                return "";
              case "t":
                stylerRegs.__VAR.SETVALUE(
                  { __ky : value },
                  this.stamp,
                  scope,
                  _params.localNodeElement
                );
                return "";
              case "l":
                stylerRegs.__VAR.SETVALUE(
                  { __ky : value },
                  this.uniqStamp,
                  scope,
                  _params.localNodeElement
                );
                return "";
              case "i":
                stylerRegs.__VAR.SETVALUE(
                  { __ky : value },
                  stylerRegs.internalKey,
                  scope,
                  _params.localNodeElement
                );
                return "";
            }
            return match;
        }
      }
    );

    return rtrn + " " + externalStyles.join(" ");
  }

  /*initStampObj(): any {
    return {
      ucStampAttr: ATTR_OF.UC.UC_STAMP,
      parentStampAttr: ATTR_OF.UC.PARENT_STAMP,
      ucStampVal: _this.globalStampRow.stamp,
      parentStampVal: _this.globalStampRow.stamp,
    };
  }*/

  static __VAR = {
    getKeyName: (key: string, uniqId: string, code: string): string => {
      return `--${key}${uniqId}${code}`;
    },

    SETVALUE: (vlst:VariableList,/*key: string,*/ uniqId: string, code: string, /*value: string,*/ tarEle: HTMLElement = document.body): void => {
      let style = tarEle.style;
      for (const [key, value] of Object.entries(vlst)) {
        style.setProperty(this.__VAR.getKeyName(key, uniqId, code), value);
      }
      
      return;
    },

    GETVALUE: (key: string, uniqId: string, code: string, defaultVal: string): string => {
      return ` var(${this.__VAR.getKeyName(key, uniqId, code)},${defaultVal}) `;
    },
  };

  parseScopeSeperator({
    selectorText = "",
    scopeSelectorText = "",
    parent_stamp = "",
    parent_stamp_value = undefined,
  } = {}): string {
    let _this = this;
    let rtrn: string = "";
    let changed: boolean = false;
    let trimedVal: string = "";
    let calltime: number = 0;
    let preText: string = "";
    let postText: string = "";
    let rVal: string = "";
    selectorText.split(",").forEach((s: string) => {
      changed = false;
      trimedVal = s.trim();
      calltime = 0;

      rVal = trimedVal.replace(
        patternList.scopeSelector,
        (match: string, offset: any, input_string: string) => {
          changed = true;
          calltime++;

          if (trimedVal == "[SELF_]") {
            return `${scopeSelectorText} ${_this.nodeName}[${ATTR_OF.UC.UC_STAMP}="${_this.uniqStamp}"]`;  //UNIQUE_STAMP ,_this.stamp  <-- i changed dont know why
          } else {
            if (calltime == 1) {
              if (trimedVal.startsWith("[SELF_]")) {
                return `${scopeSelectorText} [${ATTR_OF.UC.UC_STAMP}="${_this.uniqStamp}"]`;  //UNIQUE_STAMP ,_this.stamp  <-- i changed dont know why
              } else {
                preText = scopeSelectorText + " ";
                return `[${parent_stamp}="${parent_stamp_value}"]`;
              }
            } else {
              preText = scopeSelectorText;
              return `[${parent_stamp}="${parent_stamp_value}"]`;
            }
          }
          return match;
        }
      );
      if (!changed) {
        if (parent_stamp_value != undefined) {
          let dbl: string[] = trimedVal.split(/ *:: */);
          let sngl: string[] = dbl[0].split(/ *: */);
          sngl[0] += `[${parent_stamp}="${parent_stamp_value}"]`;
          dbl[0] = sngl.join(":");
          rVal = dbl.join("::");
        } else {
          rVal = trimedVal;
        }
        preText = scopeSelectorText + " ";
      }
      rtrn += preText + "" + rVal + "" + postText + ",";
    });
    rtrn = rtrn.slice(0, -1);
    return rtrn;
  }

  pushChild(path: string, node: stylerRegs, nodeName: string): void {
    let key: string = path.toLowerCase();
    let sreg: stylerRegs = this.children.find((s: stylerRegs) => s.path == key);
    if (sreg == undefined) {
      node.alices = nodeName.toLowerCase();
      node.path = key;
      node.parent = this;
      this.children.push(node);
    }
  }
}