import { openCloser } from "./global/openCloser.js";
import { ATTR_OF, StyleClassScopeType } from "./global/runtimeOpt.js";
import { ProjectManage } from "./ipc/ProjectManage.js";
import { GetUniqueId, ProjectRowR } from "./ipc/enumAndMore.js";
import { OpenCloseHandler } from "./lib/OpenCloseHandler.js";
import { SourceNode, StampNode, STYLER_SELECTOR_TYPE } from "./lib/StampGenerator.js";
import { nodeFn } from "./nodeFn.js";
export type VariableList = { [key: string]: string };
export const patternList = {
  styleTagSelector: /<style([\n\r\w\W.]*?)>([\n\r\w\W.]*?)<\/style>/gi,
  MULTILINE_COMMENT_REGS: /\/\*([\s\S]*?)\*\//gi,
  SINGLELINE_COMMENT_REGS: /\/\/.*/mg,
  SPACE_REMOVER_REGS: /(;|,|:|{|})[\n\r ]*/gi,
  subUcFatcher: /\[inside=([\"'`])((?:\\.|(?!\1)[^\\])*)\1\]([\S\s]*)/gim,
  themeCSSLoader: /\@(import|use)\s*([\"'`])((?:\\.|(?!\2)[^\\])*)\2\s*;/gim,
  mediaSelector: /^\s*@(media|keyframes|supports|container|document)\s+([\s\S]*)\s*/i,
  animationNamePattern: /animation-name\s*:\s*-([lgit])-(\w+)\s*;/gim,
  animationAccessPattern: /-([lgit])-(\w+)\s*/gim,
  varHandler: /(\$[lgit]-\w+)((?:\s*\:\s*(.*?)\s*;)|(?:\s+(.+?)\s*--)|\s*)/gim,
  rootExcludePattern: /(\w*)(:root|:exclude)/gi,
};
export interface IKeyStampNode {
  TEMPLATE?: string,
  LOCAL?: string,
  ROOT?: string,
  INTERNAL?: string
}
export interface IStyleSeperatorOptions {
  data: string,
  scopeSelectorText?: string,
  callCounter?: number,
  isForRoot?: boolean,
  //_rootinfo?: RootPathRow,
  _projectinfo?: ProjectRowR,
  localNodeElement?: HTMLElement,
  //cssVarStampKey?: string,
}
const StyleSeperatorOptions: IStyleSeperatorOptions = {
  data: "",
  scopeSelectorText: "",
  callCounter: 0,
  isForRoot: false,
  //_rootinfo: Object.assign({}, rootPathRow),
  _projectinfo: new ProjectRowR(),
  localNodeElement: undefined,
  //cssVarStampKey: "",
};
export enum StyleBaseType {
  Global = 0,
  UserControl = 1,
  Template = 2,
  TemplateCommon = 3,
}
export type CSSVariableScope = "global" | "local" | "internal" | "template";
export type CSSVariableScopeSort = "g" | "l" | "i" | "t";
export type CSSSearchAttributeCondition = "*" | "^" | "$";
export const WRAPPER_TAG_NAME = 'f' + GetUniqueId();
export class StylerRegs {
  static ScssExtractor(csscontent: string) {
    let ocHandler = new OpenCloseHandler();
    ocHandler.ignoreList.push({ o: `"`, c: `"` },
      { o: `'`, c: `'` },
      { o: "`", c: "`" },
      { o: "/*", c: "*/" });
    return ocHandler.parse({ o: '{', c: '}' }, csscontent);
  }
  baseType: StyleBaseType = StyleBaseType.UserControl;
  static initProjectsStyle(/*callback: () => void*/): void {
    SourceNode.init();
    ProjectManage.projects.forEach((row) => {
      let _stylepath: string = row.projectPrimaryAlice + "/Program.styles.scss";
      let cssPath = `${row.projectPath}/Program.styles.scss`;
      if (nodeFn.fs.existsSync(cssPath, row.importMetaURL)) {
        row.stampSRC = StampNode.registerSoruce({
          key: _stylepath,
          baseType: StyleBaseType.Global,
          cssFilePath: cssPath,
          project: row, mode: '$',
          accessName: row.projectPrimaryAlice,
        });
        // debugger;
        row.stampSRC.pushCSS(cssPath, row.importMetaURL, document.body);
      }
    });
  }
  KEYS: IKeyStampNode = {
    TEMPLATE: "" as string,
    LOCAL: "" as string,
    ROOT: "" as string,
    INTERNAL: "" as string,
  };
  controlXName: string = '';
  static templateID: number = 0;
  static localID: number = 0;
  //aliceMng: AliceManager = new AliceManager();
  //rootInfo: RootPathRow = undefined;
  projectInfo: ProjectRowR = undefined;
  nodeName: string = WRAPPER_TAG_NAME;
  private _parent: StylerRegs = undefined;
  public get parent(): StylerRegs {
    return this._parent;
  }
  public set parent(value: StylerRegs) {
    this._parent = value;
    if (this.generateStamp) {
      this.KEYS.INTERNAL = 'IK'; //this.KEYS.LOCAL;
    } else {
      this.KEYS.INTERNAL = 'IK'; //this._parent.KEYS.LOCAL
    }
  }
  children: StylerRegs[] = [];
  alices: string = "";

  path: string = "";
  wrapperHT: HTMLElement = undefined;
  templateHT: HTMLElement = undefined;
  main: SourceNode;
  generateStamp = true;
  constructor(main: SourceNode,
    generateStamp: boolean = true,
    cached_keys: IKeyStampNode,
    baseType?: StyleBaseType,
    mode?: CSSSearchAttributeCondition) {
    this.main = main;
    this.generateStamp = generateStamp;
    this.projectInfo = main.project;
    this.baseType = baseType;
    if (cached_keys == undefined) {

      StylerRegs.localID++;
      if (generateStamp) {
        StylerRegs.templateID++;
      }
      this.KEYS.ROOT = "" + this.projectInfo.id;
      this.KEYS.TEMPLATE = "" + StylerRegs.templateID;
      this.KEYS.LOCAL = "" + StylerRegs.localID;
    } else {
      this.KEYS = Object.assign({}, cached_keys);
      console.log(['  ------  CACHE RESTORED ', this.main.myObjectKey]);
    }
    //if (this.KEYS.LOCAL == '25') debugger;
    this.KEYS.INTERNAL = "";

    this.nodeName = WRAPPER_TAG_NAME; //"f" + uniqOpt.randomNo();
    this.rootAndExcludeHandler = new RootAndExcludeHandler(this);
    this.themeCssHandler = new ThemeCssHandler(this);
    this.varHandler = new CssVariableHandler(this);
    this.selectorHandler = new SelectorHandler(this, mode);
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
  static internalKey: string = 'int' + GetUniqueId();
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
    let _curProject: ProjectRowR = _this.projectInfo;
    let rtrn = StylerRegs.REMOVE_COMMENT(_params.data);
    rtrn = StylerRegs.REMOVE_EXTRASPACE(_this.themeCssHandler.match(rtrn));

    rtrn = this.opnClsr.doTask("{", "}", rtrn,
      (selectorText: string, styleContent: string, count: number): string => {
        let excludeContentList = this.rootAndExcludeHandler.checkRoot(selectorText, styleContent, _params);
        if (excludeContentList.length == 0) {
          let trimSelector: string = selectorText.trim();
          let m = trimSelector.match(patternList.mediaSelector);
          if (m != null) { //  IF CURRENT IS MEDIA SELECTOR
            let type = '@' + m[1].trim();
            switch (type) {
              case '@media':
              case '@supports':
              case '@container':
              case '@document':
                let csnt = _this.parseStyleSeperator_sub(Object.assign({}, _args, { data: styleContent }));
                return `${trimSelector} { ${csnt} } `;
              case '@keyframes':
                let v = m[2].trim().replace(patternList.animationAccessPattern, (ms, scope, name) => {
                  return _this.varHandler.GetCSSAnimationName(scope, name);
                });
                return `@keyframes ${v} {${styleContent}} `;
            }
          } else {
            let sel = '';
            let extraTextAtBegining = '';
            selectorText = selectorText.replace(/(.*?)([^;]*?)$/gim, (m, extraText, slctr) => {
              extraTextAtBegining += " " + extraText;
              sel += slctr;
              return '';
            });
            sel = sel.trim();


            //console.log(sel);
            
            const res = _this.selectorHandler.parseScopeSeperator({
              selectorText: sel,
              scopeSelectorText: _params.scopeSelectorText,
              project: _curProject,
              isForRoot: _params.isForRoot
            });
            //console.log(res);
            
            
            let grp = StylerRegs.groupByStyler(res);
            let finalreturn = '';
            grp.forEach(s => {
              styleContent = s.styler.varHandler.handlerVariable(styleContent);
              finalreturn += ` ${s.selectors.join(',')} {${styleContent}} `;
            });
            //console.log(grp);
            //console.log(finalreturn);
                        
            return `${extraTextAtBegining} ${finalreturn}`;
            // return `${extraTextAtBegining} ${res}{${styleContent}}`;
          }
        } else {
          return excludeContentList.join(' ');
        }
      }
    );
    
    rtrn = _this.varHandler.handlerVariable(rtrn);
//    console.log(rtrn);
    
    /// console.log(extraTextAtBegining);
    //rtrn = extraTextAtBegining + '' + rtrn;
    //debugger;


    //rtrn = rtrn.trim().replace(/(;|,|:|{|})[\n\r ]*/gi, "$1");
    return /*STYLE_BLOCK_NODE.join("") + " " +*/ rtrn;//.trim().replace(/(;|,|{|})[\n\r ]*/gi, "$1");
  }
  static groupByStyler(nodes: SelSingleScopeNode[]) {
    const map = new Map<StylerRegs, string[]>();

    for (const node of nodes) {
      if (!map.has(node.styler)) {
        map.set(node.styler, []);
      }
      map.get(node.styler)!.push(node.selector);
    }

    // convert to final array if needed
    return Array.from(map, ([styler, selectors]) => ({
      styler,
      selectors,
    }));
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
  project: ProjectRowR;
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
    let changed = false;
    let _this = this;
    let externalStyles: string[] = [];
    selectorText.replace(
      patternList.subUcFatcher,
      (match: string, quationMark: string, filePath: string, UCselector: string) => {
        filePath = filePath["#devEsc"]();
        let fpath = nodeFn.path.resolveFilePath(this.main.main.cssFilePath, filePath);
        filePath = fpath;
        UCselector = UCselector.trim();
        let tree: StylerRegs = this.main.children.find(
          (s: StylerRegs) => nodeFn.path.isSamePath(s.path, filePath) || s.alices == filePath
        );
        if (tree != undefined) {
          let nscope: string =
            _params.callCounter == 1
              ? this.main.selectorHandler._DEFAULT_KEYS.MAIN_SELECTOR
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
    if (changed) return externalStyles;
    if (selectorText.match(patternList.rootExcludePattern) == null) return [];

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
                    // _rootinfo: undefined
                  })
                );
              } else {
                let rInfo = ProjectManage.getInfoByAlices(
                  rootAlices // `@${rootAlices}:`
                );
                if (rInfo != undefined) {

                  externalStyles.push(
                    _this.main.parseStyleSeperator_sub({
                      data: _params.scopeSelectorText + styleContent,
                      callCounter: _params.callCounter,
                      isForRoot: true,
                      _projectinfo: rInfo,
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
    let fspath = this.main.main.cssFilePath;
    rtrn = rtrn.replace(
      patternList.themeCSSLoader,
      (match: string, code: string, quationMark: string, path: string, offset: any, input_string: string) => {

        switch (code) {
          case "use":
            let themecontents = '';
            if (fspath != undefined) {
              fspath = nodeFn.path.resolveFilePath(fspath, path);
              themecontents = nodeFn.fs.readFileSync(fspath, undefined, this.main.projectInfo.importMetaURL)["#devEsc"]();
            }
            themecontents = StylerRegs.REMOVE_COMMENT(themecontents);
            themecontents = StylerRegs.REMOVE_EXTRASPACE(_this.match(themecontents));
            return themecontents;
          case "import":
            if (fspath != undefined) {
              fspath = nodeFn.path.resolveFilePath(fspath, path);
              let prj = ProjectManage.getInfo(fspath, this.main.projectInfo.importMetaURL);
              let stpSrc = StampNode.registerSoruce({
                key: path,
                cssFilePath: fspath,
                baseType: _this.main.baseType,
                project: prj.project,
                accessName: '',
              });
              stpSrc.pushCSS(fspath, prj.project.importMetaURL);
              _this.main.main.onRelease.push(async () => {
                await stpSrc.release();
              });
            }
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
  project: undefined,
  isForRoot: false,
  hiddens: {
    project: undefined,
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
  project: ProjectRowR;
  hiddens?: IHiddenScopeNode;
}
interface SelScopeMap {
  scope?: StyleClassScopeType;
  selectorOperation?: CSSSearchAttributeCondition;
  key?: string;
}
interface SelMultipleScopeNode {
  selector: string,
  styler: StylerRegs[],
}

interface SelSingleScopeNode {
  selector: string,
  styler: StylerRegs,
}
export class SelectorHandler {
  main: StylerRegs;
  _DEFAULT_KEYS = {
    MAIN_SELECTOR: '',
    MAIN_ROOT_SELECTOR: '',
    SCP: {} as SelScopeMap,
  }

  private _selectorMode: CSSSearchAttributeCondition = '^';
  public get selectorMode(): CSSSearchAttributeCondition {
    return this._selectorMode;
  }
  public set selectorMode(value: CSSSearchAttributeCondition) {
    this._selectorMode = value;
    this.updateSCP(value);
  }
  constructor(main: StylerRegs, mode: CSSSearchAttributeCondition = '^') {
    this.main = main;
    let dkey = this._DEFAULT_KEYS;
    const mainKey = this.main.KEYS;
    if (StampNode.MODE == STYLER_SELECTOR_TYPE.ATTRIB_SELECTOR) {
      switch (main.baseType) {
        case StyleBaseType.Template:
          dkey.MAIN_SELECTOR = `${main.nodeName}[${ATTR_OF.UC.ALL}="${mainKey.LOCAL}_${mainKey.TEMPLATE}_${mainKey.ROOT}"]`;
          dkey.MAIN_ROOT_SELECTOR = `${main.nodeName}[${ATTR_OF.UC.ALL}$="_${mainKey.ROOT}"]`;
          break;
        case StyleBaseType.TemplateCommon:
          dkey.MAIN_SELECTOR = `${main.nodeName}[${ATTR_OF.UC.ALL}="${mainKey.LOCAL}_${mainKey.TEMPLATE}_${mainKey.ROOT}"]`;
          dkey.MAIN_ROOT_SELECTOR = `${main.nodeName}[${ATTR_OF.UC.ALL}$="_${mainKey.ROOT}"]`;
          break;
        case StyleBaseType.UserControl:
          dkey.MAIN_SELECTOR = `${main.nodeName}[${ATTR_OF.UC.ALL}="${mainKey.LOCAL}_${mainKey.ROOT}"]`;
          dkey.MAIN_ROOT_SELECTOR = `${main.nodeName}[${ATTR_OF.UC.ALL}$="_${mainKey.ROOT}"]`;
          break;
        case StyleBaseType.Global:
          dkey.MAIN_ROOT_SELECTOR = `${main.nodeName}[${ATTR_OF.UC.ALL}$="_${mainKey.ROOT}"]`;
          break;
      }
    } else {
      dkey.MAIN_SELECTOR = `${main.nodeName}.${ATTR_OF.__CLASS(mainKey.LOCAL, 'm')}.${ATTR_OF.__CLASS(mainKey.ROOT, 'r')}`;
    }
    this.selectorMode = mode;
  }
  updateSCP(mode: CSSSearchAttributeCondition) {
    let dkey = this._DEFAULT_KEYS;
    const mainKey = this.main.KEYS;
    dkey.SCP.selectorOperation = mode;
    switch (this.selectorMode) {
      case '$': dkey.SCP.scope = 'r'; dkey.SCP.key = `_${mainKey.ROOT}`; break;
      case '^': dkey.SCP.scope = 'l'; dkey.SCP.key = `${mainKey.LOCAL}_`; break;
      case '*': dkey.SCP.scope = 'g'; dkey.SCP.key = `_${mainKey.TEMPLATE}_`; break;
    }
  }
  parseScopeSeperator(scopeOpt: IScopeSelectorOptions) {
    let _this = this;
    const result: SelSingleScopeNode[] = [];
    scopeOpt = Object.assign(ScopeSelectorOptions, scopeOpt);
    scopeOpt.hiddens.project = scopeOpt.project;

    scopeOpt.hiddens.scopeSelectorText = scopeOpt.scopeSelectorText;
    scopeOpt.hiddens.isForRoot = scopeOpt.isForRoot;
    if (scopeOpt.selectorText.trim() == '') return result;
    let counter = scopeOpt.hiddens.counter;
    let oc = new openCloser();
    let _selctor = oc.doTask('(', ')', scopeOpt.selectorText, (selector, cssStyle, opened) => {
      if (opened > 1) {
        if (selector.endsWith(':has')) {
          scopeOpt.selectorText = cssStyle;
          let key = _this.KEY(scopeOpt.hiddens);
          cssStyle = _this.parseScopeSeperator(scopeOpt).map(s => s.selector).join(','); //.selector
          scopeOpt.hiddens.list[key] = { selector: cssStyle, funcName: 'has', value: '(' + cssStyle + ')' };
          return selector + '' + key;
        } else {
          return selector + '(' + cssStyle + ')';
        }
      }
      if (selector.endsWith(':has')) {
        scopeOpt.selectorText = cssStyle;
        let key = _this.KEY(scopeOpt.hiddens);
        scopeOpt.hiddens.list[key] = { selector: cssStyle, funcName: 'has', value: '(' + cssStyle + ')' };
        return selector + '' + key;
      } else {
        return selector + '(' + cssStyle + ')';
      }
    });
    //result.selector =
    //let n = Object.assign({}, scopeOpt);
    scopeOpt.selectorText = _selctor;
    if (counter == 0) {
      Object.assign(result, this.loopMultipleSelectors(_selctor, /*this.main,*/ scopeOpt.hiddens));
      //console.log([oldSelector, rtrn]);
      scopeOpt.hiddens.list = {};
      scopeOpt.hiddens.counter = 0;
    }

    //let sub = this.parseScopeSeperator_sub(scopeOpt);
    // console.log([sub, rtrn]);
    return result;
  }
  loopMultipleSelectors(selector: string, /*stylers: StylerRegs,*/ hiddens: IHiddenScopeNode) {

    let selectors = selector.split(',');
    const rtrn: SelSingleScopeNode[] = [];
    for (let i = 0, len = selectors.length; i < len; i++) {
      rtrn.push(this.splitselector(selectors[i], /*stylers,*/ hiddens));
    }
    return rtrn;//.join(',');
  }
  KEY(hiddens: IHiddenScopeNode) {
    hiddens.counter++;
    return '◄◘' + hiddens.counter + '◘▀';
  }
  splitselector(selector: string, hiddens: IHiddenScopeNode) {
    let _this = this;
    const rtrn: SelSingleScopeNode = {
      selector: selector,
      styler: _this.main
    }
    let splitted = selector.split(' ');
    let hasUcFound = false;
    let kvNode: string;
    let nSelector = '';
    let isStartWithSubUc = false;
    let sub_styler: StylerRegs = undefined;
    for (let i = 0, len = splitted.length; i < len; i++) {
      let sel = splitted[i];
      hasUcFound = false; sub_styler = undefined;
      let matchs = sel.replace(/^&(\w+)/gm, (match, ucName) => {
        sub_styler = _this.main.children.find(s => s.controlXName === ucName);
        hasUcFound = (sub_styler != undefined);
        if (hasUcFound) {
          isStartWithSubUc = (i == 0);
          let nnode: string = '';
          nnode = (StampNode.MODE == STYLER_SELECTOR_TYPE.ATTRIB_SELECTOR) ?
            `${sub_styler.nodeName}[${ATTR_OF.UC.ALL}="${sub_styler.KEYS.LOCAL}"]`
            :
            `${sub_styler.nodeName}.${ATTR_OF.__CLASS(sub_styler.KEYS.LOCAL, 'm')}`;
          let key = _this.KEY(hiddens);
          kvNode = key;
          hiddens.list[kvNode] = { value: nnode };
          return key;
        } else return match;
      });
      if (hasUcFound) {
        splitted[i] = matchs;
        let nextSplitters = splitted.slice(i);
        let subSelector = nextSplitters.join(' ');
        const subRes = sub_styler.selectorHandler.splitselector(subSelector.replace(kvNode, '&'), /*sub_styler,*/ hiddens);
        splitted[i] = subRes.selector;
        rtrn.styler = subRes.styler;
        hasUcFound = false;
        splitted = splitted.slice(0, i + 1);
        break;

      } else {
        let ntext = splitted[i];
        ntext = ntext.replace(/◄◘(\d+)◘▀/gm, (r) => {
          const _loopSel = _this.loopMultipleSelectors(hiddens.list[r].selector, /* styler,*/ hiddens);
          return '(' + _loopSel.map(s => s.selector).join(',') + ')';
        });
        splitted[i] = ntext;
      }
    }
    if (isStartWithSubUc) splitted.unshift('&');
    let styler = this.main;
    let joinedValue = '';
    splitted = splitted.filter(word => {
      joinedValue += word;
      return word !== "";
    });
    let len = splitted.length;
    let fsel = '';
    if (hiddens.isForRoot) {
      fsel = splitted[len - 1];
      if (joinedValue.includes('&')) {
        switch (len) {
          case 1: splitted[0] = fsel.replace('&', this._DEFAULT_KEYS.MAIN_ROOT_SELECTOR); break;
          default:
            for (let i = 0, ilen = splitted.length; i < ilen; i++) {
              const ispl = splitted[i];
              if (ispl.includes('&')) {
                splitted[i] = ispl.replace('&', this._DEFAULT_KEYS.MAIN_ROOT_SELECTOR);
                break;
              } else splitted[i] = ispl.replace('&', this._DEFAULT_KEYS.MAIN_ROOT_SELECTOR);
            }
            splitted[len - 1] = this.MISC_SELECTOR_CONDITION(fsel, {
              scope: 'r',
              selectorOperation: '$',
              key: '_' + hiddens.project.id
            });
            break;
        }
      } else {
        splitted[len - 1] = this.MISC_SELECTOR_CONDITION(fsel, {
          scope: 'r',
          selectorOperation: '$',
          key: '_' + hiddens.project.id
        });
      }
    } else {
      fsel = splitted[0];
      if (fsel.startsWith('&')) {
        splitted[0] = fsel.replace('&', this._DEFAULT_KEYS.MAIN_SELECTOR);
      } else {
        if (fsel.length == 1) splitted[0] = this.MISC_SELECTOR_CONDITION(fsel, this._DEFAULT_KEYS.SCP);
        else {
          fsel = splitted[len - 1];
          splitted[len - 1] = this.MISC_SELECTOR_CONDITION(fsel, this._DEFAULT_KEYS.SCP);
        }
      }
      // switch (len) {
      //   case 1:
      //     if (fsel.startsWith('&'))
      //       splitted[0] = fsel.replace('&', this._DEFAULT_KEYS.MAIN_SELECTOR); //fsel.replace('&', `${main.nodeName}[${ATTR_OF.UC.ALL}="${styler.LOCAL_STAMP_KEY}"]`); //`${main.nodeName}.${ATTR_OF.UC.UC_STAMP+''+styler.uniqStamp}` 
      //     else {
      //       splitted[0] = this.MISC_SELECTOR_CONDITION(fsel, this._DEFAULT_KEYS.SCP); //this.CLASS_SELECTOR_CONDITION(fsel, __VARS.scope, __VARS.key); //ATTR_OF.UC.CLASS_PARENT+''+styler.uniqStamp
      //     }
      //     break;
      //   default:
      //     if (fsel.startsWith('&'))
      //       splitted[0] = fsel.replace('&', this._DEFAULT_KEYS.MAIN_SELECTOR);  // fsel.replace('&', `${main.nodeName}[${ATTR_OF.UC.ALL}="${styler.LOCAL_STAMP_KEY}"]`); //   // `${main.nodeName}.${ATTR_OF.UC.UC_STAMP+''+styler.uniqStamp}`
      //     else {
      //       fsel = splitted[len - 1];
      //       splitted[len - 1] = this.MISC_SELECTOR_CONDITION(fsel, this._DEFAULT_KEYS.SCP); //this.CLASS_SELECTOR_CONDITION(fsel, __VARS.scope, __VARS.key); // ATTR_OF.UC.CLASS_PARENT+''+styler.uniqStamp
      //     }
      //     break;
      // }
    }
    splitted.unshift(hiddens.scopeSelectorText != undefined ? hiddens.scopeSelectorText : '');
    rtrn.selector = splitted.join(' ');
    return rtrn;
  }

  MISC_SELECTOR_CONDITION(selector: string, xk: SelScopeMap) {
    let dbl: string[] = selector.split(/ *:: */);
    let sngl: string[] = dbl[0].split(/ *: */);
    if (StampNode.MODE == STYLER_SELECTOR_TYPE.ATTRIB_SELECTOR) {
      sngl[0] += `[${ATTR_OF.UC.ALL}${xk.selectorOperation}="${xk.key}"]`;
    } else {
      sngl[0] += `.${ATTR_OF.__CLASS(xk.key, xk.scope)}`;
    }
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
  GetCSSAnimationName = (scope: string, name: string) => {
    //scope = r[1] as CSSVariableScopeSort;
    // name = r[2];
    switch (scope) {
      case 'g': return CssVariableHandler.GetCombinedCSSAnimationName(name, this.main.KEYS.ROOT, 'g');
      case 't': return CssVariableHandler.GetCombinedCSSAnimationName(name, this.main.KEYS.TEMPLATE, 't');
      case 'l': return CssVariableHandler.GetCombinedCSSAnimationName(name, this.main.KEYS.LOCAL, 'l');
      case '': return name;
      default: return CssVariableHandler.GetCombinedCSSAnimationName(name, this.main.KEYS.LOCAL, 'l');
    }
    /*
    let r = animName.match(/^-(lgit)-(\w+)/i); // "g" | "l" | "i" | "t"
    let scope: CSSVariableScopeSort = '' as any;
    let name = animName;
    if (r == null) return CssVariableHandler.GetCombinedCSSAnimationName(name, this.main.KEYS.LOCAL, 'l');
    else {
      scope = r[1] as CSSVariableScopeSort;
      name = r[2];
      switch (scope) {
        case 'g': return CssVariableHandler.GetCombinedCSSAnimationName(name, this.main.KEYS.ROOT, 'g');
        case 't': return CssVariableHandler.GetCombinedCSSAnimationName(name, this.main.KEYS.TEMPLATE, 't');
        case 'l': return CssVariableHandler.GetCombinedCSSAnimationName(name, this.main.KEYS.LOCAL, 'l');
        default: return animName;
      }
    }*/
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
        let uniqId: string = _main.KEYS.INTERNAL;// StylerRegs.internalKey;
        let isPrintWithEmptyValue = defaultVal.length == 0;
        let isPrintWithDefaultValue = defaultVal.endsWith('--');
        let isSettingValue = defaultVal.charAt(0) == ':' && defaultVal.slice(-1) == ';';
        if (isPrintWithEmptyValue || isPrintWithDefaultValue) { // GET VALUE 
          if (isPrintWithDefaultValue) {
            //console.log(defaultVal);
            defaultVal = defaultVal["#trimText_"]('--');
            //console.log(defaultVal);
            //console.log("-------------------------");
            defaultVal = _this.handlerVariable(defaultVal);
          }
          switch (scope) {
            case "g": uniqId = '' + _main.KEYS.ROOT; break;
            case "t": uniqId = _main.KEYS.TEMPLATE; break;
            case "i": uniqId = _main.KEYS.INTERNAL; //StylerRegs.internalKey;
              break;
            case "l": uniqId = _main.KEYS.LOCAL; break;
          }
          return CssVariableHandler.GetCSSVarValue(
            varName,
            uniqId,
            scope,
            defaultVal
          );
        } else if (isSettingValue) { // SET VALUE
          let tarEle: HTMLElement = undefined;
          defaultVal = defaultVal["#_trimText"](':')["#trimText_"](';');
          defaultVal = _this.handlerVariable(defaultVal);
          switch (scope) {
            case "g": uniqId = '' + this.main.KEYS.ROOT; break;
            case "t":
              uniqId = _main.KEYS.TEMPLATE;
              tarEle = _main.wrapperHT;
              break;
            case "i":
              uniqId = _main.KEYS.INTERNAL; //StylerRegs.internalKey;
              tarEle = _main.wrapperHT;
              break;
            case "l":
              uniqId = _main.KEYS.LOCAL;
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
    rtrn = rtrn.replace(
      patternList.animationNamePattern,
      (match: string, scope: string, value: string) => {
        //_this.varHandler.GetCSSAnimationName(scope,value);
        return `animation-name : ${_this.GetCSSAnimationName(scope, value)}; `;
      }
    );
    return rtrn;
  }
}