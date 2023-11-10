const { fileInfo } = require("@ucbuilder:/build/codeFileInfo");
const { pathInfo } = require("@ucbuilder:/build/common");

class row {
    finfo = new fileInfo();
    /** @type {HTMLElement} only for style sheets */
    elementHT = undefined;
    stamp = "";
    fUniq = "";
}
class loadGlobal {

    constructor() {

    }
    /** @type {HTMLElement}  */
    static resourcesHT = `<programres></programres>`.$();
    static init() {
        this.resourcesHT.setAttribute("stamp", 'program.stamp');
        document.body.appendChild(this.resourcesHT);
    }

    /**
     * @type {row[]}
     */
    static source = [];
    static params = {
        url: "",
        stamp: "",
        reloadDesign: false,
        reloadKey: "",
        cssContents: undefined
    }
    static isGoodToPush(url){
        let finfo = new fileInfo();
        finfo.parse(url);
        if (finfo.rootInfo == undefined) return false;
        if (!pathInfo.existFile(finfo.fullPath)) return false;
        let pathtoFind = finfo.rootPath.toLowerCase();
        let sindex = this.source.findIndex(s => s.fUniq == pathtoFind);
        return (sindex == -1);
    }
    /**
     * 
     * @param {loadGlobal.params} param0 
     * @returns 
     */
    static pushRow({
        url = "",
        stamp = "",
        reloadDesign = false,
        reloadKey = "",
        cssContents = undefined
    } = {}) {
        let rw = new row();
        rw.finfo = new fileInfo();
        rw.finfo.parse(url);
        if (rw.finfo.rootInfo == undefined) return;
        if (!pathInfo.existFile(rw.finfo.fullPath)) return;
        let pathtoFind = rw.finfo.rootPath.toLowerCase();
        if (reloadDesign) pathtoFind += "_" + reloadKey;
        let sindex = this.source.findIndex(s => s.fUniq == pathtoFind);
        //console.log(sindex);
        if (sindex == -1) {
            rw.stamp = stamp;
            rw.fUniq = pathtoFind;
            this.source.push(rw);


            this.loadfile(rw, stamp, reloadDesign, cssContents);
        } else {
            if (reloadDesign)
                this.loadfile(this.source[sindex], stamp, reloadDesign, cssContents);
        }
    }

    /**
     * 
     * @param {row} rw 
     * @param {string} stamp  
     * @param {boolean} reloadDesign 
     * @param {string} cssContents 
     */
    static loadfile(rw, stamp, reloadDesign, cssContents) {
        if (reloadDesign)
            if (rw.elementHT != undefined)
                rw.elementHT.delete();
        switch (rw.finfo.partlyInfo.type) {
            case ".css":
            case ".scss":

                rw.elementHT = `<style type="text/css" 
                                       rel="stylesheet" 
                                       path="${rw.finfo.path}"
                                       fUniq="${rw.fUniq}" 
                                       stamp="${stamp}" > ${cssContents} </style>`.$();
                this.resourcesHT.appendChild(rw.elementHT);
                break;
            case ".js":
                require(rw.finfo.path);
                break;
        }
    }
}
module.exports = { loadGlobal, row };