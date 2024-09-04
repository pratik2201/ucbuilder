"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
//import { Usercontrol } from 'ucbuilder/Usercontrol';
let _clientPath = __dirname.replace(/[\\/]{1,}/g, "/") + '/';
const module_alias_1 = __importDefault(require("module-alias"));
module_alias_1.default.addAlias("ucbuilder", _clientPath);
require("ucbuilder/global/jqProto");
const jqFeatures_1 = require("ucbuilder/global/jqFeatures");
jqFeatures_1.jqFeatures.init();
const common_1 = require("ucbuilder/build/common");
const ResourcesUC_1 = require("ucbuilder/ResourcesUC");
jqFeatures_1.jqFeatures.onReady(() => {
    ResourcesUC_1.ResourcesUC.init();
    register.Events.extended.ready.fire();
});
const rootPathHandler_1 = require("ucbuilder/global/rootPathHandler");
const commonEvent_1 = require("ucbuilder/global/commonEvent");
rootPathHandler_1.rootPathHandler.originalPath = _clientPath;
rootPathHandler_1.rootPathHandler.path = rootPathHandler_1.rootPathHandler.originalPath.toLowerCase().trim_('/');
const enumAndMore_1 = require("ucbuilder/enumAndMore");
const loader_1 = require("ucbuilder/global/loader");
class register {
    static getprojectname(dirpath) {
        console.log(/* process.cwd()+"\n"+*/ dirpath);
        let fpath = `${dirpath}/package.json`;
        //let s = await (async () => {let {X} = await import('./roles/x'); return X;})()
        let pjson = require(fpath);
        if (pjson != undefined) {
            return pjson.name;
        }
        return undefined;
    }
    ;
    static registarMe(rootDirectoryOf, param2) {
        //import { newObjectOpt }  from 'ucbuilder/global/newObjectOpt';
        let rpp = Object.assign({}, enumAndMore_1.rootPathParam);
        let pera = Object.assign(rpp, param2);
        //let pera = newObjectOpt.copyProps(param2, rootPathParam);
        let dirpath = (0, loader_1.getbasedir)(pera.level);
        //console.log('=======<<<<   '+dirpath+'  >>>>');
        let pname = this.getprojectname(dirpath);
        if (pname != undefined || pname != "")
            pname = `${pname}`;
        let pathAlices = pname;
        if (ACTIVE_USER_CONTROL == undefined) {
            ACTIVE_USER_CONTROL = this;
            return rootPathHandler_1.rootPathHandler.addRoot(pathAlices, dirpath, pera);
        }
        else {
            if (ACTIVE_USER_CONTROL.ucSTAMP === this.ucSTAMP) {
                ACTIVE_USER_CONTROL = this;
                return rootPathHandler_1.rootPathHandler.addRoot(pathAlices, dirpath, pera);
            }
            else {
                return ACTIVE_USER_CONTROL.registarMe(rootDirectoryOf, param2);
            }
        }
    }
}
register.ucSTAMP = common_1.uniqOpt.guidAs_;
register.Events = {
    extended: {
        ready: new commonEvent_1.CommonEvent(),
    },
    ready(callback) {
        this.extended.ready.on(callback);
    }
};
let ACTIVE_USER_CONTROL = undefined;
//let ACTIVE_USER_CONTROL:register = undefined;
let res = register.registarMe({
    srcDir: __dirname,
    outDir: __dirname,
    /*html: __dirname,
    style: __dirname,
    perameters: __dirname,
    designer:__dirname,
    designerSrc:__dirname,
    code: __dirname,
    codeSrc: __dirname,*/
}, {
    level: 2,
    addModule: false
});
module.exports = {
    getprojectname: register.getprojectname,
    get Events() { return register.Events; },
    registar: (rootDirectoryOf, pera) => {
        return register.registarMe(rootDirectoryOf, pera);
    }
};
