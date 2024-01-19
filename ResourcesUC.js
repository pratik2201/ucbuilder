"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourcesUC = void 0;

const codeFileInfo_1 = require("ucbuilder/build/codeFileInfo");

const common_1 = require("ucbuilder/build/common");
const stylerRegs_1 = require("ucbuilder/global/stylerRegs");
const tabIndexManager_1 = require("ucbuilder/global/tabIndexManager");
const loadGlobal_1 = require("ucbuilder/global/loadGlobal");
class ResourcesUC {
    /** @param {HTMLElement} element @returns {Usercontrol} */
    static getBaseObject(element) {
        return element.data(common_1.propOpt.ATTR.BASE_OBJECT);
    }
    static init() {
        if (!this.isInitBefore) {
            this.contentHT = document.body;
            ResourcesUC.tabMng.init(this.contentHT);
            stylerRegs_1.stylerRegs.pushPublicStyles();
            loadGlobal_1.LoadGlobal.init();
            this.isInitBefore = true;
        }
    }
}
exports.ResourcesUC = ResourcesUC;
ResourcesUC.tabMng = new tabIndexManager_1.TabIndexManager();
ResourcesUC.styler = new stylerRegs_1.stylerRegs();
ResourcesUC.rendrarCounter = 0;
/** @type {{}}  */
ResourcesUC.resources = {};
ResourcesUC.contentHT = document.body;
/** @type {codefileHandler}  */
ResourcesUC.codefilelist = new codeFileInfo_1.codefileHandler();
ResourcesUC.isInitBefore = false;
