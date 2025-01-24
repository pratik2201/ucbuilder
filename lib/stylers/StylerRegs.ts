import { AliceManager } from "ucbuilder/build/codefile/aliceManager";
import { uniqOpt } from "ucbuilder/enumAndMore";
import { LoadGlobal } from "ucbuilder/lib/loadGlobal";
import { FileDataBank } from "ucbuilder/global/fileDataBank";
import { openCloser } from "ucbuilder/global/openCloser";
import { rootPathHandler } from "ucbuilder/global/rootPathHandler";
import { ATTR_OF } from "ucbuilder/global/runtimeOpt";
import { RootPathRow, rootPathRow } from "ucbuilder/global/findAndReplace";
import { scopeSelectorOptions, ScopeSelectorOptions, SelectorHandler } from "ucbuilder/lib/stylers/SelectorHandler";
import { RootAndExcludeHandler } from "ucbuilder/lib/stylers/RootAndExcludeHandler";
import { ThemeCssHandler } from "ucbuilder/lib/stylers/ThemeCssHandler";
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

export const patternList/*: PatternList */ = {
  globalFinderPathPattern: /path=(["'`])([\s\S]*?)\1/gim,
  globalFinderPattern: /(.|\n)<gload([\n\r\w\W.]*?)>/gim,
  styleTagSelector: /<style([\n\r\w\W.]*?)>([\n\r\w\W.]*?)<\/style>/gi,
  MULTILINE_COMMENT_REGS: /\/\*([\s\S]*?)\*\//gi,
  SINGLELINE_COMMENT_REGS:  /\/\/.*/mg,
  SPACE_REMOVER_REGS:/(;|,|:|{|})[\n\r ]*/gi,
  subUcFatcher: /\[inside=("|'|`)([\s\S]*?)\1\]([\S\s]*)/gim,
  themeCSSLoader: /\[(theme|css)=(["'`])*([\s\S]*?)\2\]/gim,
  stylesFilterPattern: /(animation-name|\$[lgit]-\w+)\s*:\s*(.*?)\s*;/gim,
  varValuePrinterPattern: /(-[lgit]-\w+)\s*(.*?)--/gim ,    //       /var\s*\(\s*(\$[lgit]-\w+)\s*(.*?)\);/gim,
  varValueGetterPattern: /(\$[lgit]-\w+)\:(.*?)\;/gim,            //      /(\$[lgit]-\w+)\s*\:(.*?)\;/gim,
  scopeSelector: /\[SELF_]/gm,
  rootExcludePattern: /(\w*)(:root|:exclude)/gi,
};
export interface StyleSeperatorOptions {
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
    this.rootAndExcludeHandler = new RootAndExcludeHandler(this);
    this.themeCssHandler= new ThemeCssHandler(this);
  }
  selectorHandler: SelectorHandler;
  rootAndExcludeHandler: RootAndExcludeHandler;
  themeCssHandler: ThemeCssHandler;
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
    let _params = Object.assign(Object.assign({}, styleSeperatorOptions), _args);

    _params.callCounter++;
    let externalStyles: string[] = [];
    let pstamp_key: string = ''; //ATTR_OF.UC.PARENT_STAMP;
    let pstamp_val: string = _this.uniqStamp;  // _this.stamp  <-- i changed dont know why
    let _curRoot: RootPathRow = _this.rootInfo;
    if (_params.isForRoot) {
      //pstamp_key = ATTR_OF.UC.ROOT_STAMP;
      _curRoot = (_params._rootinfo == undefined) ? _this.rootInfo : _params._rootinfo;
      //pstamp_val = '' + _curRoot.id;
    }
    let rtrn: string = _params.data.replace(patternList.MULTILINE_COMMENT_REGS, "");
     rtrn = rtrn.replace(patternList.SINGLELINE_COMMENT_REGS , "");
    
    rtrn = _this.themeCssHandler.match(rtrn);

    /*rtrn = rtrn.replace(
      patternList.themeCSSLoader,
      (match: string, code: string, quationMark: string, path: string, offset: any, input_string: string) => {
        isChffd = true;
        switch (code) {
          case "theme":
            //if (path.indexOf('voucherexpenseitem.tpt@ledger')!=-1) debugger;
            let themecontents = FileDataBank.readFile(path, {
              isFullPath: false,
              replaceContentWithKeys: true
            });
            return themecontents;
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
    );*/

    //rtrn = rtrn.trim().replace(/(;|,|{|})[\n\r ]*/gi, "$1 ");   // remove this comment it was old code
    rtrn = rtrn.trim().replace(patternList.SPACE_REMOVER_REGS, "$1");   // remove this comment it was old code

    let extraTextAtBegining = "";
    rtrn = this.opnClsr.doTask(
      "{",
      "}",
      rtrn,
      (selectorText: string, styleContent: string, count: number): string => {
        let excludeContentList = this.rootAndExcludeHandler.checkRoot(selectorText, styleContent, _params);
       
        if (excludeContentList.length == 0) {
          
          let sel = '';
          selectorText = selectorText.replace(/(.*?)([^;]*?)$/gim, (m, extraText, slctr) => {
            extraTextAtBegining += " " + extraText;
            sel += slctr;
            return '';
          });
          sel = sel.trim();         
          return `${_this.selectorHandler.parseScopeSeperator({
            selectorText: sel,
            scopeSelectorText: _params.scopeSelectorText,
            /*parent_stamp: pstamp_key,
            parent_stamp_value: pstamp_val,*/
            root: _curRoot,
            isForRoot:_params.isForRoot
          })}{${styleContent}}`;
        } else {
          let changed: boolean = false;
          //let selList = this.rootAndExcludeHandler.checkRoot(selectorText, styleContent, _params);
          changed = excludeContentList.length != 0;
          excludeContentList.fillInto(externalStyles);
          //#region  old
          // selectorText.split(",").forEach((pselctor: string) => {
          //   pselctor.trim().replace(
          //     patternList.rootExcludePattern,
          //     (match: string, rootAlices: string, nmode: string) => {
          //       console.log(match);
               
          //       switch (nmode) {
          //         case ":root":
          //          if (rootAlices == undefined || rootAlices == '') {
          //           changed = true;
          //           externalStyles.push(
          //               _this.parseStyleSeperator_sub({
          //                 data: _params.scopeSelectorText + styleContent,
          //                 callCounter: _params.callCounter,
          //                 isForRoot: true,
          //                 _rootinfo: undefined
          //               })
          //             );
          //           } else {  
          //             let rInfo = rootPathHandler.getInfoByAlices(
          //               rootAlices  // `@${rootAlices}:`
          //             );
          //             if (rInfo != undefined) {
          //               externalStyles.push(
          //                 _this.parseStyleSeperator_sub({
          //                   data: _params.scopeSelectorText + styleContent,
          //                   callCounter: _params.callCounter,
          //                   isForRoot: true,
          //                   _rootinfo: rInfo,
          //                 })
          //               );
          //             }
          //           }
          //           break;
          //         case ":exclude":
          //           externalStyles.push(styleContent);
          //           changed = true;
          //           return "";
          //       }
          //       return "";
          //     }
          //   );
          // });
          //#endregion          
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
                        ? /*_this.selectorHandler.parseScopeSeperator({
                          selectorText: UCselector,
                          scopeSelectorText:_params.scopeSelectorText,
                          parent_stamp:'',// ATTR_OF.UC.UC_STAMP,  REMOVED  // ATTR_OF.UC.UC_STAMP  <- changed dont know why
                          parent_stamp_value: pstamp_val,
                          root:_curRoot,
                          isForRoot:_params.isForRoot
                        })*/`WRAPPER[${ATTR_OF.UC.ALL}='${this.uniqStamp}'] `
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
        //console.log(['printer',patternList.varValuePrinterPattern,varName,defaultVal,match]);
        
        switch (scope) {
          case "g":
            uniqId = '' + _curRoot.id;
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
        ) /*+ ';'*/;
      }
    );
    rtrn = rtrn.replace(
      patternList.varValueGetterPattern,
      (match: string, varName: string, value: string) => {
      //  console.log(['getter',varName,value,match]);
        
        let ky: string = varName;//.toLowerCase();
        let scope: string = ky.charAt(1);
        let uniqId: string = StylerRegs.internalKey;
        let tarEle: HTMLElement = undefined;
        // debugger;
        switch (scope) {
          case "g":
            uniqId = '' + _curRoot.id;
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
                  '' + _curRoot.id,
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
    //rtrn = rtrn.trim().replace(/(;|,|:|{|})[\n\r ]*/gi, "$1");
    return rtrn + "" + externalStyles.join("");//.trim().replace(/(;|,|{|})[\n\r ]*/gi, "$1");
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