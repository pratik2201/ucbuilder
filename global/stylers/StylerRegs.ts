import { AliceManager } from "ucbuilder/build/codefile/aliceManager";
import { uniqOpt } from "ucbuilder/build/common";
import { LoadGlobal } from "ucbuilder/global/loadGlobal";
import { FileDataBank } from "ucbuilder/global/fileDataBank";
import { openCloser } from "ucbuilder/global/openCloser";
import { rootPathHandler } from "ucbuilder/global/rootPathHandler";
import { ATTR_OF } from "ucbuilder/global/runtimeOpt";
import { RootPathRow, rootPathRow } from "ucbuilder/global/findAndReplace";
import { scopeSelectorOptions, ScopeSelectorOptions, SelectorHandler } from "ucbuilder/global/stylers/SelectorHandler";
export type VariableList = { [key: string]: string };

/*interface PatternList {
  globalFinderPathPattern: RegExp;
  globalFinderPattern: RegExp;
  styleTagSelector: RegExp;
  styleCommentRegs: RegExp;
  subUcFatcher: RegExp;
  themeCSSLoader: RegExp;
  stylesFilterPattern: RegExp;
  varValuePrinterPattern: RegExp;
  varValueGetterPattern: RegExp;
  scopeSelector: RegExp;
  rootExcludePattern: RegExp;
}*/

