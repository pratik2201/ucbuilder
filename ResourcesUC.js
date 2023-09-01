const { codefileHandler } = require("@ucbuilder:/build/codeFileInfo");
const { propOpt } = require("@ucbuilder:/build/common");
const { stylerRegs } = require("@ucbuilder:/appBuilder/Window/codeFile/stylerRegs");
const { loadGlobal } = require("@ucbuilder:/global/loadGlobal");
const { tabIndexManager } = require("@ucbuilder:/global/tabIndexManager");

class ResourcesUC {
    static tabMng = new tabIndexManager();
    static styler = new stylerRegs();
    static rendrarCounter = 0;
    /** @type {{}}  */
    static resources = {};


    /** @param {HTMLElement} element @returns {Usercontrol} */
    static getBaseObject(element) {

        return element.data(propOpt.ATTR.BASE_OBJECT);
    }

    static contentHT = document.body;
     /** @type {codefileHandler}  */
    static codefilelist = new codefileHandler();
    static isInitBefore = false;
    static init() {
        if (!this.isInitBefore) {
            this.contentHT = document.body;
            ResourcesUC.tabMng.init(this.contentHT);
            stylerRegs.pushPublicStyles();
            loadGlobal.init();
            this.isInitBefore = true;
        }
    }
}
module.exports = {
    ResourcesUC
}