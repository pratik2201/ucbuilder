/** @type {Usercontrol}  */
var ACTIVE_USER_CONTROL = undefined;
let _clientPath = __dirname.replace(/[\\/]{1,}/g, "/") + '/';
let alc = require('module-alias');
alc.addAlias("@ucbuilder:", _clientPath);

const { jqFeatures } = require("@ucbuilder:/global/jqFeatures");
jqFeatures.init();
const { uniqOpt } = require("@ucbuilder:/build/common");

const { ResourcesUC } = require("@ucbuilder:/ResourcesUC");
jqFeatures.onReady(() => {
    ResourcesUC.init(document.body);
    register.Events.extended.ready.fire();
});

const { rootPathHandler } = require('@ucbuilder:/global/rootPathHandler');
const { commonEvent } = require("@ucbuilder:/global/commonEvent");
rootPathHandler.originalPath = _clientPath;
rootPathHandler.path = rootPathHandler.originalPath.toLowerCase().trim_('/');

const { rootPathParam } = require('./enumAndMore');




class register {
    static ucSTAMP = uniqOpt.guidAs_;

    static Events = {
        extended: {
            ready: new commonEvent(),
        },
        ready(callback = () => { }) {
            this.extended.ready.on(callback);
        }
    }


    static getprojectname(dirpath) {
        let fpath = `${dirpath}/package.json`;
        // console.log(fpath);
        let pjson = require(fpath);
        if (pjson != undefined) {
            return pjson.name;
        }
        return undefined;
    };
    /**     
     * @param {number} level
     * @param {rootPathParam} pera
    */
    static registarMe(level = 3, pera) {
        let loader = require('@ucbuilder:/appBuilder/Window/codeFile/loader');
        let dirpath = loader.getbasedir(level);     
        let pname = this.getprojectname(dirpath);
        if (pname != undefined || pname != "")
            pname = `@${pname}:`;
        let pathAlices = pname;       
        if (ACTIVE_USER_CONTROL == undefined) {
            //let { rootPathHandler } = require('@ucbuilder:/global/rootPathHandler');
            ACTIVE_USER_CONTROL = this;
            return rootPathHandler.addRoot(pathAlices, dirpath, pera);
        } else {
            if (ACTIVE_USER_CONTROL.ucSTAMP === this.ucSTAMP) {
                //let { rootPathHandler } = require('@ucbuilder:/global/rootPathHandler');
                ACTIVE_USER_CONTROL = this;
                return rootPathHandler.addRoot(pathAlices, dirpath, pera);
            } else {

                return ACTIVE_USER_CONTROL.registarMe(pathAlices, dirpath, pera);
            }
        }
       
    }
}


//var loadTime = window.performance.timing.domContentLoadedEventEnd - window.performance.timing.navigationStart;

let res = register.registarMe(2,{
    addModule: false
});
//if (!res) return;
module.exports = {
    register,
    
}