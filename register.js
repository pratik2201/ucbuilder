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
     * @param {rootPathParam} param2
    */
    static registarMe(param2) {
        const { newObjectOpt } = require('@ucbuilder:/global/objectOpt');
        let loader = require('@ucbuilder:/global/loader');
        /** @type {rootPathParam}  */
        let pera = newObjectOpt.clone(rootPathParam);
        newObjectOpt.copyProps(param2, pera);

        let dirpath = loader.getbasedir(pera.level);
        let pname = this.getprojectname(dirpath);
        if (pname != undefined || pname != "")
            pname = `@${pname}:`;
        let pathAlices = pname;
        //console.log(' ===>  '+pathAlices);
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

let res = register.registarMe({
    level: 2,
    addModule: false
});
//if (!res) return;
module.exports = {
    getprojectname: register.getprojectname,
    get Events() { return register.Events; },
    /**
    * @param {rootPathParam} pera
    */
    registar: (pera) => {
        register.registarMe(pera);
    }
}