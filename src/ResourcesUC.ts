import { codefileHandler } from "ucbuilder/build/codefileHandler";
import { rootPathHandler } from "ucbuilder/global/rootPathHandler";
import { SourceNode } from "ucbuilder/lib/StampGenerator";
import { StylerRegs } from "ucbuilder/StylerRegs";
import { TabIndexManager } from "ucbuilder/lib/TabIndexManager";
import { Usercontrol } from "ucbuilder/Usercontrol";
import { ATTR_OF } from "ucbuilder/global/runtimeOpt";
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
