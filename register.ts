//import { Usercontrol } from 'ucbuilder/Usercontrol';
let _clientPath: string = __dirname.replace(/[\\/]{1,}/g, "/") + '/';

import alc from 'module-alias';
alc.addAlias("ucbuilder", _clientPath);
import "ucbuilder/global/jqProto";
import { jqFeatures } from "ucbuilder/global/jqFeatures";
jqFeatures.init();
import { uniqOpt } from "ucbuilder/build/common";

import { ResourcesUC } from "ucbuilder/ResourcesUC";
jqFeatures.onReady(() => {
    ResourcesUC.init();
    register.Events.extended.ready.fire();
});

import { rootPathHandler } from 'ucbuilder/global/rootPathHandler';
import { CommonEvent } from "ucbuilder/global/commonEvent";
rootPathHandler.originalPath = _clientPath;
rootPathHandler.path = rootPathHandler.originalPath.toLowerCase().trim_('/');

import { RootPathParam, rootPathParam } from 'ucbuilder/enumAndMore';
import {getbasedir} from 'ucbuilder/global/loader';

class register {
    static ucSTAMP: string = uniqOpt.guidAs_;

    static Events = {
        extended: {
            ready: new CommonEvent(),
        },
        ready(callback: () => void) {
            this.extended.ready.on(callback);
        }
    }

    static getprojectname(dirpath: string): string | undefined {
        let fpath: string = `${dirpath}/package.json`;
        //let s = await (async () => {let {X} = await import('./roles/x'); return X;})()
        let pjson = require(fpath);
        if (pjson != undefined) {
            return pjson.name;
        }
        return undefined;
    };

    static registarMe(param2: RootPathParam):boolean {
        //import { newObjectOpt }  from 'ucbuilder/global/newObjectOpt';
        
        let rpp = Object.assign({},rootPathParam)
        let pera = Object.assign(rpp,param2);
        //let pera = newObjectOpt.copyProps(param2, rootPathParam);

        let dirpath = getbasedir(pera.level);
        let pname = this.getprojectname(dirpath);
        if (pname != undefined || pname != "")
            pname = `@${pname}:`;
        let pathAlices = pname;

        if (ACTIVE_USER_CONTROL == undefined) {
            ACTIVE_USER_CONTROL = this;
            return rootPathHandler.addRoot(pathAlices, dirpath, pera);
        } else {
            if (ACTIVE_USER_CONTROL.ucSTAMP === this.ucSTAMP) {
                ACTIVE_USER_CONTROL = this;
                return rootPathHandler.addRoot(pathAlices, dirpath, pera);
            } else {
                return ACTIVE_USER_CONTROL.registarMe(param2);
            }
        }
    }
}
let ACTIVE_USER_CONTROL: typeof register = undefined;
//let ACTIVE_USER_CONTROL:register = undefined;
let res = register.registarMe({
    level: 2,
    addModule: false
});

 export default  {
    getprojectname: register.getprojectname,
    get Events() { return register.Events; },
    registar: (pera?: RootPathParam) => {
        return register.registarMe(pera);
    }
}
