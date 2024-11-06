
/**
 * REGISTER `ucbuilder` MODULE SO THAT CAN ACCESS LIBRARY USING `ucbuilder` KEYWORD
 */
//let _clientPath: string = __dirname.replace(/[\\/]{1,}/g, "/") + '/';

import alc from "module-alias";
alc.addAlias("ucbuilder", __dirname);

import path from "path";
/**
 * INITIALIZE SOME EXTENSION METHOD TO USE.
 */
import { jqFeatures } from "ucbuilder/global/jqFeatures";
import { ResourcesUC } from "ucbuilder/ResourcesUC";
import { uniqOpt } from "ucbuilder/build/common";
import { rootPathHandler } from "ucbuilder/global/rootPathHandler";
import { CommonEvent } from "ucbuilder/global/commonEvent";
import { RootPathParam, rootPathParam } from "ucbuilder/enumAndMore";
import { rootDirectoryOf, LocationOf } from "ucbuilder/global/findAndReplace";
import { newObjectOpt } from "ucbuilder/global/objectOpt";
import { Usercontrol } from "ucbuilder/Usercontrol";
import { winManager } from "ucbuilder/global/winManager";

jqFeatures.init();


jqFeatures.onReady(() => {
    ResourcesUC.init(() => {
        register.Events.extended.ready.fire();
    });
});

//rootPathHandler.originalPath = _clientPath;
//console.log(rootPathHandler.originalPath);

//rootPathHandler.path = rootPathHandler.originalPath.trim_('/');

class register {
    static ucSTAMP: string = uniqOpt.guidAs_;

    static Events = {
        extended: {
            ready: new CommonEvent<() => void>(),
        },
        ready(callback: () => void) {
            this.extended.ready.on(callback);
        }
    }

    

    static registarMe(rootDirOf: LocationOf, param2: RootPathParam): boolean {
        // console.log(rootDirOf);
        
       // console.log(path.join(__dirname, '../..'), process.cwd());
      // console.log(" >>> "+process.cwd());
        rootDirOf = newObjectOpt.copyProps(rootDirOf, rootDirectoryOf);   
        if (rootDirOf.outDir == '') rootDirOf.outDir = '/'; 
        if (rootDirOf.designerDir == '') rootDirOf.designerDir = '/';
        rootDirOf.rootDir = rootDirOf.rootDir.toFilePath();      
        let pera = newObjectOpt.copyProps(param2, rootPathParam);
        let pname = newObjectOpt.getProjectname(rootDirOf.rootDir); // dirpath
        let pathAlices = pname;
        if (ACTIVE_USER_CONTROL == undefined) {
            ACTIVE_USER_CONTROL = this;
            return rootPathHandler.addRoot(pathAlices, rootDirOf, pera); // dirpath
        } else {
            if (ACTIVE_USER_CONTROL.ucSTAMP === this.ucSTAMP) {
                ACTIVE_USER_CONTROL = this;
                return rootPathHandler.addRoot(pathAlices, rootDirOf, pera);  // dirpath
            } else {
                return ACTIVE_USER_CONTROL.registarMe(rootDirOf, param2);
            }
        }
    }
}
register.Events.ready(() => {
    Usercontrol.HiddenSpace.setAttribute('style', `position:  fixed;top: -2000000000px;left: -2000000000px; pointer-events: none;visibility: hidden; display: block; width: auto; height: auto;`);
    Usercontrol.HiddenSpace.setAttribute('disabled','true');
    winManager.transperency.setAttribute('style', `position: absolute; background-color: #6f6f6f9d; left: 0px;  top: 0px; right: 0px; bottom: 0px; filter: blur(100%);`);
    document.body.prepend(Usercontrol.HiddenSpace);
})
let ACTIVE_USER_CONTROL: typeof register = undefined;
//let ACTIVE_USER_CONTROL:register = undefined;
let res = register.registarMe({
    outDir: "/out/",
    designerDir:"/",
    rootDir: path.dirname(__dirname),    
}, {
    addModule: false
});

export = {
    get Events() { return register.Events; },
    registar: (
        rootDirectoryOf: LocationOf,
        pera?: RootPathParam
    ) => {
        return register.registarMe(rootDirectoryOf, pera);
    }
}