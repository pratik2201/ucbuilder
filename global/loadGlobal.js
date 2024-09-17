"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadGlobal = void 0;
const codeFileInfo_1 = require("ucbuilder/build/codeFileInfo");
const common_1 = require("ucbuilder/build/common");
const objectOpt_1 = require("ucbuilder/global/objectOpt");
;
const loadGlobalParameters = {
    url: '',
    stamp: '',
    reloadDesign: false,
    reloadKey: '',
    cssContents: undefined,
};
class LoadGlobal {
    constructor() { }
    static init() {
        this.resourcesHT.setAttribute("stamp", 'program.stamp');
        document.body.appendChild(this.resourcesHT);
    }
    static isGoodToPush(url) {
        let finfo = new codeFileInfo_1.FileInfo();
        finfo.parse(url);
        if (finfo.rootInfo == undefined)
            return false;
        if (!common_1.pathInfo.existFile(finfo.fullPath))
            return false;
        let pathtoFind = finfo.rootPath /*.toLowerCase()*/;
        let sindex = this.source.findIndex(s => s.fUniq.equalIgnoreCase(pathtoFind));
        return (sindex == -1);
    }
    /**
     static pushRow({
            url = "",
            stamp = "",
            reloadDesign = false,
            reloadKey = "",
            cssContents = undefined
        }: LoadGlobal.params = {}) {
            let rw: Row = {
                finfo: new FileInfo(),
                elementHT: undefined,
                stamp: "",
                fUniq: ""
            };
            rw.finfo.parse(url);
    */
    static pushRow(ppr) {
        ppr = objectOpt_1.newObjectOpt.copyProps(ppr, objectOpt_1.newObjectOpt.clone(loadGlobalParameters));
        let rw = {
            finfo: new codeFileInfo_1.FileInfo(),
            elementHT: undefined,
            stamp: "",
            fUniq: ""
        };
        rw.finfo.parse(ppr.url);
        if (rw.finfo.rootInfo == undefined)
            return;
        if (!common_1.pathInfo.existFile(rw.finfo.fullPath))
            return;
        let pathtoFind = rw.finfo.rootPath.toLowerCase();
        if (ppr.reloadDesign)
            pathtoFind += "_" + ppr.reloadKey;
        let sindex = this.source.findIndex(s => s.fUniq == pathtoFind);
        if (sindex == -1) {
            rw.stamp = ppr.stamp;
            rw.fUniq = pathtoFind;
            this.source.push(rw);
            this.loadfile(rw, ppr.stamp, ppr.reloadDesign, ppr.cssContents);
        }
        else {
            if (ppr.reloadDesign)
                this.loadfile(this.source[sindex], ppr.stamp, ppr.reloadDesign, ppr.cssContents);
        }
    }
    static loadfile(rw, stamp, reloadDesign, cssContents) {
        if (reloadDesign)
            if (rw.elementHT != undefined)
                rw.elementHT.delete();
        switch (rw.finfo.partlyInfo.type) {
            case ".css":
            case ".scss":
                rw.elementHT = document.createElement("style");
                rw.elementHT.type = "text/css";
                rw.elementHT.setAttribute("rel", 'stylesheet');
                rw.elementHT.setAttribute("path", rw.finfo.path);
                rw.elementHT.setAttribute("fUniq", rw.fUniq);
                rw.elementHT.setAttribute("stamp", stamp);
                rw.elementHT.innerHTML = cssContents;
                this.resourcesHT.appendChild(rw.elementHT);
                break;
            case ".js":
                require(rw.finfo.path);
                break;
        }
    }
}
exports.LoadGlobal = LoadGlobal;
LoadGlobal.resourcesHT = document.createElement("programres");
LoadGlobal.source = [];
