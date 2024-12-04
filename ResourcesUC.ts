import { codefileHandler } from "ucbuilder/build/codefileHandler";
import { propOpt } from "ucbuilder/build/common";
import { StylerRegs } from "ucbuilder/global/stylers/StylerRegs";
import { TabIndexManager } from "ucbuilder/lib/TabIndexManager";
import { LoadGlobal } from "ucbuilder/global/loadGlobal";
import { Usercontrol } from "ucbuilder/Usercontrol";
import { rootPathHandler } from "ucbuilder/global/rootPathHandler";
export class ResourcesUC {
    static styler = new StylerRegs();
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
            StylerRegs.pushPublicStyles(callback);
            ///FocusManager.init();
            this.isInitBefore = true;
        }
    }
}
