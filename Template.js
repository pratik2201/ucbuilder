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
const { fileInfo } = require("@ucbuilder:/build/codeFileInfo");
const { newObjectOpt } = require("@ucbuilder:/global/objectOpt");

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

    constructor() {

    }
    extended = {
        fileStamp: "",
        /** @type {userControlStampRow}  */
        stampRow: undefined,
        /** @type {Usercontrol}  */
        parentUc: undefined,
        regsMng: new regsManage(),




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

    extended = {
        fileStamp: "",
        /** @type {Template}  */
        main: undefined,
        /** @type {userControlStampRow}  */
        stampRow: undefined,
        /** @type {Usercontrol}  */
        parentUc: undefined,
        regsMng: new regsManage(),
        /**
       * @param {{}} jsonRow 
       * @returns {string}
       */
        generateContent(jsonRow) {
            let dta = this.stampRow.content;//this.content;
            // console.log(dta);
            dta = this.Events.beforeGenerateContent(dta, jsonRow);
            ///dta = this.mainEvents.beforeGenerateContent(dta, jsonRow);
            dta = this.regsMng.parse(jsonRow, dta);
            dta = this.Events.onGenerateContent(dta, jsonRow);
            // dta = this.mainEvents.onGenerateContent(dta, jsonRow);
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
         * 
         */
        initializecomponent: (_args, tptPathOpt) => {
            let tptExt = this.extended;
            
            /** @type {tptOptions}  */ 
            let param0 = newObjectOpt.copyProps(_args,tptOptions);
            param0.source.cfInfo.parseUrl(param0.source.cfInfo.html)
            param0.source.templateName = tptPathOpt.name;
            console.log(param0.source.cfInfo.html.path);
            tptExt.stampRow = userControlStamp.getStamp(param0.source);
            let ht = tptExt.stampRow.dataHT;
            Array.from(tptExt.stampRow.dataHT.attributes)
                .filter(s => s.nodeName.toLowerCase().startsWith("x.temp-"))
                .forEach(s => ht.removeAttribute(s.nodeName));
            //tptExt.stampRow.content = ht.outerHTML;

            /** @type {HTMLElement}  */
            let eleHT = param0.elementHT;
            tptExt.parentUc = param0.parentUc;
            
            if (tptExt.parentUc != undefined)
                tptExt.parentUc.ucExtends.stampRow.styler
                    .pushChild(param0.source.cfInfo.mainFilePath + "" + (param0.source.templateName == "" ? "" : "@" + param0.source.templateName),
                        tptExt.stampRow.styler, eleHT.nodeName);

            tptPathOpt.cssContents = tptExt.stampRow.styler.parseStyleSeperator(
                (tptPathOpt.cssContents == undefined ?
                    fileDataBank.readFile(param0.source.cfInfo.style.rootPath)
                    :
                    tptPathOpt.cssContents));

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
                console.log(fromElement.isConnected);
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
            // console.log(ext.templeteList);
        }
    }

}
module.exports = { Template, TemplateNode }