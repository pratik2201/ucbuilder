import { AliceManager } from "ucbuilder/build/codefile/aliceManager";
import { uniqOpt } from "ucbuilder/enumAndMore";
import { RootPathRow, rootPathRow } from "ucbuilder/global/findAndReplace";
import { openCloser } from "ucbuilder/global/openCloser";
import { rootPathHandler } from "ucbuilder/global/rootPathHandler";
import { ATTR_OF } from "ucbuilder/global/runtimeOpt";
import { SourceNode, StampNode } from "ucbuilder/lib/StampGenerator";
import { RootAndExcludeHandler } from "ucbuilder/lib/stylers/RootAndExcludeHandler";
import { SelectorHandler } from "ucbuilder/lib/stylers/SelectorHandler";
import { ThemeCssHandler } from "ucbuilder/lib/stylers/ThemeCssHandler";
import { CssVariableHandler } from "ucbuilder/lib/stylers/CssVariableHandler";
import { OpenCloseHandler } from "ucbuilder/lib/OpenCloseHandler";

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

//   /\@import\s*([\"'`])((?:\\.|(?!\1)[^\\])*)\1\s*;/


export const patternList/*: PatternList */ = {
  //globalFinderPathPattern: /path=(["'`])([\s\S]*?)\1/gim,
  //globalFinderPattern: /(.|\n)<gload([\n\r\w\W.]*?)>/gim,
  styleTagSelector: /<style([\n\r\w\W.]*?)>([\n\r\w\W.]*?)<\/style>/gi,
  MULTILINE_COMMENT_REGS: /\/\*([\s\S]*?)\*\//gi,
  SINGLELINE_COMMENT_REGS: /\/\/.*/mg,
  SPACE_REMOVER_REGS: /(;|,|:|{|})[\n\r ]*/gi,
  subUcFatcher: /\[inside=("|'|`)([\s\S]*?)\1\]([\S\s]*)/gim,
  //themeCSSLoader: /\[(theme|css)=(["'`])*([\s\S]*?)\2\]/gim,
  themeCSSLoader: /\@(import|use)\s*([\"'`])((?:\\.|(?!\2)[^\\])*)\2\s*;/gim,
  mediaSelector: /^\s*@(media|keyframes|supports|container|document)\s+([\s\S]*)\s*/i,
  animationNamePattern: /animation-name\s*:\s*([\w-]+)\s*;/gim,  ///(animation-name|-[lgit]-\w+)\s*:\s*(.*?)\s*;/gim,
  varHandler: /(\$[lgit]-\w+)((?:\s*\:\s*(.*?)\s*;)|(?:\s+(.+?)\s*--)|\s*)/gim,
  //varValuePrinterPattern: /(-[lgit]-\w+)\s*(.*?)--/gim,    //       /var\s*\(\s*(\$[lgit]-\w+)\s*(.*?)\);/gim,
  //varValueGetterPattern: /(\$[lgit]-\w+)\:(.*?)\;/gim,            //      /(\$[lgit]-\w+)\s*\:(.*?)\;/gim,
  //scopeSelector: /\&/gm,
  rootExcludePattern: /(\w*)(:root|:exclude)/gi,
};
export interface StyleSeperatorOptions {
  data: string,
  scopeSelectorText?: string,
  callCounter?: number,
  isForRoot?: boolean,
  _rootinfo?: RootPathRow,
  localNodeElement?: HTMLElement,
  //cssVarStampKey?: string,
}
const styleSeperatorOptions: StyleSeperatorOptions = {
  data: "",
  scopeSelectorText: "",
  callCounter: 0,
  isForRoot: false,
  _rootinfo: Object.assign({}, rootPathRow),
  localNodeElement: undefined,
  //cssVarStampKey: "",
};
export type CSSVariableScope = "global" | "local" | "internal" | "template";
export type CSSVariableScopeSort = "g" | "l" | "i" | "t";
export type CSSSearchAttributeCondition = "*" | "^" | "$";
export class StylerRegs {
  static ScssExtractor(csscontent: string) {
    let ocHandler = new OpenCloseHandler();
    ocHandler.ignoreList.push({ o: `"`, c: `"` },
      { o: `'`, c: `'` },
      { o: "`", c: "`" },
      { o: "/*", c: "*/" });
    return ocHandler.parse({ o: '{', c: '}' }, csscontent);
  }
  /*__VAR = {
    getKeyName: (key: string, uniqId: string, code: CSSVariableScopeSort): string => {
      return `--${key}${uniqId}${code}`;
    },

    SETVALUE: (vlst: VariableList, uniqId: string, code: CSSVariableScopeSort, tarEle: HTMLElement = document.body): void => {
      let style = tarEle.style;
      for (const [key, value] of Object.entries(vlst)) {
        style.setProperty(this.__VAR.getKeyName(key, uniqId, code), value);
      }
      return;
    },

    GETVALUE: (key: string, uniqId: string, code: CSSVariableScopeSort, defaultVal: string): string => {
      return ` var(${this.__VAR.getKeyName(key, uniqId, code)},${defaultVal}) `;
    },
  };*/
  static pushPublicStyles(callback: () => void): void {
    import("ucbuilder/ResourcesUC").then(({ ResourcesUC }) => {
      rootPathHandler.source.forEach((row: RootPathRow) => {
        let _stylepath: string = row.alices + "/styles.scss";

        let node: RootPathRow = row;//rootPathHandler.convertToRow(row, true);
        node.isAlreadyFullPath = true;
        node.stampSRC = StampNode.registerSoruce({
          key: _stylepath,
          root: node,
          accessName: node.alices,
        });
        node.stampSRC.pushCSS(_stylepath, document.body);

        /*if (!node.stampSRC.cssCode.hasContent) {
          node.stampSRC.cssCode.load(FileDataBank.readFile(_stylepath, { replaceContentWithKeys: true }));
          node.stampSRC.cssCode.content = node.stampSRC.styler.parseStyleSeperator_sub({
            data: node.stampSRC.cssCode.originalContent,
          });
        }
        node.stampSRC.loadCSS();*/
        //let styler: StylerRegs = new StylerRegs(node, true);
        //ResourcesUC.styler.pushChild(node.alices, styler, node.alices);
        /*et _data: string = FileDataBank.readFile(_stylepath, {
          isFullPath: false,
          replaceContentWithKeys: true
        });
        if (_data != undefined) {
          LoadGlobal.pushRow({
            url: _stylepath,
            stamp: styler.TEMPLATE_STAMP_KEY,
            cssContents: styler.parseStyleSeperator_sub({ data: _data }),
          });
        }*/
      });
      callback();
    });
  }
  TEMPLATE_STAMP_KEY: string = "";
  LOCAL_STAMP_KEY: string = "";
  get ROOT_STAMP_KEY() { return "" + this.rootInfo.id; }
  controlName: string = '';
  static stampNo: number = 0;
  static stampCallTimes: number = 0;
  aliceMng: AliceManager = new AliceManager();
  rootInfo: RootPathRow = undefined;
  nodeName: string = "";
  parent: StylerRegs = undefined;
  children: StylerRegs[] = [];
  alices: string = "";
  selectorMode: CSSSearchAttributeCondition = '^';
  path: string = "";
  wrapperHT: HTMLElement = undefined;
  templateHT: HTMLElement = undefined;
  main: SourceNode;
  constructor(main: SourceNode, generateStamp: boolean = true) {
    this.main = main;
    this.rootInfo = main.root;
    StylerRegs.stampCallTimes++;
    if (generateStamp)
      StylerRegs.stampNo++;

    this.TEMPLATE_STAMP_KEY = "" + StylerRegs.stampNo;
    this.LOCAL_STAMP_KEY = "" + StylerRegs.stampCallTimes;
    this.nodeName = "f" + uniqOpt.randomNo();
    this.selectorHandler = new SelectorHandler(this);
    this.rootAndExcludeHandler = new RootAndExcludeHandler(this);
    this.themeCssHandler = new ThemeCssHandler(this);
    this.varHandler = new CssVariableHandler(this);
  }
  varHandler: CssVariableHandler;
  selectorHandler: SelectorHandler;
  rootAndExcludeHandler: RootAndExcludeHandler;
  themeCssHandler: ThemeCssHandler;
  cssVars: { key: string; value: string }[] = [];

  /*LoadGlobalPath(data: string): void {
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
  }*/

  parseStyle(data: string): string {
    let _this = this;
    let rtrn: string = data;

    /*let rtrn: string = data.replace(
      patternList.globalFinderPattern,
      (match: string, escapeChar: string, contents: string, offset: any, input_string: string) => {
        if (escapeChar === `\\`) return match;
        _this.LoadGlobalPath(contents);
        return "";
      }
    );*/

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

    //console.log([_args.isForRoot,_args._rootinfo]);
    let _params = Object.assign(Object.assign({}, styleSeperatorOptions), _args);

    _params.callCounter++;
    let externalStyles: string[] = [];
    let pstamp_key: string = ''; //ATTR_OF.UC.PARENT_STAMP;
    let pstamp_val: string = _this.LOCAL_STAMP_KEY;  // _this.stamp  <-- i changed dont know why
    let _curRoot: RootPathRow = _this.rootInfo;


    /*if (_params.isForRoot) {
      //pstamp_key = ATTR_OF.UC.ROOT_STAMP;
      _curRoot = (_params._rootinfo == undefined) ? _this.rootInfo : _params._rootinfo;
      //pstamp_val = '' + _curRoot.id;
    }
    console.log([_curRoot]);*/

    let rtrn: string = _params.data.replace(patternList.MULTILINE_COMMENT_REGS, "");
    rtrn = rtrn.replace(patternList.SINGLELINE_COMMENT_REGS, "");

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
    rtrn = this.opnClsr.doTask("{", "}", rtrn,
      (selectorText: string, styleContent: string, count: number): string => {
        //if (selectorText.startsWith('@keyframes l-rotate')) debugger;
        let excludeContentList = this.rootAndExcludeHandler.checkRoot(selectorText, styleContent, _params);
        if (excludeContentList.length == 0) {
          let trimSelector: string = selectorText.trim();
          let m = trimSelector.match(patternList.mediaSelector);
          if (m != null) {
            let type = '@' + m[1].trim();
            switch (type) {
              case '@media':
              case '@supports':
              case '@container':
              case '@document':
                let csnt = _this.parseStyleSeperator_sub(Object.assign({}, _args, { data: styleContent }));
                return `${trimSelector} { ${csnt} } `;
              case '@keyframes':
                let v = _this.varHandler.GetCSSAnimationName(m[2].trim());
                return `@keyframes ${v} {${styleContent}} `;
            }
          } else {
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
              isForRoot: _params.isForRoot
            })}{${styleContent}}`;
          }
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
            /*else {*/
            /*if (trimSelector.startsWith("@keyframes")) {
              return `${trimSelector}_${this.LOCAL_STAMP_KEY}{${styleContent}} `;
            } else {*/

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
                        })*/`WRAPPER[${ATTR_OF.UC.ALL}='${this.LOCAL_STAMP_KEY}'] `
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
            //}
            return !changed ? `${selectorText} ${styleContent}` : "";
          } else return "";
        }
      }
    );
    /// console.log(extraTextAtBegining);
    rtrn = extraTextAtBegining + '' + rtrn;
    //debugger;

    rtrn = this.varHandler.handlerVariable(rtrn);
    /*rtrn = rtrn.replace(
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
            uniqId = this.TEMPLATE_STAMP_KEY;
            tarEle = _this.wrapperHT;
            break;
          case "l":
            uniqId = this.LOCAL_STAMP_KEY;
            tarEle = _this.wrapperHT;
            break;
          default: return match;
        }
        let key = ky.substring(3).trim();
        StylerRegs.__VAR.SETVALUE({ [key]: value }, uniqId, scope, tarEle);
        return '';
      
    );}*/
    rtrn = rtrn.replace(
      patternList.animationNamePattern,
      (match: string,/* key: string, */ value: string) => {
        //let ky: string = key.toLowerCase().trim();
        _this.varHandler.GetCSSAnimationName(value);
        return `animation-name : ${_this.varHandler.GetCSSAnimationName(value)}; `;

        /*switch (ky) {
          case "animation-name":
           
          default:
            let scope: string = ky.charAt(1);
            let __ky = ky.substring(3).trim();
            console.log(scope);
            
            switch (scope) {
              case "g":
                CssVariableHandler.SetCSSVarValue(
                  { __ky: value },
                   _curRoot.id,
                  scope
                );
                return "";
              case "t":
                CssVariableHandler.SetCSSVarValue(
                  { __ky: value },
                  this.TEMPLATE_STAMP_KEY,
                  scope,
                  _params.localNodeElement
                );
                return "";
              case "l":
                CssVariableHandler.SetCSSVarValue(
                  { __ky: value },
                  this.LOCAL_STAMP_KEY,
                  scope,
                  _params.localNodeElement
                );
                return "";
              case "i":
                CssVariableHandler.SetCSSVarValue(
                  { __ky: value },
                  StylerRegs.internalKey,
                  scope,
                  _params.localNodeElement
                );
                return "";
            }
            return match;
        }*/
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




  pushChild(path: string, node: StylerRegs, accessKey: string): void {
    let key: string = path.toLowerCase();
    let sreg: StylerRegs = this.children.find((s: StylerRegs) => s.path == key);
    if (sreg == undefined) {
      node.alices = accessKey.toLowerCase();
      node.path = key;
      node.parent = this;
      this.children.push(node);
    }
    node.parent = this;
  }
}