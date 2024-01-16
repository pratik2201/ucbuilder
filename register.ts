
import { FC } from 'react';
import { Usercontrol } from './types';

let ACTIVE_USER_CONTROL: Usercontrol | undefined = undefined;
let _clientPath: string = __dirname.replace(/[\\/]{1,}/g, "/") + '/';
import alc from 'module-alias';
alc.addAlias("@ucbuilder:", _clientPath);

import { jqFeatures } from "@ucbuilder:/global/jqFeatures";
jqFeatures.init();
import { uniqOpt } from "@ucbuilder:/build/common";

import { ResourcesUC } from "@ucbuilder:/ResourcesUC";
jqFeatures.onReady(() => {
    ResourcesUC.init(document.body);
    register.Events.extended.ready.fire();
});

import { rootPathHandler } from '@ucbuilder:/global/rootPathHandler';
import { commonEvent } from "@ucbuilder:/global/commonEvent";
rootPathHandler.originalPath = _clientPath;
rootPathHandler.path = rootPathHandler.originalPath.toLowerCase().trim_('/');

import { rootPathParam } from './enumAndMore';

class register {
    static ucSTAMP: string = uniqOpt.guidAs_;

    static Events = {
        extended: {
            ready: new commonEvent(),
        },
        ready(callback: () => void) {
            this.extended.ready.on(callback);
        }
    }

    static getprojectname(dirpath: string): string | undefined {
        let fpath: string = `${dirpath}/package.json`;
        let pjson = require(fpath);
        if (pjson != undefined) {
            return pjson.name;
        }
        return undefined;
    };

    static registarMe(param2: rootPathParam) {
        const { newObjectOpt } = require('@ucbuilder:/global/objectOpt');
        let loader = require('@ucbuilder:/global/loader');

        let pera = newObjectOpt.copyProps(param2, rootPathParam);

        let dirpath = loader.getbasedir(pera.level);
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
                return ACTIVE_USER_CONTROL.registarMe(pathAlices, dirpath, pera);
            }
        }
    }
}

let res = register.registarMe({
    level: 2,
    addModule: false
});

module.exports = {
    getprojectname: register.getprojectname,
    get Events() { return register.Events; },
    registar: (pera: rootPathParam) => {
        register.registarMe(pera);
    }
}
