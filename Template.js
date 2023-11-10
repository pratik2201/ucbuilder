const { propOpt, strOpt } = require("@ucbuilder:/build/common");
const { regsManage } = require("@ucbuilder:/build/regs/regsManage");
const { fileDataBank } = require("@ucbuilder:/global/fileDataBank");
const { filterContent } = require("@ucbuilder:/global/filterContent");
const { loadGlobal } = require("@ucbuilder:/global/loadGlobal");
const { ATTR_OF } = require("@ucbuilder:/global/runtimeOpt");
const { stylerRegs } = require("@ucbuilder:/global/stylerRegs");
const { userControlStampRow, userControlStamp } = require("@ucbuilder:/global/userControlStamp");
const { Usercontrol } = require("@ucbuilder:/Usercontrol");
const { tptOptions, templatePathOptions } = require("@ucbuilder:/enumAndMore");
const { transferDataNode } = require("@ucbuilder:/global/drag/transferation");
const { commonEvent } = require("@ucbuilder:/global/commonEvent");
const { fileInfo, codeFileInfo } = require("@ucbuilder:/build/codeFileInfo");
const { newObjectOpt } = require("@ucbuilder:/global/objectOpt");
const { Size } = require("@ucbuilder:/global/drawing/shapes");

class Template {
    static getTemplates = {
        /**
         * @param {string} htmlContents content 
         * @param {string} mainFilePath main html file path 
         * @param {(node:templatePathOptions)=>{}} callback call each templateNode
         */
        loopThrough(htmlContents, mainFilePath, callback) {
            /** @type {HTMLElement}  */
            let mainTag = "<pre><pre>".$();
            mainTag.innerHTML = htmlContents;
            let tList = mainTag.querySelectorAll(":scope > [x-from]");
            if (tList.length == 0) {
                callback({
                    name: propOpt.ATTR.TEMPLETE_DEFAULT,
                    mainFilePath: mainFilePath,
                    htmlContents: htmlContents,
                    cssContents: fileDataBank.readFile(mainFilePath + '.scss')
                });
            } else {
                tList.forEach(element => {
                    let fInfo = new fileInfo();
                    fInfo.parse(element.getAttribute("x-from"));
                    mainFilePath = fInfo.fullPath;
                    callback({
                        name: element.getAttribute(propOpt.ATTR.ACCESS_KEY),
                        mainFilePath: mainFilePath,
                        htmlContents: fileDataBank.readFile(mainFilePath + '.html'),
                        cssContents: fileDataBank.readFile(mainFilePath + '.scss')
                    });
                });
            }
        },
        /**
        * @param {string} htmlContents content 
        * @param {string} mainFilePath main html file path 
        * @returns {templatePathOptions[] & {}}
        */
        byContents(htmlContents, mainFilePath, returnArray = true) {
            if (returnArray === true) {
                let rtrnAr = [];
                this.loopThrough(htmlContents, mainFilePath, (node) => { rtrnAr.push(node); });
                return rtrnAr;
            } else {
                let rtrnObj = {};
                this.loopThrough(htmlContents, mainFilePath, (node) => {
                    rtrnObj[node.name] = node;
                });
                return rtrnObj;
            }
        },
        /**
         * @param {string} htmlFilePath 
         * @returns {templatePathOptions[] & {}}
         */
        byHTMLFilePath(htmlFilePath, returnArray = true) {
            let mainFilePath = strOpt.trim_(htmlFilePath, ".html");
            let htmlContents = fileDataBank.readFile(mainFilePath + '.html');
            return this.byContents(htmlContents, mainFilePath, returnArray);
        }
    }
    static _CSS_VAR_STAMP = 0;
    constructor() {
        Template._CSS_VAR_STAMP++;
        this.extended.cssVarStampKey = 't' + Usercontrol._CSS_VAR_STAMP;
    }
    extended = {
        fileStamp: "",
        /** @type {userControlStampRow}  */
        stampRow: undefined,
        /** @type {Usercontrol}  */
        parentUc: undefined,
        regsMng: new regsManage(),

        cssVarStampKey: '0',


        /** @param {tptOptions} param0 */
        initializecomponent: (param0) => {
            /* let tptExt = this.extended;
 
             tptExt.stampRow = userControlStamp.getStamp(param0.source);
             // mainTag.innerHTML = fileDataBank.readFile(param0.source.fInfo.html.fullPath);
             Template.getTemplatesByHTMLFilePath(param0.source.fInfo.html.fullPath);
             let ht = tptExt.stampRow.dataHT;
             let attrs = Array.from(tptExt.stampRow.dataHT.attributes);
 
             attrs
                 .filter(s => s.nodeName.toLowerCase().startsWith("x.temp-"))
                 .forEach(s => ht.removeAttribute(s.nodeName));
             //tptExt.stampRow.content = ht.outerHTML;
 
              type {HTMLElement}  
             let eleHT = param0.elementHT;
             tptExt.parentUc = param0.parentUc;
 
             if (tptExt.parentUc != undefined)
                 tptExt.parentUc.ucExtends
                     .stampRow.styler.pushChild(param0.source.fInfo.mainFilePath,
                         tptExt.stampRow.styler, eleHT.nodeName);
 
             // console.log(tptExt.stampRow.cInfo.style.rootPath);
             param0.source.cssContents = tptExt.stampRow.styler.parseStyleSeperator(
                 (param0.source.cssContents == undefined ?
                     fileDataBank.readFile(param0.source.fInfo.style.rootPath)
                     :
                     param0.source.cssContents));
 
             loadGlobal.pushRow({
                 url: param0.source.fInfo.style.rootPath,
                 stamp: tptExt.stampRow.stamp,
                 reloadDesign: param0.source.reloadDesign,
                 reloadKey: param0.source.reloadKey,
                 cssContents: param0.source.cssContents
             });
 
 
             //this.extended.fillTemplates(tptExt.stampRow.dataHT);
 
 
             param0.elementHT.remove();
             */
        },

    }
}
class TemplateNode {
    /**
     * @param {Template} main
     */
    constructor(main) {
        this.extended.main = main;
    }
    static _CSS_VAR_STAMP = 0;
    extended = {
        fileStamp: "",
        /** @type {Template}  */
        main: undefined,
        /** @type {userControlStampRow}  */
        stampRow: undefined,
        /** @type {Usercontrol}  */
        parentUc: undefined,
        size: new Size(),
        regsMng: new regsManage(),
        /**
        * @param {{}} jsonRow 
        * @returns {string}
        */
        generateContent(jsonRow) {
            let dta = this.stampRow.content;//this.content;
            // console.log(dta);
            dta = this.Events.beforeGenerateContent(dta, jsonRow);
            dta = this.regsMng.parse(jsonRow, dta);
            dta = this.Events.onGenerateContent(dta, jsonRow);
            return dta;
        },


        /**
         * @param {{}} jsonRow 
         * @returns {HTMLElement}
         */
        generateNode(jsonRow) {

            let dta = this.generateContent(jsonRow);
            let element = dta.$();
            this.stampRow.passElement(element);
            this.Events.onGenerateNode(element, jsonRow);
            // this.Events.onGenerateNode(element, jsonRow);
            return element;
        },



        /** 
         * @param {tptOptions} _args
         * @param {templatePathOptions} tptPathOpt
         * @param {string} tptname
         */
        initializecomponent: (_args, tptPathOpt, tptname) => {
            let tptExt = this.extended;
            _args.source.cfInfo = new codeFileInfo(".tpt");
            //console.log(_args.source.parentRefName);
            /** @type {tptOptions}  */
            let param0 = newObjectOpt.copyProps(_args, tptOptions);
            _args.source.cfInfo.parseUrl(tptPathOpt.mainFilePath);

            if (tptname !== propOpt.ATTR.TEMPLETE_DEFAULT) {
                let fpath = param0.source.cfInfo.html.rootPath;
                fpath = strOpt.trim_(fpath, ".html", ".scss");
                fpath += "." + tptname;
                param0.source.cfInfo.html.parse(fpath + ".html", false);
                param0.source.cfInfo.style.parse(fpath + ".scss", false);
            }
            param0.source.templateName = tptPathOpt.name;

            tptExt.stampRow = userControlStamp.getStamp(param0.source);
            let htEle = tptExt.stampRow.dataHT;

            Array.from(tptExt.stampRow.dataHT.attributes)
                .filter(s => s.nodeName.toLowerCase().startsWith("x.temp-"))
                .forEach(s => htEle.removeAttribute(s.nodeName));
            //tptExt.stampRow.content = ht.outerHTML;

            /** @type {HTMLElement}  */
            let eleHT = param0.elementHT;
            tptExt.parentUc = param0.parentUc;
            
            if (tptExt.parentUc != undefined)
                tptExt.parentUc.ucExtends.stampRow.styler
                    .pushChild(param0.source.cfInfo.mainFilePath + "" + (param0.source.templateName == "" ? "" : "@" + param0.source.templateName),
                        tptExt.stampRow.styler, eleHT.nodeName);
            console.log(param0.source.cfInfo.html.fullPath);
            //console.log(tptExt.parentUc);
            //console.log(tptExt.main.extended.cssStamp);
            tptPathOpt.cssContents = tptExt.stampRow.styler.parseStyleSeperator_sub(
                {
                    data: (tptPathOpt.cssContents == undefined ?
                        fileDataBank.readFile(param0.source.cfInfo.style.rootPath)
                        :
                        tptPathOpt.cssContents),
                    localNodeElement: tptExt.parentUc.ucExtends.self,
                    cssVarStampKey:tptExt.main.extended.cssVarStampKey
                });

            loadGlobal.pushRow({
                url: param0.source.cfInfo.style.rootPath,
                stamp: tptExt.stampRow.stamp,
                reloadDesign: param0.source.reloadDesign,
                reloadKey: param0.source.reloadKey,
                cssContents: tptPathOpt.cssContents
            });


            //this.extended.fillTemplates(tptExt.stampRow.dataHT);
            tptExt.Events.onDataExport = (data) =>
                param0.parentUc.ucExtends.Events.onDataExport(data);

            document.body.appendChild(htEle);
            this.extended.size.setBy.HTMLEle(htEle);
            htEle.remove();
        },
        Events: {

            /**
            * @param {string} content 
            * @param {{}} jsonRow 
            * @returns {string}
            */
            beforeGenerateContent: (content, jsonRow) => content,
            /**
            * @param {string} content 
            * @param {{}} jsonRow 
            * @returns {string}
            */
            onGenerateContent: (content, jsonRow) => content,
            /**
             * @param {HTMLElement} mainNode 
             * @param {{}} jsonRow 
             * @returns {string}
             */
            onGenerateNode: (mainNode, jsonRow) => {

            },
            /*
            **
             * @type {{on:(callback = (
             *          itemnode:HTMLElement,
             *          index:number
             * ) =>{})} & commonEvent}
             *
            newItemGenerate: new commonEvent(),*/

            /** @param {transferDataNode} data @returns {boolean} whether successful or not */
            onDataExport: (data) => {
                return false;
            },

            /** @param {transferDataNode} data @returns {boolean} whether successful or not */
            onDataImport: (data) => {
                return false;
            },
        },
        /**
            * @param {string} skey 
            * @param {HTMLElement} fromHT 
            * @returns {container[]}
            */
        find: (skey, fromHT) => {
            let exp = /(["=> \w\[\]-^|#~$*.+]*)(::|:)([-\w\(\)]+)/g;
            let ar = skey.split(',');
            let ext = this;
            let q = "";
            let uniqStamp = ext.extended.stampRow.uniqStamp;
            ar = ar.map((s) => {
                s = filterContent.select_inline_filter(s, uniqStamp);
                return s;
            });
            ///console.log(ar);
            return Array.from(ext.wrapper.elementHT.querySelectorAll(ar.join(",")));
        },
        /**
       * @param {HTMLElement} fromHT 
       * @returns {container{}}
       */
        getAllControls: (specific, fromHT) => {
            let childs = {};
            let uExt = this;
            let fromElement = fromHT;
            if (specific != undefined) {
                let uniqStamp = uExt.extended.stampRow.uniqStamp;
                specific.forEach(itmpath => {
                    if (!(itmpath in childs)) {
                        let ele = fromElement.querySelector(`[${propOpt.ATTR.ACCESS_KEY}='${itmpath}'][${ATTR_OF.UC.UNIQUE_STAMP}='${uniqStamp}']`);
                        fillObj(itmpath, ele);
                    }
                });
            } else {
                let uniqStamp = uExt.extended.stampRow.uniqStamp;
                //console.log(fromElement.isConnected);
                let eleAr = Array.from(fromElement.querySelectorAll(`[${propOpt.ATTR.ACCESS_KEY}][${ATTR_OF.UC.UNIQUE_STAMP}='${uniqStamp}']`));
                eleAr.forEach((ele) => {
                    fillObj(ele.getAttribute(propOpt.ATTR.ACCESS_KEY), ele);
                });
            }
            /**
             * @param {string} itmpath 
             * @param {HTMLElement} htEle 
             */
            function fillObj(itmpath, htEle) {
                if (htEle != undefined)
                    childs[itmpath] = htEle;
                else
                    console.warn('empty-controls-returned');
            }
            return childs;
        },

        templeteList: {},
        /** @param {HTMLElement} mainNode */
        fillTemplates: (mainNode) => {
            let ext = this.extended;
            /** @type {{key:string,node:TemplateNode}[]}  */
            ext.templeteList = {};
            let nodes = mainNode.querySelectorAll(`:scope > [${propOpt.ATTR.TEMPLETE_ACCESS_KEY}]`);
            if (nodes.length == 0) {
                ext.templeteList[propOpt.ATTR.TEMPLETE_DEFAULT] = mainNode.outerHTML;
            } else {
                /** @type {HTMLElement}  */
                let mNode = mainNode.cloneNode(true);
                mNode.innerHTML = "";
                nodes.forEach(node => {
                    let role = node.getAttribute(propOpt.ATTR.TEMPLETE_ACCESS_KEY);
                    let roleLwr = role.toLowerCase();
                    if (!(roleLwr in ext.templeteList)) {
                        mNode.innerHTML = node.innerHTML;
                        ext.templeteList[role] = mNode.outerHTML;
                    }
                });
            }
        }
    }

}
module.exports = { Template, TemplateNode }