const patternList/*: PatternList */ = {
  globalFinderPathPattern: /path=(["'`])([\s\S]*?)\1/gim,
  globalFinderPattern: /(.|\n)<gload([\n\r\w\W.]*?)>/gim,
  styleTagSelector: /<style([\n\r\w\W.]*?)>([\n\r\w\W.]*?)<\/style>/gi,
  styleCommentRegs: /\/\*([\s\S]*?)\*\//gi,
  subUcFatcher: /\[inside=("|'|`)([\s\S]*?)\1\]([\S\s]*)/gim,
  themeCSSLoader: /\[(theme|css)=(["'`])*([\s\S]*?)\2\]/gim,
  stylesFilterPattern: /(animation-name|\$[lgit]-\w+)\s*:\s*(.*?)\s*;/gim,
  varValuePrinterPattern: /var\s*\(\s*(\$[lgit]-\w+)\s*(.*?)\)\s*\;/gim,
  varValueGetterPattern: /(\$[lgit]-\w+)\s*\:(.*?)\;/gim,
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
export class StylerRegs {
  static pushPublicStyles(callback: () => void): void {
    import("ucbuilder/ResourcesUC").then(({ ResourcesUC }) => {
      rootPathHandler.source.forEach((row: RootPathRow) => {
        let _stylepath: string = row.tInfo.replaceWith + "/styles.scss"; //row.tInfo.replaceLowerCaseText + "/styles.scss";
        //console.log('==>'+_stylepath);

        let node: RootPathRow = row;//rootPathHandler.convertToRow(row, true);
        node.isAlreadyFullPath = true;
        let styler: StylerRegs = new StylerRegs(node, true);
        ResourcesUC.styler.pushChild(node.alices, styler, node.alices);

        let _data: string = FileDataBank.readFile(_stylepath, {
          isFullPath: false,
          replaceContentWithKeys: true
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
  controlName: string = '';
  static stampNo: number = 0;
  static stampCallTimes: number = 0;
  aliceMng: AliceManager = new AliceManager();
  rootInfo: RootPathRow = undefined;
  nodeName: string = "";
  parent: StylerRegs = undefined;
  children: StylerRegs[] = [];
  alices: string = "";
  path: string = "";
  wrapperHT: HTMLElement = undefined;
  templateHT: HTMLElement = undefined;
  constructor(rootInfo?: RootPathRow, generateStamp: boolean = true) {
    this.rootInfo = rootInfo;

    StylerRegs.stampCallTimes++;
    if (generateStamp)
      StylerRegs.stampNo++;

    this.stamp = "" + StylerRegs.stampNo;
    this.uniqStamp = "" + StylerRegs.stampCallTimes;
    this.nodeName = "f" + uniqOpt.randomNo();
    this.selectorHandler = new SelectorHandler(this);
    
  }
  selectorHandler: SelectorHandler;
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
            return FileDataBank.readFile(path, {
              isFullPath: false,
              replaceContentWithKeys: true
            });
          case "css":
            let isGoodToAdd: boolean = LoadGlobal.isGoodToPush(path);
            if (isGoodToAdd) {
              let cssContents: string = _this.parseStyleSeperator_sub({
                data: FileDataBank.readFile(path, {
                  isFullPath: false,
                  replaceContentWithKeys: true
                }),
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

    //rtrn = rtrn.trim().replace(/(;|,|{|})[\n\r ]*/gi, "$1 ");   // remove this comment it was old code
    rtrn = rtrn.trim().replace(/(;|,|{|})[\n\r ]*/gi, "$1 ");   // remove this comment it was old code

    //rtrn = rtrn.trim().replace(/\s+/g, " ");
    // console.log(rtrn);

    let extraTextAtBegining = "";
    rtrn = this.opnClsr.doTask(
      "{",
      "}",
      rtrn,
      (selectorText: string, styleContent: string, count: number): string => {
        if (count == 1) {
          let sel = '';
          //console.log("<==================== ");
          selectorText = selectorText.replace(/(.*?)([^;]*?)$/gim, (m, extraText, slctr) => {
            extraTextAtBegining += " " + extraText;
            //  console.log([m,extraText, slctr]);
            //  console.log(slctr);
            sel += slctr;
            return '';
          });
          sel = sel.trim();
          //console.log(sel);
          //if (sel == '[SELF_]:focus-within title-text[SELF_]') debugger;
          //console.log("=======>  "+_params.scopeSelectorText);

          // console.log(sel);
          // console.log(styleContent);
          return `${_this.selectorHandler.parseScopeSeperator({
            selectorText: sel,
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
                  let tree: StylerRegs = this.children.find(
                    (s: StylerRegs) => s.path == filePath || s.alices == filePath
                  );
                  if (tree != undefined) {
                    let nscope: string =
                      _params.callCounter == 1
                        ? _this.selectorHandler.parseScopeSeperator({
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
    /// console.log(extraTextAtBegining);
    rtrn = extraTextAtBegining + '' + rtrn;
    //debugger;
    rtrn = rtrn.replace(
      patternList.varValuePrinterPattern,
      (match: string, varName: string, defaultVal: string) => {
        let ky: string = varName;//.toLowerCase();
        let scope: string = ky.charAt(1);
        let uniqId: string = StylerRegs.internalKey;
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
        return StylerRegs.__VAR.GETVALUE(
          ky.substring(3).trim(),
          uniqId,
          scope,
          defaultVal
        ) + ';';
      }
    );
    rtrn = rtrn.replace(
      patternList.varValueGetterPattern,
      (match: string, varName: string, value: string) => {

        let ky: string = varName;//.toLowerCase();
        let scope: string = ky.charAt(1);
        let uniqId: string = StylerRegs.internalKey;
        let tarEle: HTMLElement = undefined;
        // debugger;
        switch (scope) {
          case "g":
            uniqId = '' + _this.rootInfo.id;
            break;
          case "t":
            uniqId = this.stamp;
            tarEle = _this.wrapperHT;
            break;
          case "l":
            uniqId = this.uniqStamp;
            tarEle = _this.wrapperHT;
            break;
          default: return match;
        }
        let key = ky.substring(3).trim();
        StylerRegs.__VAR.SETVALUE({ [key]: value }, uniqId, scope, tarEle);
        return '';
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
                StylerRegs.__VAR.SETVALUE(
                  { __ky: value },
                  '' + this.rootInfo.id,
                  scope
                );
                return "";
              case "t":
                StylerRegs.__VAR.SETVALUE(
                  { __ky: value },
                  this.stamp,
                  scope,
                  _params.localNodeElement
                );
                return "";
              case "l":
                StylerRegs.__VAR.SETVALUE(
                  { __ky: value },
                  this.uniqStamp,
                  scope,
                  _params.localNodeElement
                );
                return "";
              case "i":
                StylerRegs.__VAR.SETVALUE(
                  { __ky: value },
                  StylerRegs.internalKey,
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

    SETVALUE: (vlst: VariableList,/*key: string,*/ uniqId: string, code: string, /*value: string,*/ tarEle: HTMLElement = document.body): void => {
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
  giveContents(contents) {
    let oc = new openCloser();
    let rtrn = oc.doTask('(', ')', contents, (selector, cssStyle, opened) => {
      if (opened > 1) {
        if (selector.endsWith(':has')) {
          cssStyle = this.giveContents(cssStyle);
        } else {
          return selector + '(' + cssStyle + ')';
        }
      }
      if (selector.endsWith(':has')) {
        return selector + '<' + cssStyle + '>';
      } else {
        return selector + '(' + cssStyle + ')';
      }

    });
    return rtrn;
  }
  parseScopeSeperator(scopeOpt:ScopeSelectorOptions): string {
    scopeOpt = Object.assign(Object.assign({}, scopeSelectorOptions),scopeOpt);
    let oc = new openCloser();
    let rtrn = oc.doTask('(', ')', scopeOpt.selectorText, (selector, cssStyle, opened) => {
      if (opened > 1) {
        if (selector.endsWith(':has')) {
          cssStyle = this.giveContents(cssStyle);
        } else {
          return selector + '(' + cssStyle + ')';
        }
      }
      if (selector.endsWith(':has')) {
        this.splitselector({
          selectorText: cssStyle,
          scopeSelectorText: scopeOpt.scopeSelectorText,
          parent_stamp: scopeOpt.parent_stamp,
          parent_stamp_value: scopeOpt.parent_stamp_value,
        });
        return selector + '<' +  + '>';
      } else {
        return selector + '(' + cssStyle + ')';
      }

    });
    
    let sub = this.parseScopeSeperator_sub({
      selectorText: scopeOpt.selectorText,
      scopeSelectorText: scopeOpt.scopeSelectorText,
      parent_stamp: scopeOpt.parent_stamp,
      parent_stamp_value: scopeOpt.parent_stamp_value,
    });
    return sub;
  }
  splitselector(scopeOpt:ScopeSelectorOptions) {
    scopeOpt = Object.assign(Object.assign({}, scopeSelectorOptions),scopeOpt);
    console.log(this.parseScopeSeperator_sub(scopeOpt));
    
    
  }
  parseScopeSeperator_sub(scopeOpt:ScopeSelectorOptions): string {    
    scopeOpt = Object.assign(Object.assign({}, scopeSelectorOptions),scopeOpt);
    let _this = this;
    let rtrn: string = "";
    let changed: boolean = false;
    let trimedVal: string = "";
    let calltime: number = 0;
    let preText: string = "";
    let postText: string = "";
    let rVal: string = "";
    //if (selectorText.startsWithI('[SELF_]:focus-within title-text')) debugger;
    scopeOpt.selectorText.split(",").forEach((s: string) => {
      changed = false;
      trimedVal = s.trim();
      calltime = 0;
      if (trimedVal == "[SELF_]") {
        changed = true;
        calltime++;
        rVal = `${scopeOpt.scopeSelectorText} ${_this.nodeName}[${ATTR_OF.UC.UC_STAMP}="${_this.uniqStamp}"]`;  //UNIQUE_STAMP ,_this.stamp  <-- i changed dont know why
      } else {
      //  console.log(trimedVal);
      //  console.log(trimedVal.split(' '));

        // trimedVal.split(' ').forEach((val) => {
        //   changed = true;
        //   calltime++;
        //   console.log(val);

        //   if (calltime == 1) {
        //     /*if (trimedVal.startsWith("[SELF_]")) {
        //       return `${scopeSelectorText} ${_this.nodeName}[${ATTR_OF.UC.UC_STAMP}="${_this.uniqStamp}"]`; 
        //     }*/
        //   }
        // })
        rVal = trimedVal.replace(
          patternList.scopeSelector,
          (match: string, offset: any, input_string: string) => {
            changed = true;
            calltime++;

            /*if (trimedVal == "[SELF_]") {
              return `${scopeSelectorText} ${_this.nodeName}[${ATTR_OF.UC.UC_STAMP}="${_this.uniqStamp}"]`;  //UNIQUE_STAMP ,_this.stamp  <-- i changed dont know why
            } else {*/
            if (calltime == 1) {
              if (trimedVal.startsWith("[SELF_]")) {
                return `${scopeOpt.scopeSelectorText} [${ATTR_OF.UC.UC_STAMP}="${_this.uniqStamp}"]`;  //UNIQUE_STAMP ,_this.stamp  <-- i changed dont know why
              } else {
                preText = scopeOpt.scopeSelectorText + " ";
                return `[${scopeOpt.parent_stamp}="${scopeOpt.parent_stamp_value}"]`;
              }
            } else {
              preText = scopeOpt.scopeSelectorText;
              return `[${scopeOpt.parent_stamp}="${scopeOpt.parent_stamp_value}"]`;
            }
            /*}*/
            return match;
          }
        );
      }
      if (!changed) {
        if (scopeOpt.parent_stamp_value != undefined) {
          let dbl: string[] = trimedVal.split(/ *:: */);
          let sngl: string[] = dbl[0].split(/ *: */);
          sngl[0] += `[${scopeOpt.parent_stamp}="${scopeOpt.parent_stamp_value}"]`;
          dbl[0] = sngl.join(":");
          rVal = dbl.join("::");
        } else {
          rVal = trimedVal;
        }
        preText = scopeOpt.scopeSelectorText + " ";
      }
      rtrn += preText + "" + rVal + "" + postText + ",";
    });

    rtrn = rtrn.slice(0, -1);
    return rtrn;
  }

  pushChild(path: string, node: StylerRegs, nodeName: string): void {
    let key: string = path.toLowerCase();
    let sreg: StylerRegs = this.children.find((s: StylerRegs) => s.path == key);
    if (sreg == undefined) {
      node.alices = nodeName.toLowerCase();
      node.path = key;
      node.parent = this;
      this.children.push(node);
    }
  }
}