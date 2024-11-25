import { codefileHandler } from "ucbuilder/build/codefileHandler";
import { propOpt } from "ucbuilder/build/common";
import { stylerRegs } from "ucbuilder/global/stylerRegs";
import { TabIndexManager } from "ucbuilder/global/tabIndexManager";
import { LoadGlobal } from "ucbuilder/global/loadGlobal";
import { Usercontrol } from "ucbuilder/Usercontrol";
import { rootPathHandler } from "ucbuilder/global/rootPathHandler";
export class ResourcesUC {
    static styler = new stylerRegs();
    static rendrarCounter = 0;
    /** @type {{}}  */
    static resources: {} = {};


    /** @param {HTMLElement} element @returns {Usercontrol} */
    static getBaseObject(element: HTMLElement): Usercontrol {

        return element.data(propOpt.ATTR.BASE_OBJECT);
    }

    //
     /** @type {codefileHandler}  */
    static codefilelist: codefileHandler = new codefileHandler();
    static isInitBefore = false;
    static init(callback:()=>void) {
        if (!this.isInitBefore) {
            rootPathHandler.contentHT = document.body;
            
            
            TabIndexManager.init();
            LoadGlobal.init();
            stylerRegs.pushPublicStyles(callback);
            ///FocusManager.init();
            this.isInitBefore = true;
        }
    }
}
