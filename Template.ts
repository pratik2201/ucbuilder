import { codeFileInfo } from "ucbuilder/build/codeFileInfo";
import { pathInfo, propOpt, strOpt } from "ucbuilder/build/common";
import { regsManage } from "ucbuilder/build/regs/regsManage";
import { TemplatePathOptions, templatePathOptions, tptOptions, TptOptions } from "ucbuilder/enumAndMore";
import { TransferDataNode } from "ucbuilder/global/drag/transferation";
import { FileDataBank } from "ucbuilder/global/fileDataBank";
import { FilterContent } from "ucbuilder/global/filterContent";
import { newObjectOpt } from "ucbuilder/global/objectOpt";
import { ATTR_OF } from "ucbuilder/global/runtimeOpt";
import { SourceNode, StampNode } from "ucbuilder/lib/StampGenerator";
import { StylerRegs, VariableList } from "ucbuilder/lib/stylers/StylerRegs";
import { Usercontrol } from "ucbuilder/Usercontrol";
interface TptTextObjectNode<K> {
  content: string,
  row: K
}
export class Template {
  static extractArgs = (args: any) => newObjectOpt.extractArguments(args);
  static getTemplateStatus(iele: HTMLElement) {
    let rtrn = {
      valid: false,
      isSeperatePathSpecified: false,
      name: undefined as string,
      xpath: undefined as string,
      relative: undefined as string,
      htmlpath: undefined as string,
      csspath: undefined as string,
    };
    if (iele.nodeName == 'TPT' && iele.hasAttribute('x-name')) {
      rtrn.xpath = iele.getAttribute('x-path');
      rtrn.name = iele.getAttribute('x-name');
      rtrn.relative = iele.getAttribute('x-relative');
      rtrn.htmlpath = iele.getAttribute('html-path');
      rtrn.csspath = iele.getAttribute('css-path');
      if (rtrn.csspath != null && rtrn.htmlpath != null) {
        rtrn.valid = true;
        rtrn.isSeperatePathSpecified = true;
      } else if (rtrn.xpath != null || rtrn.relative != null) {
        rtrn.valid = true;
        rtrn.isSeperatePathSpecified = false;
      }
    }
    return rtrn;
  }
  static fillContent(htpath: string, cspath: string) {
    htpath = htpath.trimText_('.html').trimText_('.scss');
    cspath = cspath.trimText_('.scss').trimText_('.html');
    return {
      htmlPath: htpath + '.html',
      cssPath: cspath + '.scss'
    };
  }
  static getTemplateOptionByElement(iele: HTMLElement, cinfo: codeFileInfo): TemplatePathOptions | undefined {
    //let stts = this.getTemplateStatus(iele);
    let rtrn: TemplatePathOptions = {
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
        csspath = cinfo.mainFileRootPath.removeExtension() + '/' + xrelativeChild + '.scss';
        htmlpath = cinfo.mainFilePath.removeExtension() + '/' + xrelativeChild + '.html';
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
      } else  return rtrn;      
      rtrn.objectKey = csspath;
      rtrn.accessKey = name;
      rtrn.cssContents = FileDataBank.readFile(csspath, { isFullPath: isCSSFullpath, replaceContentWithKeys: true });
      rtrn.htmlContents = FileDataBank.readFile(htmlpath, { isFullPath: isHTMLFullpath, });
    } else {
      rtrn.objectKey = cinfo.style.rootPath;
      rtrn.cssContents = FileDataBank.readFile(cinfo.style.fullPath, { replaceContentWithKeys: true });
      rtrn.htmlContents = iele.outerHTML;
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
  private static GetTemplatePathOptionsArray(cinfo: codeFileInfo): TemplatePathOptions[] {
    let data = FileDataBank.readFile(cinfo.html.fullPath, {});
    let ele = data.$();
    let rtrn: TemplatePathOptions[] = [];
    if (ele.length != undefined) {
      for (let i = 0, iObj = ele, ilen = iObj.length; i < ilen; i++) {
        const iele = iObj[i];
        let rs = Template.getTemplateOptionByElement(iele, cinfo);
        rtrn.push(rs);
        /*if (rs.objectKey != undefined) {
          rtrn.push(rs);
        } else {
          let c = Template.fillContent(cinfo.html.rootPath, cinfo.html.rootPath);
          rtrn.push({
            accessKey: 'primary',
            htmlContents: iele.outerHTML,
            cssContents: FileDataBank.readFile(cinfo.style.fullPath, { isFullPath: true, replaceContentWithKeys: true }),
            objectKey: cinfo.style.rootPath,
            mainTpt: undefined,
          });
        }*/
      }
    } else {
      let rs = Template.getTemplateOptionByElement(ele, cinfo);
      rtrn.push(rs);
      /*let c = Template.fillContent(cinfo.html.fullPath, cinfo.html.fullPath);
      rtrn.push({
        accessKey: 'primary',
        htmlContents: ele.outerHTML,
        cssContents: FileDataBank.readFile(cinfo.style.fullPath, { isFullPath: false, replaceContentWithKeys: true }),
        objectKey: cinfo.style.rootPath,
        mainTpt: undefined,
      });*/
    }
    return rtrn;
    /*let mainFilePath = strOpt.trim_(htmlFilePath, ".html");
    let htmlContents = FileDataBank.readFile(mainFilePath + ".html", {});
    return this.byContents(htmlContents, mainFilePath, returnArray);*/
  }
  static byHTMLFileObject(cinfo: codeFileInfo): { [key: string]: TemplatePathOptions } {
    let ar = Template.GetTemplatePathOptionsArray(cinfo);
    let robj: { [key: string]: TemplatePathOptions } = {};
    for (let i = 0, iObj = ar, ilen = iObj.length; i < ilen; i++) {
      const itpt = iObj[i];
      robj[itpt.accessKey] = itpt;
    }
    return robj;
  }
  static byHTMLFileArray(cinfo: codeFileInfo): TemplatePathOptions[] {
    return Template.GetTemplatePathOptionsArray(cinfo);
  }
  static getTemplates = {


    /**
     * @param {string} htmlFilePath
     * @returns {TemplatePathOptions[] & {}}
     */
    byDirectory(jsFilepath: string, returnArray = true) {
      if (returnArray) {
        let rtrnAr: TemplatePathOptions[] = [];
        this.loopDirectory(jsFilepath, (row) => {
          rtrnAr.push(row);
        });
        return rtrnAr;
      } else {
        let rtrnObj: { [key: string]: TemplatePathOptions } = {};
        this.loopDirectory(jsFilepath, (node: TemplatePathOptions) => {
          rtrnObj[node.accessKey] = node;
        });
        return rtrnObj;
      }
    },
    /**
     * @param {string} filepath
     * @returns {TemplatePathOptions[] & {}}
     */
    loopDirectory(
      filepath: string,
      callback: (row: TemplatePathOptions) => void = (row) => { }
    ) {
      let fs = require("fs");
      filepath = filepath.toLowerCase();
      let fpart = pathInfo.getFileInfoPartly(filepath);
      let DirectoryContents = fs.readdirSync(fpart.dirPath + "/");
      DirectoryContents.forEach((filename) => {
        filename = filename.toLowerCase();
        if (
          filename.endsWith(".html") &&
          filename.startsWith(fpart.fileName + ".tpt")
        ) {
          let fnm = fpart.fileName + ".tpt";
          let extLessFileName = strOpt.trim_(filename, ".html");
          let tp = strOpt._trim(extLessFileName, fnm);
          tp = tp.trim();
          let row = Object.assign({}, templatePathOptions);
          row.accessKey = tp != "" ? tp._trim(".") : propOpt.ATTR.TEMPLETE_DEFAULT;
          row.objectKey = pathInfo.cleanPath(
            fpart.dirPath + extLessFileName
          );
          row.htmlContents = FileDataBank.readFile(row.objectKey + ".html", {});
          row.cssContents = FileDataBank.readFile(row.objectKey + ".scss", {});
          callback(row);
        }
      });
    },
  };
  //static _CSS_VAR_STAMP = 0;
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
    setCSS_globalVar(varList: VariableList/*,key: string, value: string*/) {

      StylerRegs.__VAR.SETVALUE(
        varList,
        '' + this.srcNode.styler.rootInfo.id,
        "g"
      );
    },
    setCSS_templateVar: (varList: VariableList/*,key: string, value: string*/) => {
      StylerRegs.__VAR.SETVALUE(
        varList,
        this.extended.srcNode.styler.TEMPLATE_STAMP_KEY,
        "t",
        this.extended.parentUc.ucExtends.self
      );
    },
    setCSS_localVar: (varList: VariableList/*,key: string, value: string*/) => {
      StylerRegs.__VAR.SETVALUE(
        varList,
        this.extended.srcNode.styler.LOCAL_STAMP_KEY,
        "l",
        this.extended.parentUc.ucExtends.self
      );
    },
    setCSS_internalVar: (varList: VariableList/*,key: string, value: string*/) => {

      StylerRegs.__VAR.SETVALUE(
        varList,
        StylerRegs.internalKey,
        "i",
        this.extended.parentUc.ucExtends.self
      );
    },

    getCSS_globalVar: (key: string) => {
      return document.body.style.getPropertyValue(
        StylerRegs.__VAR.getKeyName(key, '' + this.extended.srcNode.styler.ROOT_STAMP_KEY, "g")
      );
    },
    getCSS_templateVar: (key: string) => {
      return this.extended.parentUc.ucExtends.self.style.getPropertyValue(
        StylerRegs.__VAR.getKeyName(key, this.extended.srcNode.styler.TEMPLATE_STAMP_KEY, "t")
      );
    }, getCSS_localVar: (key: string) => {
      return this.extended.parentUc.ucExtends.self.style.getPropertyValue(
        StylerRegs.__VAR.getKeyName(key, this.extended.srcNode.styler.LOCAL_STAMP_KEY, "l")
      );
    },
    getCSS_internalVar: (key: string) => {
      return this.extended.parentUc.ucExtends.self.style.getPropertyValue(
        StylerRegs.__VAR.getKeyName(key, StylerRegs.internalKey, "i")
      );
    },
    generateContent: (jsonRow: {}): string => {
      let _this = this.extended;
      let dta = _this.srcNode.htmlCode.content;
      dta = _this.Events.beforeGenerateContent(dta, jsonRow);
      dta = _this.regsMng.parse(jsonRow, dta);
      dta = _this.Events.onGenerateContent(dta, jsonRow);
      return dta;
    },

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
      _args: TptOptions,
      tptPathOpt: TemplatePathOptions,
      tptname: string
    ) => {
      let tptExt = this.extended;
      _args.source.cfInfo = new codeFileInfo(".tpt");
      let toj = Object.assign({}, tptOptions);
      let param0 = Object.assign(toj, _args);
      //console.log(toj);

      _args.source.cfInfo.parseUrl(tptPathOpt.objectKey);
      // console.log(ATTR_OF.UC.UNIQUE_STAMP);

      if (tptname !== propOpt.ATTR.TEMPLETE_DEFAULT) {
        let fpath = param0.source.cfInfo.html.rootPath;
        fpath = strOpt.trim_(fpath, ".html", ".scss");
        fpath += "." + tptname;
        param0.source.cfInfo.html.parse(fpath + ".html", false);
        param0.source.cfInfo.style.parse(fpath + ".scss", false);
      }
      param0.source.templateName = tptPathOpt.accessKey;
      tptExt.srcNode = StampNode.registerSoruce(
        {
          key: param0.source.cfInfo.mainFileRootPath + "@" + tptPathOpt.accessKey,
          accessName: tptPathOpt.accessKey,
          root: param0.source.cfInfo.rootInfo
        });
      let isAlreadyExist = tptExt.srcNode.htmlCode.load({ path: param0.source.cfInfo.html.fullPath });
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
      tptExt.srcNode.styler.controlName = param0.accessName;

      if (tptExt.parentUc != undefined)
        tptExt.parentUc.ucExtends.srcNode.styler.pushChild(
          param0.source.cfInfo.mainFilePath +
          "" +
          (param0.source.templateName == ""
            ? ""
            : "@" + param0.source.templateName),
          tptExt.srcNode.styler,
          eleHT.nodeName
        );
      if (!tptExt.srcNode.cssCode.hasContent) {
        tptExt.srcNode.cssCode.content = tptExt.srcNode.styler.parseStyleSeperator_sub({
          data: (tptPathOpt.cssContents == undefined) ?
            FileDataBank.readFile(param0.source.cfInfo.style.fullPath, { replaceContentWithKeys: true })
            :
            tptPathOpt.cssContents,
          localNodeElement: tptExt.parentUc.ucExtends.self,
          //cssVarStampKey: tptExt.main.extended.cssVarStampKey,
        });
        tptExt.srcNode.loadCSS();
      }
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