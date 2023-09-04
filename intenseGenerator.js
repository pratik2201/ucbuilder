const { copyProps, clone } = require("@ucbuilder:/global/objectOpt");
const { ucOptions, tptOptions } = require('@ucbuilder:/enumAndMore');
const { ResourcesUC } = require("@ucbuilder:/ResourcesUC");
const { objectOpt } = require("@ucbuilder:/build/common");
/**
 * @typedef {import ('@ucbuilder:/Usercontrol').Usercontrol} Usercontrol
 * @typedef {import ('@ucbuilder:/Template').Template} Template
 */

class intenseGenerator {
    /**
     * @param {string} path  
     * @param {ucOptions} pera 
     * @returns {Usercontrol}
     */
    static generateUC(path, pera, ...args) {
        let param0 = clone(ucOptions);
        copyProps(pera, param0);

        let row = ResourcesUC.codefilelist.getObj(path);
        param0.source.fInfo = row.codefileObj;
        if (param0.wrapperHT == undefined) {
            let tname = row.codefileObj.name;
            param0.wrapperHT = (param0.parentUc == undefined) ? ResourcesUC.contentHT : `<${tname}></${tname}>`.$();
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
        let param0 = clone(tptOptions);
        copyProps(pera, param0);

        let row = ResourcesUC.codefilelist.getObj(path);
        param0.source.fInfo = row.codefileObj;
        if (param0.elementHT == undefined) {
            let tname = row.codefileObj.name;
            param0.elementHT = (param0.parentUc == undefined) ? ResourcesUC.contentHT : `<${tname}></${tname}>`.$();
        }
        args.push(param0);
        /** @type {Template}  */
        let uc = (new (row.obj)(...args));
        return uc;
    }
    /**
     * @param {Template|string} val 
     * @param {Usercontrol} parentUc 
     */
    static parseTPT(val,parentUc){
        if (objectOpt.parse(val, 'Template')) {
            return val;
        } else if (objectOpt.parse(val, 'String')) {
            return intenseGenerator.generateTPT(val, { parentUc: parentUc });
        }
    }
}
module.exports = { intenseGenerator }