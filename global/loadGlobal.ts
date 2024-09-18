import { FileInfo } from "ucbuilder/build/codeFileInfo";
import { pathInfo } from "ucbuilder/build/common";
import { newObjectOpt } from "ucbuilder/global/objectOpt";

export interface LoadGlobalRow {
    finfo: FileInfo;
    elementHT?: HTMLStyleElement; // only for style sheets
    stamp: string;
    fUniq: string;
}
interface LoadGlobalParameters{
    url: string;
    stamp: string;
    reloadDesign?: boolean;
    reloadKey?: string;
    cssContents?: string;
};
const loadGlobalParameters: LoadGlobalParameters = {
    url: '',
    stamp: '',
    reloadDesign: false,
    reloadKey: '',
    cssContents: undefined,
}
export class LoadGlobal {
    static resourcesHT: HTMLElement = document.createElement("programres");
    static source: LoadGlobalRow[] = [];
    static params:LoadGlobalParameters;

    constructor() {}

    static init() {
        this.resourcesHT.setAttribute("stamp", 'program.stamp');
        document.body.appendChild(this.resourcesHT);
    }

    static isGoodToPush(url: string): boolean {
        let finfo: FileInfo = new FileInfo();
        finfo.parse(url);
        if (finfo.rootInfo == undefined) return false;
        if (!pathInfo.existFile(finfo.fullPath)) return false;
        let pathtoFind: string = finfo.rootPath/*.toLowerCase()*/;
        let sindex: number = this.source.findIndex(s => s.fUniq.equalIgnoreCase(pathtoFind));
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
    static pushRow(ppr: LoadGlobalParameters) {
        ppr = newObjectOpt.copyProps(ppr, newObjectOpt.clone(loadGlobalParameters));
        let rw: LoadGlobalRow = {
            finfo: new FileInfo(),
            elementHT: undefined,
            stamp: "",
            fUniq: ""
        };
        rw.finfo.parse(ppr.url);
        if (rw.finfo.rootInfo == undefined) return;
        if (!pathInfo.existFile(rw.finfo.fullPath)) return;
        let pathtoFind: string = rw.finfo.rootPath.toLowerCase();
        if (ppr.reloadDesign) pathtoFind += "_" + ppr.reloadKey;
        let sindex: number = this.source.findIndex(s => s.fUniq == pathtoFind);
        if (sindex == -1) {
            rw.stamp = ppr.stamp;
            rw.fUniq = pathtoFind;
            this.source.push(rw);
            this.loadfile(rw, ppr.stamp, ppr.reloadDesign, ppr.cssContents);
        } else {
            if (ppr.reloadDesign)
                this.loadfile(this.source[sindex], ppr.stamp, ppr.reloadDesign, ppr.cssContents);
        }
    }

    static loadfile(rw: LoadGlobalRow, stamp: string, reloadDesign: boolean, cssContents: string) {
        if (reloadDesign)
            if (rw.elementHT != undefined)
                rw.elementHT.delete();
        switch (rw.finfo.partlyInfo.type) {
            case ".css":
            case ".scss":
                rw.elementHT = document.createElement("style");
                rw.elementHT.type = "text/css";
                rw.elementHT.setAttribute("rel", 'stylesheet');
                rw.elementHT.setAttribute("path", rw.finfo.fullPath);
                rw.elementHT.setAttribute("fUniq", rw.fUniq);
                rw.elementHT.setAttribute("stamp", stamp);
                rw.elementHT.innerHTML = cssContents;
                this.resourcesHT.appendChild(rw.elementHT);
                break;
            case ".js":
                require(rw.finfo.fullPath);
                break;
        }
    }
}