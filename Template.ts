import { codeFileInfo } from "ucbuilder/build/codeFileInfo";
import { propOpt } from "ucbuilder/build/common";
import { regsManage } from "ucbuilder/build/regs/regsManage";
import { TemplateMaker } from "ucbuilder/build/regs/TemplateMaker";
import { ITemplatePathOptions, ITptOptions, TptOptions } from "ucbuilder/enumAndMore";
import { TransferDataNode } from "ucbuilder/global/drag/transferation";
import { FileDataBank } from "ucbuilder/global/fileDataBank";
import { FilterContent } from "ucbuilder/global/filterContent";
import { newObjectOpt } from "ucbuilder/global/objectOpt";
import { ATTR_OF } from "ucbuilder/global/runtimeOpt";
import { SourceNode, StampNode } from "ucbuilder/lib/StampGenerator";
import { CSSVariableScope, StylerRegs, VariableList } from "ucbuilder/lib/stylers/StylerRegs";
import { Usercontrol } from "ucbuilder/Usercontrol";
interface TptTextObjectNode<K> {
  content: string,
  row: K
}
export class Template {
  static extractArgs = (args: any) => newObjectOpt.extractArguments(args);

  static getTemplateOptionByElement(iele: HTMLElement, cinfo: codeFileInfo): ITemplatePathOptions | undefined {
    //let stts = this.getTemplateStatus(iele);
    let rtrn: ITemplatePathOptions = {
      accessKey: 'primary',
      objectKey: undefined,
    };
    let name = iele.getAttribute('x-name');
    if (name != null && iele.nodeName == 'X:TEMPLATE') {
      let partinfo = cinfo.partInfo;
      let csspath = '';
      let htmlpath = '';
      let isHTMLFullpath = undefined as boolean;
      let isCSSFullpath = undefined as boolean;
      let xrelativeChild = iele.getAttribute('x-relative-child');
      let xrelative = iele.getAttribute('x-relative');
      let xpath = iele.getAttribute('x-path');
      let xhtmlpath = iele.getAttribute('x-htmlpath');
      let xcsspath = iele.getAttribute('x-csspath');
      if (xrelativeChild != null) {
        xrelativeChild = xrelativeChild.removeExtension();
        csspath = cinfo.mainFileRootPath + '/' + xrelativeChild + '.scss';
        htmlpath = cinfo.mainFilePath + '/' + xrelativeChild + '.html';
        isCSSFullpath = false; isHTMLFullpath = true;
      } else if (xrelative != null) {
        xrelative = xrelative.removeExtension();
        csspath = partinfo.sortDirPath + '/' + xrelative + '.scss';
        htmlpath = partinfo.dirPath + '/' + xrelative + '.html';
        isCSSFullpath = false; isHTMLFullpath = true;
      } else if (xpath != null) {
        xpath = xpath.removeExtension();
        csspath = xpath + '.scss';
        htmlpath = xpath + '.html';
        isCSSFullpath = false; isHTMLFullpath = false;
      } else if (xhtmlpath != null && xcsspath != null) {
        xhtmlpath = xhtmlpath.removeExtension(['html']);
        xcsspath = xcsspath.removeExtension(['scss']);
        csspath = xhtmlpath + '.scss';
        htmlpath = xcsspath + '.html';
        isCSSFullpath = false; isHTMLFullpath = false;
      } else return rtrn;
      rtrn.objectKey = csspath;
      rtrn.accessKey = name;
      rtrn.cssContents = FileDataBank.readFile(csspath, { isFullPath: isCSSFullpath, replaceContentWithKeys: true });
      rtrn.htmlContents = FileDataBank.readFile(htmlpath, { isFullPath: isHTMLFullpath, });
      if (rtrn.htmlContents == undefined) debugger;
      rtrn.htmlContents = rtrn.htmlContents?.PHP_ADD() ?? undefined;
    } else {
      rtrn.objectKey = cinfo.style.rootPath;
      rtrn.cssContents = FileDataBank.readFile(cinfo.style.fullPath, { replaceContentWithKeys: true });
      rtrn.htmlContents = iele.outerHTML.PHP_ADD();
    }
    /*iele.getAttribute('x-name');
    iele.getAttribute('x-relative-child');
    iele.getAttribute('x-relative');
    iele.getAttribute('x-path');
    iele.getAttribute('x-htmlpath');
    iele.getAttribute('x-csspath');*/

    /*if (stts.valid) {
      rtrn.accessKey = stts.name;
      let htpath = stts.xpath;
      let cspath = stts.xpath;
      if (stts.isSeperatePathSpecified) {
        htpath = stts.htmlpath;
        cspath = stts.csspath;
      } else {
        if (stts.relative != null) {
          htpath = cinfo.partInfo.dirPath + '/' + stts.relative + '.html';
          cspath = cinfo.partInfo.dirPath + '/' + stts.relative + '.scss';
          htpath = htpath.toFilePath(true);
          cspath = cspath.toFilePath(true);
          console.log(htpath, cspath);

        }
      }
      let c = this.fillContent(htpath, cspath);
      rtrn.htmlContents = FileDataBank.readFile(c.htmlPath, { isFullPath: false });
      rtrn.objectKey = c.cssPath;
      rtrn.cssContents = FileDataBank.readFile(c.cssPath, { isFullPath: false, replaceContentWithKeys: true });
    }*/
    return rtrn;
  }
  static GetOptionsByContent(htmlcontent: string, cssContent: string): { [key: string]: ITemplatePathOptions } {
    let ele = htmlcontent.PHP_REMOVE().$();
    let rtrn: { [key: string]: ITemplatePathOptions } = {};
    let isSingleNode = ele.hasAttribute('id');
    if (!isSingleNode) {
      for (let i = 0, iObj = Array.from(ele.children), ilen = iObj.length; i < ilen; i++) {
        const ichild = iObj[i];
        let id = ichild.getAttribute('id');
        if (id != null) {
          rtrn[id] = {
            accessKey: id,
            objectKey: undefined,
            htmlContents: ichild.outerHTML.PHP_ADD(),
          };
        }
      }
    } else {
      let id = ele.getAttribute('id');
      rtrn[id] = {
        accessKey: id,
        objectKey: undefined,
        htmlContents: ele.outerHTML.PHP_ADD(),
      };
    }
    //cssContent    
    let cssExtrct = StylerRegs.ScssExtractor(cssContent);
    let tptCSS = "";
    //console.log(cssContent);
    let gkeys = [] as string[];
    for (let i = 0, iObj = cssExtrct, ilen = iObj.length; i < ilen; i++) {
      const iItem = iObj[i];
      let fc = ' '+iItem.frontContent;
      let needBetween = true;
      tptCSS += fc.replace(/([\s\S]*)\#(\w+)\s*$/mg, (m, prevCn, ids) => {
        //console.log([fc, prevCn, ids]);
        let robj = rtrn[ids];
        if (robj != undefined) {
          robj.cssContents = iItem.betweenContent;
          needBetween = false;
          gkeys.push(ids);
          return '';
        } else {
          if (iItem.child.length == 0) return m;
          else { needBetween = false; return ''; }
        }
      });
      if (needBetween) tptCSS += '{ ' + iItem.betweenContent + ' }';      
    }
    for(let i=0,iObj=gkeys,ilen=iObj.length   ;   i < ilen   ;   i++){ 
      const iItem = iObj[i];
      let ck = rtrn[iItem].cssContents;
      rtrn[iItem].cssContents = tptCSS+ck;
    }
    //console.log(tptCSS);
    console.log(rtrn);    
    return rtrn;
  }
  private static GetTemplatePathOptionsObject(cinfo: codeFileInfo): { [key: string]: ITemplatePathOptions } {
    let data = FileDataBank.readFile(cinfo.html.fullPath, {});
    let robj = this.GetOptionsByContent(data,
      FileDataBank.readFile(cinfo.style.fullPath, { replaceContentWithKeys: true }));
    let _mainFileRootPath = cinfo.mainFileRootPath;
    for (let i = 0, iObj = Object.values(robj), ilen = iObj.length; i < ilen; i++) {
      const irow = iObj[i];
      irow.objectKey = _mainFileRootPath + "#" + irow.accessKey;
    }
    return robj;
    /*let ele = data.PHP_ADD().$();
    let rtrn: ITemplatePathOptions[] = [];
    if (ele.length != undefined) {
      for (let i = 0, iObj = ele, ilen = iObj.length; i < ilen; i++) {
        const iele = iObj[i];
        let rs = Template.getTemplateOptionByElement(iele, cinfo);
        rtrn.push(rs);
      }
    } else {
      let rs: ITemplatePathOptions = {
        accessKey: 'primary',
        objectKey: cinfo.style.rootPath,
        cssContents: FileDataBank.readFile(cinfo.style.fullPath, { replaceContentWithKeys: true }),
        htmlContents: data,
      };
      rtrn.push(rs);
    }
    return rtrn;*/
  }
  static GetObjectOfTemplate(cinfo: codeFileInfo): { [key: string]: ITemplatePathOptions } {
    return Template.GetTemplatePathOptionsObject(cinfo);
    /*let ar = Template.GetTemplatePathOptionsObject(cinfo);
    let robj: { [key: string]: ITemplatePathOptions } = {};
    for (let i = 0, iObj = ar, ilen = iObj.length; i < ilen; i++) {
      const itpt = iObj[i];
      robj[itpt.accessKey] = itpt;
    }
    return robj;*/
  }
  static GetArrayOfTemplate(cinfo: codeFileInfo): ITemplatePathOptions[] {
    let ar = [] as ITemplatePathOptions[];
    let objs = Template.GetTemplatePathOptionsObject(cinfo);
    for (let i = 0, iObj = Object.keys(objs), ilen = iObj.length; i < ilen; i++)
      ar.push(objs[iObj[i]]);
    return ar;

  }
  createTemplate() {

  }
  constructor() {
    //Template._CSS_VAR_STAMP++;
    StylerRegs.stampNo++;
    //this.extended.cssVarStampKey = "t" + Template._CSS_VAR_STAMP;
  }

  extended = {
    parentUc: undefined as Usercontrol,
  };
}
export class TemplateNode {
  constructor(main: Template) {
    this.extended.main = main;
    //Template._CSS_VAR_STAMP++;
    //this.extended.cssVarStampKey = "t" + Template._CSS_VAR_STAMP;
  }
  //static _CSS_VAR_STAMP = 0;
  extended = {
    // fileStamp: "",
    // cssVarStampKey: "0",
    main: undefined as Template,
    srcNode: undefined as SourceNode,

    parentUc: undefined as Usercontrol,
    // wrapper: undefined as HTMLElement,
    //  size: new Size(),
    regsMng: new regsManage(),
    setCssVariable: (varList: VariableList, scope: CSSVariableScope) => {
      let styler = this.extended.srcNode.styler;
      switch (scope) {
        case 'global': styler.__VAR.SETVALUE(varList, styler.LOCAL_STAMP_KEY, "g"); break;
        case 'template': styler.__VAR.SETVALUE(varList, styler.TEMPLATE_STAMP_KEY, "t", this.extended.parentUc.ucExtends.self); break;
        case 'local': styler.__VAR.SETVALUE(varList, styler.LOCAL_STAMP_KEY, "l", this.extended.parentUc.ucExtends.self); break;
        case 'internal': styler.__VAR.SETVALUE(varList, StylerRegs.internalKey, "i", this.extended.parentUc.ucExtends.self); break;
      }
    },
    getCssVariable: (key: string, scope: CSSVariableScope): string => {
      let styler = this.extended.srcNode.styler;
      switch (scope) {
        case 'global': return document.body.style.getPropertyValue(
          styler.__VAR.getKeyName(key, styler.ROOT_STAMP_KEY, "g"));
        case 'template': return this.extended.parentUc.ucExtends.self.style.getPropertyValue(
          styler.__VAR.getKeyName(key, styler.TEMPLATE_STAMP_KEY, "t"));
        case 'local': return this.extended.parentUc.ucExtends.self.style.getPropertyValue(
          styler.__VAR.getKeyName(key, styler.LOCAL_STAMP_KEY, "l"));
        case 'internal': return this.extended.parentUc.ucExtends.self.style.getPropertyValue(
          styler.__VAR.getKeyName(key, StylerRegs.internalKey, "i"));
        default: return '';
      }
    },
    generateContent: (jsonRow: {}): string => {
      let _this = this.extended;
      let dta = _this.srcNode.htmlCode.content;
      dta = _this.Events.beforeGenerateContent(dta, jsonRow);
      //dta = _this.regsMng.parse(jsonRow, dta);
      dta = _this.tmaker.compileTemplate(dta)(jsonRow);
      dta = _this.Events.onGenerateContent(dta, jsonRow);
      return dta;
    },
    tmaker: new TemplateMaker(),
    generateNode: (jsonRow: {}): HTMLElement => {
      let _this = this.extended;
      let dta = _this.generateContent(jsonRow) as string;

      let element = dta.$();
      //console.log(_this.stampRow);

      _this.srcNode.passElement(element, { skipTopEle: true });

      _this.Events.onGenerateNode(element, jsonRow);
      return element;
    },

    initializecomponent: (
      _args: ITptOptions,
      tptPathOpt: ITemplatePathOptions,
      tptname: string
    ) => {
      let tptExt = this.extended;
      let param0 = Object.assign(Object.assign({}, TptOptions), _args);
      param0.source.accessKey = tptPathOpt.accessKey;
      tptExt.srcNode = StampNode.registerSoruce(
        {
          key: tptPathOpt.objectKey + "@" + tptPathOpt.accessKey,
          accessName: tptPathOpt.accessKey,
          root: param0.cfInfo.rootInfo,
          generateStamp: false
        });
      let isAlreadyExist = tptExt.srcNode.htmlCode.load(tptPathOpt.htmlContents);
      if (!isAlreadyExist)
        tptExt.srcNode.loadHTML(param0.source.beforeContentAssign);

      let htEle = tptExt.srcNode.dataHT;

      Array.from(tptExt.srcNode.dataHT.attributes)
        .filter((s) => s.nodeName.toLowerCase().startsWith("x.temp-"))
        .forEach((s) => htEle.removeAttribute(s.nodeName));

      let eleHT = param0.elementHT;
      tptExt.parentUc = param0.parentUc;
      tptExt.srcNode.styler.wrapperHT = tptExt.parentUc.ucExtends.wrapperHT;
      tptExt.srcNode.styler.parent = tptExt.parentUc.ucExtends.srcNode.styler;
      tptExt.srcNode.styler.controlName = tptPathOpt.accessKey;

      if (tptExt.parentUc != undefined)
        tptExt.parentUc.ucExtends.srcNode.styler.pushChild(
          param0.cfInfo.mainFilePath +
          "" +
          (param0.source.accessKey == ""
            ? ""
            : "@" + param0.source.accessKey),
          tptExt.srcNode.styler,
          eleHT.nodeName
        );
      tptExt.srcNode.pushCSSByContent(param0.cfInfo.style.fullPath, tptPathOpt.cssContents, tptExt.parentUc.ucExtends.self);
      /*if (!tptExt.srcNode.cssCode.hasContent) {
        tptExt.srcNode.cssCode.content = tptExt.srcNode.styler.parseStyleSeperator_sub({
          data: tptPathOpt.cssContents,
          localNodeElement: tptExt.parentUc.ucExtends.self,
        });
        // tptExt.srcNode.styler.parseStyleSeperator_sub({
        //   data: (tptPathOpt.cssContents == undefined) ?
        //     FileDataBank.readFile(param0.source.cfInfo.style.fullPath, { replaceContentWithKeys: true })
        //     :
        //     tptPathOpt.cssContents,
        //   localNodeElement: tptExt.parentUc.ucExtends.self,
        //   cssVarStampKey: tptExt.main.extended.cssVarStampKey,
        // });
        tptExt.srcNode.loadCSS();
      }*/
      tptExt.parentUc.ucExtends.Events.beforeClose.on(({ prevent }) => {
        tptExt.srcNode.release();
      });

      tptExt.Events.onDataExport = (data) =>
        param0.parentUc.ucExtends.Events.onDataExport(data);
    },
    sampleNode: undefined as HTMLElement,
    Events: {
      //onGettingContent: (jsonRow: any) => { return this.extended.stampRow.content; },
      beforeGenerateContent: (content: string, jsonRow: any) => content,
      onGenerateContent: (content: string, jsonRow: any) => content,
      onGenerateNode: (mainNode: HTMLElement, jsonRow: any) => { },

      onDataExport: (data: TransferDataNode) => {
        return false;
      },

      onDataImport: (data: TransferDataNode) => {
        return false;
      },
    },
    destruct: () => {
      let _this = this;
      let _ext = _this.extended;
      _ext.srcNode.release();
    },
    find: (skey: string, fromHT: HTMLElement) => {
      let exp = /(["=> \w\[\]-^|#~$*.+]*)(::|:)([-\w\(\)]+)/g;
      let ar = skey.split(",");
      let ext = this.extended;
      let q = "";
      let uniqStamp = ext.srcNode.uniqStamp;
      ar = ar.map((s) => {
        s = FilterContent.select_inline_filter(s, uniqStamp);
        return s;
      });
      return Array.from(fromHT.querySelectorAll(ar.join(",")));
    },
    getAllControls: (specific: string[], fromHT: HTMLElement) => {
      if (fromHT == undefined) return;
      let childs: { [key: string]: HTMLElement } = {};
      let uExt = this;
      let fromElement = fromHT;
      if (specific != undefined) {
        let uniqStamp = uExt.extended.srcNode.uniqStamp;
        specific.forEach((itmpath) => {
          if (!(itmpath in childs)) {
            let ele = fromElement.querySelector(
              `[${propOpt.ATTR.X_NAME}='${itmpath}'][${ATTR_OF.UC.ALL}^='${uniqStamp}_']`  // old one  `[${propOpt.ATTR.ACCESS_KEY}='${itmpath}'][${ATTR_OF.UC.UNIQUE_STAMP}='${uniqStamp}']`
            ) as HTMLElement;
            fillObj(itmpath, ele);
          }
        });
      } else {
        let uniqStamp = uExt.extended.srcNode.uniqStamp;
        let eleAr = Array.from(
          fromElement.querySelectorAll(
            `[${propOpt.ATTR.X_NAME}][${ATTR_OF.UC.ALL}^='${uniqStamp}_']`  // old one  `[${propOpt.ATTR.ACCESS_KEY}][${ATTR_OF.UC.UNIQUE_STAMP}='${uniqStamp}']`
          )
        ) as HTMLElement[];
        eleAr.forEach((ele) => {
          fillObj(ele.getAttribute(propOpt.ATTR.X_NAME), ele);
        });
      }
      function fillObj(itmpath: string, htEle: HTMLElement) {
        if (htEle != undefined) childs[itmpath] = htEle;
        else console.warn("empty-controls-returned");
      }
      return childs;
    },
  };
}