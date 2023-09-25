const { propOpt } = require("@ucbuilder:/build/common");
const { regsManage } = require("@ucbuilder:/build/regs/regsManage");
const { fileDataBank } = require("@ucbuilder:/global/fileDataBank");
const { filterContent } = require("@ucbuilder:/global/filterContent");
const { loadGlobal } = require("@ucbuilder:/global/loadGlobal");
const { ATTR_OF } = require("@ucbuilder:/global/runtimeOpt");
const { stylerRegs } = require("@ucbuilder:/global/stylerRegs");
const { userControlStampRow, userControlStamp } = require("@ucbuilder:/global/userControlStamp");
const { Usercontrol } = require("@ucbuilder:/Usercontrol");
const { tptOptions } = require("@ucbuilder:/enumAndMore");
const { transferDataNode } = require("@ucbuilder:/global/drag/transferation");
const { commonEvent } = require("@ucbuilder:/global/commonEvent");

class Template {
    /** @type {tptOptions}  */
    static get tptOptionsStc() { return undefined; }

    constructor() {

    }
    extended = {
        fileStamp: "",
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
         * @returns {container}
         */
        generateNode(jsonRow) {

            let dta = this.generateContent(jsonRow);
            let element = dta.$();
            this.stampRow.passElement(element);
            this.Events.onGenerateNode(element, jsonRow);
            // this.Events.onGenerateNode(element, jsonRow);
            return element;
        },



        /** @param {tptOptions} param0 */
        initializecomponent: (param0) => {
            let tptExt = this.extended;
            //console.log(param0.source);
            tptExt.stampRow = userControlStamp.getStamp(param0.source);

            let ht = tptExt.stampRow.dataHT;
            Array.from(tptExt.stampRow.dataHT.attributes)
                .filter(s => s.nodeName.toLowerCase().startsWith("x.temp-"))
                .forEach(s => ht.removeAttribute(s.nodeName));
            tptExt.stampRow.content = ht.outerHTML;

            /** @type {container}  */
            let eleHT = param0.elementHT;
            tptExt.parentUc = param0.parentUc;

            if (tptExt.parentUc != undefined)
                tptExt.parentUc.ucExtends
                    .stampRow.styler.pushChild(param0.source.fInfo.mainFilePath,
                        tptExt.stampRow.styler, eleHT.nodeName);
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


            this.extended.fillTemplates(tptExt.stampRow.dataHT);
            tptExt.Events.onDataExport = (data) =>
                param0.parentUc.ucExtends.Events.onDataExport(data);


            param0.elementHT.remove();
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
             * @param {container} mainNode 
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

            /** @param {transferDataNode} data @returns bool whether successful or not */
            onDataExport: (data) => {
                return false;
            },

            /** @param {transferDataNode} data @returns bool whether successful or not */
            onDataImport: (data) => {
                return false;
            },
        },
        /**
            * @param {string} skey 
            * @param {container} fromHT 
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
       * @param {container} fromHT 
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
                let eleAr = Array.from(fromElement.querySelectorAll(`[${propOpt.ATTR.ACCESS_KEY}][${ATTR_OF.UC.UNIQUE_STAMP}='${uniqStamp}']`));
                eleAr.forEach((ele) => {
                    fillObj(ele.getAttribute(propOpt.ATTR.ACCESS_KEY), ele);
                });
            }
            /**
             * @param {string} itmpath 
             * @param {container} htEle 
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
        /** @param {container} mainNode */
        fillTemplates: (mainNode) => {
            let ext = this.extended;
            /** @type {{key:string,node:TempleteNode}[]}  */
            ext.templeteList = {};
            let nodes = mainNode.querySelectorAll(":scope > [x-role]");
            if (nodes.length == 0) {
                ext.templeteList[propOpt.ATTR.TEMPLETE_DEFAULT] = mainNode.outerHTML;
            } else {
                /** @type {container}  */
                let mNode = mainNode.cloneNode(true);
                mNode.innerHTML = "";
                nodes.forEach(node => {
                    let role = node.getAttribute('x-role');
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
class TempleteNode {
    /**
     * @param {Template} main
     * @param {string} content 
     */
    constructor(main, content) {
        this.main = main;
        this.extended = this.main.extended;
        this.mainEvents = this.extended.Events;
        this.regsMng = this.extended.regsMng;
        this.stampRow = this.extended.stampRow;

        this.content = content;
    }
    Events = {

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
         * @param {container} mainNode 
         * @param {{}} jsonRow 
         * @returns {string}
         */
        onGenerateNode: (mainNode, jsonRow) => {

        },
    };

}
module.exports = { Template, TempleteNode }