import { rootPathHandler } from "ucbuilder/global/rootPathHandler";
import { ATTR_OF } from "ucbuilder/global/runtimeOpt";
import { SourceNode } from "ucbuilder/lib/StampGenerator";
import { TabIndexManager } from "ucbuilder/lib/TabIndexManager";
import { StylerRegs } from "ucbuilder/StylerRegs";
import { Usercontrol } from "ucbuilder/Usercontrol";
export class ResourcesUC {
    //static styler = new StylerRegs();
    //static stamp: StampNode;
     
    static rendrarCounter = 0;
    /** @type {{}}  */
    static resources: {} = {};


    /** @param {HTMLElement} element @returns {Usercontrol} */
    static getBaseObject(element: HTMLElement): Usercontrol {
        return element.data(ATTR_OF.BASE_OBJECT);
    }

    //
    //static codefilelist: codefileHandler = new codefileHandler();
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
