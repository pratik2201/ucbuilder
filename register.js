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
        let pjson = require(fpath);
        if (pjson != undefined) {
            return pjson.name;
        }
        return undefined;
    };
    /**
    * @param {string} pathAlices 
    * @param {string} dirpath 
    * @param {rootPathParam} pera
    */
    static registarMe(pathAlices, dirpath, pera) {
        let pname = this.getprojectname(dirpath);        
        //console.log(pathAlices + "  ==>  " + pname);
        if (ACTIVE_USER_CONTROL == undefined) {
            let { rootPathHandler } = require('@ucbuilder:/global/rootPathHandler');
            ACTIVE_USER_CONTROL = this;
            return rootPathHandler.addRoot(pathAlices, dirpath, pera);
        } else {
            if (ACTIVE_USER_CONTROL.ucSTAMP === this.ucSTAMP) {
                let { rootPathHandler } = require('@ucbuilder:/global/rootPathHandler');
                return rootPathHandler.addRoot(pathAlices, dirpath, pera);
            } else {

                return ACTIVE_USER_CONTROL.registarMe(pathAlices, dirpath, pera);
            }
        }
    }
}


//var loadTime = window.performance.timing.domContentLoadedEventEnd - window.performance.timing.navigationStart;

let res = register.registarMe("@ucbuilder:", __dirname, {
    addModule: false
});

if (!res) return;

module.exports = { register, Events: register.Events, registarMe: register.registarMe }