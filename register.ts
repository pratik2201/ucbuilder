//import { Usercontrol } from 'ucbuilder/Usercontrol';
let _clientPath: string = __dirname.replace(/[\\/]{1,}/g, "/") + '/';

import alc from 'module-alias';
alc.addAlias("ucbuilder", _clientPath);
import "ucbuilder/global/jqProto";
import { jqFeatures } from "ucbuilder/global/jqFeatures";
jqFeatures.init();
import { objectOpt, uniqOpt } from "ucbuilder/build/common";

import { ResourcesUC } from "ucbuilder/ResourcesUC";
jqFeatures.onReady(() => {
    ResourcesUC.init();
    register.Events.extended.ready.fire();
});

import { rootPathHandler } from 'ucbuilder/global/rootPathHandler';
import { CommonEvent } from "ucbuilder/global/commonEvent";
rootPathHandler.originalPath = _clientPath;
//console.log(_clientPath);

rootPathHandler.path = rootPathHandler.originalPath/*.toLowerCase()*/.trim_('/');

import { RootPathParam, rootPathParam } from 'ucbuilder/enumAndMore';
import {getbasedir} from 'ucbuilder/global/loader';
import path from 'path';
import { rootDirectoryOf, LocationOf } from './global/findAndReplace';
import { newObjectOpt } from './global/objectOpt';

class register {
    static ucSTAMP: string = uniqOpt.guidAs_;

    static Events = {
        extended: {
            ready: new CommonEvent<()=>void>(),
        },
        ready(callback: () => void) {
            this.extended.ready.on(callback);
        }
    }

    static getprojectname(dirpath: string): string | undefined {
       //console.log(/* process.cwd()+"\n"+*/dirpath);
       
        let fpath: string = `${dirpath}/package.json`;
        //let s = await (async () => {let {X} = await import('./roles/x'); return X;})()
        let pjson = require(fpath);
        if (pjson != undefined) {
            return pjson.name;
        }
        return undefined;
    };

    static registarMe(rootDirOf:LocationOf,param2: RootPathParam):boolean {
        //import { newObjectOpt }  from 'ucbuilder/global/newObjectOpt';
        if (rootDirOf.outDir == '') rootDirOf.outDir = '/';
        rootDirOf.rootDir = rootDirOf.rootDir.replace(/\\+/gi, "/").trim_('/');
        rootDirOf.outDir = rootDirOf.outDir;//.replace(/\\+/gi, "/").trim_('/');
        
        
        rootDirOf = newObjectOpt.copyProps(rootDirOf, rootDirectoryOf);
      //  console.log(rootDirOf.rootDir);
        
       // rootDirectoryOf.srcDir = rootDirectoryOf.srcDir.replace(/\\+/gi, "/");
      
        //lwr.srcDir = rootDirectoryOf.srcDir.toLowerCase();
        
        let rpp = Object.assign({},rootPathParam)
        let pera = Object.assign(rpp,param2);
        //let pera = newObjectOpt.copyProps(param2, rootPathParam);
        
        
        
        let dirpath = getbasedir(pera.level);

        //console.log('=======<<<<   '+dirpath+'  >>>>');
        
        let pname = this.getprojectname(rootDirOf.rootDir); // dirpath
      //  if (pname != undefined || pname != "")
      //      pname = `${pname}`;
        //console.log(pname+" is a project");
        
        let pathAlices = pname;

        if (ACTIVE_USER_CONTROL == undefined) {
            ACTIVE_USER_CONTROL = this;
            return rootPathHandler.addRoot(pathAlices, rootDirOf, pera); // dirpath
        } else {
            if (ACTIVE_USER_CONTROL.ucSTAMP === this.ucSTAMP) {
                ACTIVE_USER_CONTROL = this;
                return rootPathHandler.addRoot(pathAlices, rootDirOf, pera);  // dirpath
            } else {
                return ACTIVE_USER_CONTROL.registarMe(rootDirOf,param2);
            }
        }
    }
}
let ACTIVE_USER_CONTROL: typeof register = undefined;
//let ACTIVE_USER_CONTROL:register = undefined;
let res = register.registarMe({
    //srcDir: __dirname,
    outDir: '',
    rootDir: __dirname,
    /*html: __dirname,
    style: __dirname,
    perameters: __dirname,
    designer:__dirname,
    designerSrc:__dirname,
    code: __dirname,
    codeSrc: __dirname,*/
},{
    level: 2,
    addModule: false
});

 export = {
    getprojectname: register.getprojectname,
    get Events() { return register.Events; },
    registar: (
        rootDirectoryOf:LocationOf,
        pera?: RootPathParam
    ) => {
        return register.registarMe(rootDirectoryOf,pera);
    }
}
