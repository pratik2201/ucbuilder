import { codefileHandler } from "ucbuilder/build/codefileHandler";
import { propOpt } from "ucbuilder/build/common";
import { stylerRegs } from "ucbuilder/global/stylerRegs";
import { TabIndexManager } from "ucbuilder/global/tabIndexManager";
import { LoadGlobal } from "ucbuilder/global/loadGlobal";
import { Usercontrol } from "ucbuilder/Usercontrol";
export class ResourcesUC {
    static tabMng = new TabIndexManager();
    static styler = new stylerRegs();
    static rendrarCounter = 0;
    /** @type {{}}  */
    static resources: {} = {};


    /** @param {HTMLElement} element @returns {Usercontrol} */
    static getBaseObject(element: HTMLElement): Usercontrol {

        return element.data(propOpt.ATTR.BASE_OBJECT);
    }

    static contentHT = document.body;
     /** @type {codefileHandler}  */
    static codefilelist: codefileHandler = new codefileHandler();
    static isInitBefore = false;
    static init() {
        if (!this.isInitBefore) {
            this.contentHT = document.body;
            
            
            ResourcesUC.tabMng.init(this.contentHT);
            stylerRegs.pushPublicStyles();
            LoadGlobal.init();
            this.isInitBefore = true;
        }
    }
}
