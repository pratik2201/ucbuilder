const { newObjectOpt } = require("@ucbuilder:/global/objectOpt");
const { ucOptions, tptOptions } = require('@ucbuilder:/enumAndMore');
const { ResourcesUC } = require("@ucbuilder:/ResourcesUC");
const { objectOpt, propOpt } = require("@ucbuilder:/build/common");

/**
 * @typedef {import ('@ucbuilder:/Usercontrol').Usercontrol} Usercontrol
 * @typedef {import ('@ucbuilder:/Template').Template} Template
 * @typedef {import ('@ucbuilder:/Template').TemplateNode} TemplateNode
 */

class intenseGenerator {
    /**
     * @param {string} path  
     * @param {ucOptions} pera 
     * @returns {Usercontrol}
     */
    static generateUC(path, pera, ...args) {
        //let param0 = newObjectOpt.clone(ucOptions);
        //newObjectOpt.copyProps(pera, param0);
        let param0 = newObjectOpt.copyProps(pera, ucOptions);

        let row = ResourcesUC.codefilelist.getObj(path);
        param0.source.cfInfo = row.codefileObj;
        if (param0.wrapperHT == undefined) {
            let tname = row.codefileObj.name;
            param0.wrapperHT = (param0.parentUc == undefined) ? ResourcesUC.contentHT : param0.parentUc.ucExtends.passElement(`<${tname}></${tname}>`.$());
        } else {
            if (param0.wrapperHT.hasAttribute("x-nodeName")) {
                param0.source.nodeNameAs = param0.wrapperHT.getAttribute("x-nodeName");
                switch (param0.source.nodeNameAs) {
                    case 'targetElement': param0.source.targetElementNodeName = param0.wrapperHT.nodeName; break;
                    case 'random': break;
                    default: param0.source.nodeNameAs = 'wrapper'; break;
                }
            }
        }
        args.push(param0);
        /** @type {Usercontrol}  */
        let uc = (new (row.obj)(...args));
        let ext = uc.ucExtends;
        ext.session.prepareForAutoLoadIfExist();
        ext.Events.loaded.fire();
        if (pera.loadAt != undefined) pera.loadAt.appendChild(node);
        return uc;
    }


    /**
    * @param {string} path 
    * @param {tptOptions} pera 
    * @param {Template} parentuc 
    * @returns 
    */
    static generateTPT(path, pera, ...args) {
        //let param0 = newObjectOpt.clone(tptOptions);
        //newObjectOpt.copyProps(pera, param0);
        let param0 = newObjectOpt.copyProps(pera, tptOptions);        
        let row = ResourcesUC.codefilelist.getObj(path);
        
        param0.source.cfInfo = row.codefileObj;
        if (param0.elementHT == undefined) {
            let tname = row.codefileObj.name;
            param0.elementHT = (param0.parentUc == undefined) ? ResourcesUC.contentHT : param0.parentUc.ucExtends.passElement(`<${tname}></${tname}>`.$());
        }
        args.push(param0);
        /** @type {Template}  */
        let uc = (new (row.obj)(...args));
        return uc;
    }
    /**
     * @param {Template|TemplateNode|string} val 
     * @param {Usercontrol} parentUc 
     * @return {TemplateNode}
     */
    static parseTPT(val, parentUc) {
        //console.log(val);
        // debugger;
        if (objectOpt.parse(val, 'Template')) {
            return val[propOpt.ATTR.TEMPLETE_DEFAULT];
        } else if (objectOpt.parse(val, 'TemplateNode')) {
            return val;
        } else if (objectOpt.parse(val, 'String')) {
            /** @type {string[]}  */
            let splval = val.split(";");
            let tpt = intenseGenerator.generateTPT(val, { parentUc: parentUc });
            /*console.log(val);
            console.log(tpt);*/
            let res = (splval.length === 1) ?
                tpt[propOpt.ATTR.TEMPLETE_DEFAULT]
                :
                tpt[splval[1].trim()];
            return res;

        }
    }
    /**
     * @param {Usercontrol|string|container} val 
     * @param {Usercontrol} parentUc 
     * @return {Template}
     */
    static parseUC(val, parentUc) {
        if (objectOpt.parse(val, 'Usercontrol')) {
            return val;
        } else if (objectOpt.parse(val, 'String')) {
            return intenseGenerator.generateUC(val, { parentUc: parentUc });
        } else if (objectOpt.parse(val, 'HTMLElement')) {
            let _path = val.getAttribute("x-from");
            if (_path != undefined) return intenseGenerator.generateUC(_path, { parentUc: parentUc });
        }
    }
}
module.exports = { intenseGenerator }