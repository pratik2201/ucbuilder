import { codefileHandler } from "ucbuilder/build/codefileHandler";
import { propOpt } from "ucbuilder/build/common";
import { rootPathHandler } from "ucbuilder/global/rootPathHandler";
import { SourceNode } from "ucbuilder/lib/StampGenerator";
import { StylerRegs } from "ucbuilder/lib/stylers/StylerRegs";
import { TabIndexManager } from "ucbuilder/lib/TabIndexManager";
import { Usercontrol } from "ucbuilder/Usercontrol";
export class ResourcesUC {
    //static styler = new StylerRegs();
    //static stamp: StampNode;
     
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
            //LoadGlobal.init();
            SourceNode.init();
            StylerRegs.pushPublicStyles(callback);
            ///FocusManager.init();
            this.isInitBefore = true;
        }
    }
}
