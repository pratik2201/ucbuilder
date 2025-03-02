import { AliceManager } from "ucbuilder/build/codefile/aliceManager";
import { uniqOpt } from "ucbuilder/enumAndMore";
import { RootPathRow, rootPathRow } from "ucbuilder/global/findAndReplace";
import { openCloser } from "ucbuilder/global/openCloser";
import { rootPathHandler } from "ucbuilder/global/rootPathHandler";
import { ATTR_OF } from "ucbuilder/global/runtimeOpt";
import { SourceNode, StampNode } from "ucbuilder/lib/StampGenerator";
import { FileDataBank } from "ucbuilder/global/fileDataBank";
import { OpenCloseHandler } from "ucbuilder/lib/OpenCloseHandler";
export type VariableList = { [key: string]: string };
export const patternList/*: PatternList */ = {
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
export interface IStyleSeperatorOptions {
  data: string,
  scopeSelectorText?: string,
  callCounter?: number,
  isForRoot?: boolean,
  _rootinfo?: RootPathRow,
  localNodeElement?: HTMLElement,
  //cssVarStampKey?: string,
}
const StyleSeperatorOptions: IStyleSeperatorOptions = {
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



  parseStyle(data: string): string {
    let _this = this;
    let rtrn: string = data;


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
  static REMOVE_COMMENT(rtrn: string): string {
    return rtrn.replace(patternList.MULTILINE_COMMENT_REGS, "")
      .replace(patternList.SINGLELINE_COMMENT_REGS, "");
  } static REMOVE_EXTRASPACE(rtrn: string): string {
    return rtrn.replace(patternList.SPACE_REMOVER_REGS, "$1");
  }
  parseStyleSeperator_sub(_args: IStyleSeperatorOptions): string {
    let _this = this;

    if (_args.data == undefined) return "";

    let _params = Object.assign(Object.assign({}, StyleSeperatorOptions), _args);

    _params.callCounter++;
    let externalStyles: string[] = [];
    let pstamp_key: string = ''; //ATTR_OF.UC.PARENT_STAMP;
    let pstamp_val: string = _this.LOCAL_STAMP_KEY;  // _this.stamp  <-- i changed dont know why
    let _curRoot: RootPathRow = _this.rootInfo;

    let rtrn = StylerRegs.REMOVE_COMMENT(_params.data);
    rtrn = StylerRegs.REMOVE_EXTRASPACE(_this.themeCssHandler.match(rtrn));


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

          if (!changed) {
            changed = false;

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
    rtrn = rtrn.replace(
      patternList.animationNamePattern,
      (match: string,/* key: string, */ value: string) => {
        //let ky: string = key.toLowerCase().trim();
        _this.varHandler.GetCSSAnimationName(value);
        return `animation-name : ${_this.varHandler.GetCSSAnimationName(value)}; `;
      }
    );
    //rtrn = rtrn.trim().replace(/(;|,|:|{|})[\n\r ]*/gi, "$1");
    return rtrn + "" + externalStyles.join("");//.trim().replace(/(;|,|{|})[\n\r ]*/gi, "$1");
  }



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


export interface IHiddenScopeKVP {
  [key: string]: {
    selector?: string;
    funcName?: string;
    value: string;
  };
}
export interface IHiddenScopeNode {
  list: IHiddenScopeKVP;
  root: RootPathRow;
  isForRoot: boolean; scopeSelectorText?: string;
  counter: number;
}

export class RootAndExcludeHandler {
  main: StylerRegs;
  constructor(main: StylerRegs) {
    this.main = main;
  }
  rootExcludePattern: RegExp;
  checkRoot(selectorText: string, styleContent: string, _params: IStyleSeperatorOptions): string[] {
    if (selectorText.match(patternList.rootExcludePattern) == null) return [];
    // debugger;
    let changed = false;
    let _this = this;
    let externalStyles: string[] = [];
    let selectors = selectorText.split(",");
    for (let i = 0; i < selectors.length; i++) {
      const pselctor = selectors[i];
      pselctor.trim().replace(
        patternList.rootExcludePattern,
        (match: string, rootAlices: string, nmode: string) => {

          switch (nmode) {
            case ":root":
              if (rootAlices == undefined || rootAlices == '') {
                changed = true;
                externalStyles.push(
                  _this.main.parseStyleSeperator_sub({
                    data: _params.scopeSelectorText + styleContent,
                    callCounter: _params.callCounter,
                    isForRoot: true,
                    _rootinfo: undefined
                  })
                );
              } else {
                let rInfo = rootPathHandler.getInfoByAlices(
                  rootAlices // `@${rootAlices}:`
                );
                if (rInfo != undefined) {

                  externalStyles.push(
                    _this.main.parseStyleSeperator_sub({
                      data: _params.scopeSelectorText + styleContent,
                      callCounter: _params.callCounter,
                      isForRoot: true,
                      _rootinfo: rInfo,
                    })
                  );
                }
              }
              break;
            case ":exclude":
              externalStyles.push(styleContent);
              return "";
          }
          return "";
        }
      );
    }
    return externalStyles;
  }
}




export class ThemeCssHandler {
  main: StylerRegs;
  constructor(main: StylerRegs) {
    this.main = main;
  }
  match(rtrn: string): string {
    let _this = this;
    rtrn = rtrn.replace(
      patternList.themeCSSLoader,
      (match: string, code: string, quationMark: string, path: string, offset: any, input_string: string) => {
        switch (code) {
          case "use":
            //if (path.indexOf('voucherexpenseitem.tpt@ledger')!=-1) debugger;
            let themecontents = FileDataBank.readFile(path, {
              isFullPath: false,
              replaceContentWithKeys: true
            });
            themecontents = _this.match(themecontents);
            //console.log(Template.splitCSSById(themecontents,));
            _this.main.main.onRelease
            return themecontents;
          case "import":
            //console.log(path);
            let node: RootPathRow = rootPathHandler.getInfo(path);//rootPathHandler.convertToRow(row, true);
            node.isAlreadyFullPath = true;
            let stpSrc = StampNode.registerSoruce({
              key: path,
              root: node,
              accessName: '',
            });
            stpSrc.pushCSS(path);
            _this.main.main.onRelease.push(() => {
              stpSrc.release();
            });

            return "";
        }
      }
    );
    return rtrn;
  }
}

export const ScopeSelectorOptions: IScopeSelectorOptions = {
  selectorText: "",
  scopeSelectorText: "",
  //parent_stamp?: "",
  //parent_stamp_value?: undefined,
  root: undefined,
  isForRoot: false,
  hiddens: {
    root: undefined,
    list: {},
    isForRoot: false,
    counter: 0,
  }
};
export interface HiddenScopeKVP {
  [key: string]: {
    selector?: string;
    funcName?: string;
    value: string;
  };
}
export interface IScopeSelectorOptions {
  selectorText: string;
  scopeSelectorText?: string;
  isForRoot: boolean;
  root: RootPathRow;
  hiddens?: IHiddenScopeNode;
}
export class SelectorHandler {
  main: StylerRegs;
  constructor(main: StylerRegs) {
    this.main = main;
  }
  /*giveContents(contents) {
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
  }*/
  parseScopeSeperator(scopeOpt: IScopeSelectorOptions): string {
    //return this.parseScopeSeperator_sub(scopeOpt)
    /* if (scopeOpt.selectorText === '& mainContainer') {
         debugger;
     }*/
    scopeOpt = Object.assign(ScopeSelectorOptions, scopeOpt);
    scopeOpt.hiddens.root = scopeOpt.root;
    scopeOpt.hiddens.scopeSelectorText = scopeOpt.scopeSelectorText;
    scopeOpt.hiddens.isForRoot = scopeOpt.isForRoot;
    if (scopeOpt.selectorText.trim() == '') return '';
    let counter = scopeOpt.hiddens.counter;
    let _this = this;
    let oldSelector = scopeOpt.selectorText;
    // if (scopeOpt.selectorText.includes('forms') /*&& sub.indexOf('◄◘') != -1*/) {
    //     if (counter == 0) {
    //         console.log(this.main);
    //     }
    // }
    let oc = new openCloser();
    //let hiddens: {key:string,value:string}[] = []
    let rtrn = oc.doTask('(', ')', scopeOpt.selectorText, (selector, cssStyle, opened) => {
      if (opened > 1) {
        if (selector.endsWith(':has')) {
          scopeOpt.selectorText = cssStyle;
          let key = _this.KEY(scopeOpt.hiddens);
          cssStyle = _this.parseScopeSeperator(scopeOpt);
          scopeOpt.hiddens.list[key] = { selector: cssStyle, funcName: 'has', value: '(' + cssStyle + ')' };
          return selector + '' + key;
        } else {
          return selector + '(' + cssStyle + ')';
        }
      }
      if (selector.endsWith(':has')) {
        //let n = Object.assign({}, scopeOpt);
        scopeOpt.selectorText = cssStyle;
        // let scss = cssStyle; // this.parseScopeSeperator_sub(n);
        let key = _this.KEY(scopeOpt.hiddens);
        scopeOpt.hiddens.list[key] = { selector: cssStyle, funcName: 'has', value: '(' + cssStyle + ')' };
        return selector + '' + key;
      } else {
        return selector + '(' + cssStyle + ')';
      }

    });
    //let n = Object.assign({}, scopeOpt);
    scopeOpt.selectorText = rtrn;
    if (counter == 0) {
      rtrn = this.loopMultipleSelectors(rtrn, /*this.main,*/ scopeOpt.hiddens);
      //console.log([oldSelector, rtrn]);
      scopeOpt.hiddens.list = {};
      scopeOpt.hiddens.counter = 0;
    }

    //let sub = this.parseScopeSeperator_sub(scopeOpt);
    // console.log([sub, rtrn]);
    return rtrn;
  }
  loopMultipleSelectors(selector: string, /*stylers: StylerRegs,*/ hiddens: IHiddenScopeNode): string {
    let selectors = selector.split(',');
    let rtrn = [];
    for (let i = 0, len = selectors.length; i < len; i++) {
      rtrn.push(this.splitselector(selectors[i], /*stylers,*/ hiddens));
    }
    return rtrn.join(',');
  }
  KEY(hiddens: IHiddenScopeNode) {
    hiddens.counter++;
    return '◄◘' + hiddens.counter + '◘▀';
  }
  splitselector(selector: string, hiddens: IHiddenScopeNode): string {
    //if (selector.trim().startsWith('&winFrame1')) debugger;
    //console.log(selector, hiddens);     
    let splitted = selector.split(' ');
    let hasUcFound = false;
    let kvNode: string;
    let _this = this;
    let nSelector = '';
    let isStartWithSubUc = false;
    let sub_styler: StylerRegs = undefined;
    for (let i = 0, len = splitted.length; i < len; i++) {
      let sel = splitted[i];
      hasUcFound = false; sub_styler = undefined;
      let matchs = sel.replace(/^&(\w+)/gm, (s, ucName) => {
        sub_styler = _this.main.children.find(s => s.controlName === ucName);
        hasUcFound = (sub_styler != undefined);
        if (hasUcFound) {
          isStartWithSubUc = (i == 0);
          // styler = sub_styler;
          let nnode = `${sub_styler.nodeName}[${ATTR_OF.UC.ALL}="${sub_styler.LOCAL_STAMP_KEY}"]`;
          let key = _this.KEY(hiddens);
          kvNode = key;
          hiddens.list[kvNode] = { value: nnode };
          return key;
        } else return s;
      });
      if (hasUcFound) {
        splitted[i] = matchs;
        let nextSplitters = splitted.slice(i);
        let subSelector = nextSplitters.join(' ');
        splitted[i] = sub_styler.selectorHandler.splitselector(subSelector.replace(kvNode, '&'), /*sub_styler,*/ hiddens);
        hasUcFound = false;
        splitted = splitted.slice(0, i + 1);
        break;

      } else {
        let ntext = splitted[i];
        ntext = ntext.replace(/◄◘(\d+)◘▀/gm, (r) => {
          return '(' + _this.loopMultipleSelectors(hiddens.list[r].selector, /* styler,*/ hiddens) + ')';
        });
        splitted[i] = ntext;
      }
    }
    if (isStartWithSubUc) splitted.unshift('&');
    let styler = this.main;
    splitted = splitted.filter(word => word !== "");
    let len = splitted.length;
    let fsel = '';
    let code: CSSSearchAttributeCondition = this.main.selectorMode;
    let keyval = styler.LOCAL_STAMP_KEY + '_';
    if (code == '*') keyval = '_' + styler.TEMPLATE_STAMP_KEY + '_';
    else code = '^';
    if (hiddens.isForRoot) {
      fsel = splitted[len - 1];
      splitted[len - 1] = this.SELECTOR_CONDITION(fsel, '$', "_" + hiddens.root.id); // ATTR_OF.UC.CLASS_ROOT+''+hiddens.root.id
    } else {
      fsel = splitted[0];

      switch (len) {
        case 1:
          if (fsel.startsWith('&'))
            splitted[0] = fsel.replace('&', `WRAPPER[${ATTR_OF.UC.ALL}="${styler.LOCAL_STAMP_KEY}"]`); //`WRAPPER.${ATTR_OF.UC.UC_STAMP+''+styler.uniqStamp}` 
          else {
            //if (!isStartWithSubUc) {
            splitted[0] = this.SELECTOR_CONDITION(fsel, code, keyval); //ATTR_OF.UC.CLASS_PARENT+''+styler.uniqStamp

            //}
          }
          break;
        default:
          if (fsel.startsWith('&'))
            splitted[0] = fsel.replace('&', `WRAPPER[${ATTR_OF.UC.ALL}="${styler.LOCAL_STAMP_KEY}"]`); //   // `WRAPPER.${ATTR_OF.UC.UC_STAMP+''+styler.uniqStamp}`
          else {

            //if (!isStartWithSubUc) {
            fsel = splitted[len - 1];
            splitted[len - 1] = this.SELECTOR_CONDITION(fsel, code, keyval); // ATTR_OF.UC.CLASS_PARENT+''+styler.uniqStamp

            //}
          }
          break;
      }
    }
    /* fsel = splitted[0];
     if (fsel.startsWith('&')) {
         splitted[0] = fsel.replace('&', `WRAPPER[${ATTR_OF.UC.UC_STAMP}="${styler.uniqStamp}"]`);
     } else {
         splitted[0] = `${fsel}`;//this.setStamp_shu_____(fsel, ATTR_OF.UC.UC_STAMP, styler.uniqStamp);
     }
     if (len > 1) {
         let fsel = splitted[len - 1];
         // splitted[len-1] = this.setStamp_shu_____(fsel, ATTR_OF.UC.PARENT_STAMP, styler.uniqStamp);
     }*/
    // console.log(hiddens.scopeSelectorText);
    splitted.unshift(hiddens.scopeSelectorText != undefined ? hiddens.scopeSelectorText : '');
    return splitted.join(' ');
    //scopeOpt = Object.assign(Object.assign({}, scopeSelectorOptions), scopeOpt);
    //return this.parseScopeSeperator_sub(scopeOpt);
  }
  SELECTOR_CONDITION(selector, /*classes*/ regxInd: CSSSearchAttributeCondition = '^', stampvalue) {
    let dbl: string[] = selector.split(/ *:: */);
    let sngl: string[] = dbl[0].split(/ *: */);
    //sngl[0] += `.${classes}`;
    sngl[0] += `[${ATTR_OF.UC.ALL}${regxInd}="${stampvalue}"]`;
    dbl[0] = sngl.join(":");
    return dbl.join("::");
  }
}


export class CssVariableHandler {
  static GetCombinedCSSVarName = (key: string, uniqId: string, code: CSSVariableScopeSort): string => {
    return `--${key}${uniqId}${code}`;
  }
  static GetCombinedCSSAnimationName = (key: string, uniqId: string, code: CSSVariableScopeSort): string => {
    return `anm${key}${uniqId}${code}`;
  }
  static SetCSSVarValue = (vlst: VariableList, uniqId: any, code: CSSVariableScopeSort, tarEle: HTMLElement = document.body): void => {
    let style = tarEle.style;
    for (const [key, value] of Object.entries(vlst)) {
      style.setProperty(this.GetCombinedCSSVarName(key, uniqId, code), value);
    }
    return;
  }

  static GetCSSVarValue = (key: string, uniqId: string, code: CSSVariableScopeSort, defaultVal: string): string => {
    return ` var(${this.GetCombinedCSSVarName(key, uniqId, code)},${defaultVal}) `;
  }
  GetCSSAnimationName = (animName: string) => {
    let r = animName.match(/^(\w)-(\w+)/i);
    let scope: CSSVariableScopeSort = '' as any;
    let name = animName;
    if (r == null) return CssVariableHandler.GetCombinedCSSAnimationName(name, this.main.LOCAL_STAMP_KEY, 'l');
    else {
      scope = r[1] as CSSVariableScopeSort;
      name = r[2];
      switch (scope) {
        case 'g': return CssVariableHandler.GetCombinedCSSAnimationName(name, this.main.ROOT_STAMP_KEY, 'g');
        case 't': return CssVariableHandler.GetCombinedCSSAnimationName(name, this.main.TEMPLATE_STAMP_KEY, 't');
        case 'l': return CssVariableHandler.GetCombinedCSSAnimationName(name, this.main.LOCAL_STAMP_KEY, 'l');
        default: return animName;
      }
    }
  }
  main: StylerRegs;
  constructor(main: StylerRegs) {
    this.main = main;
  }
  handlerVariable(rtrn: string): string {
    let _this = this;
    let _main = this.main;

    //   /(\$[lgit]-\w+)((?:\s*\:\s*(.*?)\s*;)|(?:\s+(.+?)\s*--)|\s*)/gim
    rtrn = rtrn.replace(patternList.varHandler,
      (match: string, fullVarName: string, defaultVal: string) => {
        //console.log([match, fullVarName, defaultVal]);
        defaultVal = defaultVal.trim();
        let ky: string = fullVarName;//.toLowerCase();
        let scope = ky.charAt(1) as CSSVariableScopeSort;
        let varName = ky.substring(3).trim()
        let uniqId: string = StylerRegs.internalKey;
        let isPrintWithEmptyValue = defaultVal.length == 0;
        let isPrintWithDefaultValue = defaultVal.endsWith('--');
        let isSettingValue = defaultVal.charAt(0) == ':' && defaultVal.slice(-1) == ';';
        if (isPrintWithEmptyValue || isPrintWithDefaultValue) { // GET VALUE 
          if (isPrintWithDefaultValue) {
            defaultVal = defaultVal._trimText('--');
            defaultVal = _this.handlerVariable(defaultVal);
          }
          switch (scope) {
            case "g": uniqId = '' + _main.ROOT_STAMP_KEY; break;
            case "t": uniqId = _main.TEMPLATE_STAMP_KEY; break;
            case "l": uniqId = _main.LOCAL_STAMP_KEY; break;
          }
          return CssVariableHandler.GetCSSVarValue(
            varName,
            uniqId,
            scope,
            defaultVal
          );
        } else if (isSettingValue) { // SET VALUE
          let tarEle: HTMLElement = undefined;
          defaultVal = defaultVal._trimText(':').trimText_(';');
          defaultVal = _this.handlerVariable(defaultVal);
          switch (scope) {
            case "g": uniqId = '' + this.main.rootInfo.id; break;
            case "t":
              uniqId = _main.TEMPLATE_STAMP_KEY;
              tarEle = _main.wrapperHT;
              break;
            case "l":
              uniqId = _main.LOCAL_STAMP_KEY;
              tarEle = _main.wrapperHT;
              break;
            default: return match;
          }
          let key = varName;
          CssVariableHandler.SetCSSVarValue({ [key]: defaultVal }, uniqId, scope, tarEle);
          return '';
        }
        //console.log(scope, varName, defaultVal);
        return match;
      });

    return rtrn;
  }
}