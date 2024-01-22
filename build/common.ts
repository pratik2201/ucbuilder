import { readFileSync, writeFileSync, existsSync, unlinkSync } from "fs";
import crypto from "crypto";

export const numOpt = {
    addFloat(actualNum: number): number {
        let floatNumber = '' + actualNum;
        let position = floatNumber.indexOf(".");
        if (position == -1) {
            return +floatNumber + 1;
        } else {
            let len = floatNumber.length;
            let a = "0".repeat(len - 2) + '1';
            let dec = len - position - 1;
            let add = [a.slice(0, position), ".", a.slice(position)].join('');
            return +(parseFloat(floatNumber) + parseFloat(add)).toFixed(dec);
        }
    },
    gtv(ifBeingThis: number, equalToThis: number, thanHowMuchAboutThis: number): number {
        return this.getThirdValue(ifBeingThis, equalToThis, thanHowMuchAboutThis);
    },
    getThirdValue(ifBeingThis: number, equalToThis: number, thanHowMuchAboutThis: number): number {
        return this.SafeDivision((equalToThis * thanHowMuchAboutThis), ifBeingThis);
    },
    gtvc(ifBeingThis: number, equalToThis: number, thanHowMuchAboutThis: number): number {
        return this.getThirdValueCheck(ifBeingThis, equalToThis, thanHowMuchAboutThis);
    },
    getThirdValueCheck(ifBeingThis: number, equalToThis: number, thanHowMuchAboutThis: number): number {
        if (thanHowMuchAboutThis < ifBeingThis)
            return this.SafeDivision((equalToThis * thanHowMuchAboutThis), ifBeingThis);
        else {
            return (this.SafeDivision(thanHowMuchAboutThis, ifBeingThis) * equalToThis);
        }
    },
    SafeDivision(Numerator: number, Denominator: number): number {
        return (Denominator == 0) ? 0 : Numerator / Denominator;
    },
}
export const strOpt = {

    getBool(str: string, defValue: boolean = false): boolean {
        switch (str) {
            case undefined:
            case null: return defValue;
            default:
                switch (str.toLowerCase().trim()) {
                    case "yes":
                    case "1":
                    case "true": return true;
                    case "no":
                    case "0":
                    case "false": return false;
                }
        }
        return defValue;
    },
    cleanTextForRegs(text: string): string {
        return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },
    replaceAll(source: string, textToFind: string, replaceWith: string): string {
        return source.replace(new RegExp("(.){0,1}" + textToFind, 'g'),
            (match, fkey) => {
                switch (fkey) {
                    case "\\": return textToFind;
                    case undefined: return replaceWith;
                    default: return fkey + "" + replaceWith;
                }
            });
    },
    encode_utf8(s: string): string {
        return unescape(encodeURIComponent(s));
    },
    decode_utf8(s: string): string {
        return decodeURIComponent(escape(s));
    },
    _trim(source: string, charlist: string = "\s"): string {
        return source.replace(new RegExp("^(" + charlist + ")+"), "");
    },

    trim_(source: string, ...charlist: string[]): string {
        if (charlist === undefined)
            charlist = ["\s"];

        let src = source;
        Array.from(charlist).forEach((nd) => {
            nd = nd.replace('.', "\.");
            src = src.replace(new RegExp("(" + nd + ")+$"), "");
        });
        return src;
    },
    __trim(source: string, charlist?: string): string {
        if (charlist === undefined) charlist = "s";
        return source.replace(new RegExp("^[" + charlist + "]+"), "");
    },
    trim__(source: string, charlist?: string): string {
        if (charlist === undefined) charlist = "s";
        return source.replace(new RegExp("[" + charlist + "]+$"), "");
    },
}
export const arrayOpt = {
    pushRange<T>(currentArr: T[], elementToPush: T[], atPosition: number): void {
        currentArr.splice(atPosition, 0, ...elementToPush);
    },
    removeAt<T>(source: T[], deleteIndex: number | number[]): T[] {
        if (typeof (deleteIndex) == "number")
            source.splice(deleteIndex, 1);
        else {
            deleteIndex.forEach(indTodelete => {
                source.splice(indTodelete, 1);
            });
        }
        return source;
    },
    moveElement<T>(arr: T[], old_index: number, new_index: number): T[] {
        if (new_index >= arr.length) {
            var k = new_index - arr.length + 1;
            while (k--) {
                arr.push(undefined);
            }
        }
        arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
        return arr; // for testing
    },
    removeByCallback<T>(arr: T[], callback: (ele: T) => boolean): T[] {
        let i = 0;
        while (i < arr.length) {
            if (callback(arr[i])) {
                arr.splice(i, 1);
            } else {
                ++i;
            }
        }
        return arr;
    },
    Max<T>(array: T[], propName: string): number {
        return Math.max(...array.map(o => o[propName]))
    }
}
export const pathInfo = {
    CODEFILE_TYPE: Object.freeze({
        ucHtmlFile: "ucHtmlFile",
        ucTemplateFile: "ucTemplateFile",
        ucDesignerFile: "ucDesignerFile",
        ucCodeFile: "ucCodeFile",
        ucStyleFile: "ucStyleFile",
    }),
    TYPE: Object.freeze({
        directory: 'directory',
        file: "file"
    }),
    cleanPath(_pth: string = ""): string {
        return strOpt.trim__(_pth.replace(/[\\/]{1,}/g, "/"), "\/ ");
    },
    existFile(_path: string): boolean {
        return existsSync(_path);
    },
    removeFile(_path: string): void {
        unlinkSync(_path);
    },
    readFile(_path: string): string {
        return readFileSync(_path, "binary");
    },
    writeFile(_path: string, _data: string): void {
        writeFileSync(_path, _data, { encoding: "binary" });
    },
    getFileNameFromPath(fullPath: string): string {
        return fullPath.replace(/^.*[\\\/]/, '');
    },
    getFileNameWithoutExtFromPath(fullPath: string): string {
        return fullPath.replace(/(^.*[\\\/])(.*)/gm,
            (mch, dirPath, filename) => {
                let index = filename.indexOf(".");
                if (index != -1)
                    filename = filename.substring(0, index);
                return dirPath + filename;
            });
    },
    getFileInfoPartly(fullPath: string): FilePartlyInfo {
        let rtrn = {} as FilePartlyInfo;
        let array = Array.from(fullPath.matchAll(/(^.*[\\\/])(.*)/gmi))[0];
        if (array != undefined) {
            let dirPath = array[1];
            let filename = array[2];
            let index = filename.indexOf(".");
            rtrn.dirPath = dirPath;
            rtrn.fullPath = fullPath;
            if (index != -1) {
                rtrn.fileName = filename.substring(0, index);
                let flen = filename.length;
                rtrn.extension = filename.substring(index, flen) as ExtensionType;
                let lindex = filename.lastIndexOf(".");

                rtrn.type = (lindex == index) ? rtrn.extension : filename.substring(lindex, flen);
            }
        }
        return rtrn;
    }
}
export const looping = {
    removeFromArray<T>(arr: T[], callback: (ele: T) => boolean = (ele) => { return false; }): T[] {
        let i = 0;
        while (i < arr.length) {
            if (callback(arr[i])) {
                arr.splice(i, 1);
            } else {
                ++i;
            }
        }
        return arr;
    },
    kvp(obj: object, callback: (k: string, v: any) => void): void {
        Object.entries(obj).forEach(([key, value]) => {
            callback(key, value);
        });
    },
    iterateArray<T>(ar: T[], callback: (ele: T) => boolean = (ele) => { return true; }): boolean {
        let escapeLoop = undefined;
        for (let index = 0; index < ar.length && escapeLoop !== true; index++) {
            escapeLoop = callback(ar[index]);
        }
        return escapeLoop === true;
    },
    filterJson<T>(jData: T[], eachCalback: (row: T, index: number) => boolean): T[] {
        return jData.filter(eachCalback);
    },
    htmlChildren(htEle: HTMLElement, eachCalback: (row: HTMLElement, index: number) => void): void {
        for (let index = 0; index < htEle.children.length; index++) {
            eachCalback(htEle.children.item(index) as HTMLElement, index);
        }
    }
}
export const propOpt = {
    ATTR: {
        FILE_STAMP: "file-stamp",
        BASE_OBJECT: "base_object",
        ACCESS_KEY: "x-name",
        TEMPLETE_DEFAULT: "primary",
        TEMPLETE_ACCESS_KEY: "x-tname",
        SCOPE_KEY: "x-scope",
        OPTION: "_option",
    },
    hasAttr(attr: any): boolean {
        return (typeof attr !== 'undefined' && attr !== false);
    },
    getMaxAttr($selector: any, attrib: string = 'tab-index'): number {
        let max = -1;
        $selector.attr(attrib, function (a: any, b: any) {
            max = Math.max(max, +b);
        });
        return max;
    }
}
export const controlOpt = {
    ATTR: {
        editableControls: "input,textarea,select,button,[tabindex='-1'],[contenteditable='true']",
    },
    type: {
        usercontrol: "userontrol",
        form: "form",
    },
    hasFocus($ele: any): boolean {
        return $ele.is(":focus");
    },

    /* getArray(elem: HTMLElement): NodeListOf<HTMLElement> {
         return elem.querySelectorAll("*");
     },*/
    selectAllText(elem: HTMLElement): void {
        if ((elem as HTMLInputElement).select) (elem as HTMLInputElement).select();
        else selectElementContents(elem);
        function selectElementContents(el: HTMLElement) {
            var range = document.createRange();
            range.selectNodeContents(el);
            var sel = window.getSelection();
            sel.removeAllRanges();
            try {
                sel.addRange(range);
            } catch (exp) {
                console.log(exp);
            }
        }
    },
    setProcessCSS(styleName: string, value: string): void {
        document.execCommand('styleWithCSS', true, 'true');
        document.execCommand(styleName, true, value);
    },
    getSeletectedText(elem: HTMLElement): string | null {
        if (elem.nodeName === "TEXTAREA" ||
            (elem.nodeName === "INPUT" && elem.getAttribute("type") === "TEXT")) {
            let inpEle = elem as HTMLInputElement;
            return inpEle.value.substring(inpEle.selectionStart,
                inpEle.selectionEnd);
        }
        return null;
    },
    wrap(srcEle: HTMLElement, wrapin: HTMLElement | string): HTMLElement {
        let e = srcEle;
        let ne: HTMLElement | undefined = undefined;
        switch (typeof wrapin) {
            case "string":
                ne = document.createElement(wrapin.toLowerCase());
                break;
            case "object":
                ne = wrapin;
                break;
        }
        e.before(ne);
        ne.appendChild(e);
        return ne;
    },
    unwrap(wrapper: HTMLElement): HTMLElement[] {
        let rtrn = Array.from(wrapper.childNodes) as HTMLElement[];
        rtrn.forEach(s => {
            wrapper.before(s);
        });
        wrapper.remove();
        return rtrn;
    },
    getArray: (obj: any): any[] => {
        if (obj == undefined) return [];
        switch (Object.getPrototypeOf(obj.constructor)) {
            case SVGElement: return [obj];
            case HTMLElement: return [obj];
            case HTMLCollection: return Array.from(obj);
            case Element: return [obj];
            default:
                return Array.from(obj);
                break;
        }
    },

    xPropToAttr(elementHT: HTMLElement): string {
        let ar = Array.from(elementHT.attributes).filter(s => s.nodeName.startsWith("x:"));
        return ar.length == 0 ? "" : " " + ar.map(s => s.nodeName + '="' + s.value + '"').join(" ") + " ";
    },
    renameTag(sourceTag: HTMLElement, newName: string): HTMLElement {
        var d = document.createElement(newName);
        d.innerHTML = sourceTag.innerHTML;
        Array.from(sourceTag.attributes).forEach(s => {
            if (s.specified)
                try {
                    d.setAttribute(s.name, s.value);
                } catch (e) {
                    console.log(e);
                }
        });
        sourceTag.parentNode.replaceChild(d, sourceTag);
        return d;
    },
    TextNodeToElement(textNode: Node): void {
        var spanNode = document.createElement('span');
        spanNode.setAttribute('class', 'red');
        var newTextNode = document.createTextNode(textNode.textContent);
        spanNode.appendChild(newTextNode);
        textNode.parentNode.replaceChild(spanNode, textNode);
    },
    sizing: {
        getFullHeight(elestyle: CSSStyleDeclaration): number {
            return (parseFloat(elestyle.height)
                + parseFloat(elestyle.paddingBottom)
                + parseFloat(elestyle.paddingTop)
                + parseFloat(elestyle.borderBottomWidth)
                + parseFloat(elestyle.borderTopWidth));
        },
        getFullWidth(elestyle: CSSStyleDeclaration): number {
            return (parseFloat(elestyle.width)
                + parseFloat(elestyle.paddingLeft)
                + parseFloat(elestyle.paddingRight)
                + parseFloat(elestyle.borderLeftWidth)
                + parseFloat(elestyle.borderRightWidth));
        },
    }
}
export const objectOpt = {
    setChildValueByNameSpace(obj: object, namespace: string, valToAssign: any): boolean {
        namespace.toLowerCase();
        let ars: string[] = namespace.split('.');
        try {
            for (let i = 0; i < ars.length - 1; i++) {
                let k = this.getKeyFromObject(obj, ars[i]);

                if (k != undefined) obj = obj[k];
                else return false;
            }
            let lk = this.getKeyFromObject(obj, ars.pop());
            if (lk != undefined) {
                obj[lk] = valToAssign;
                return true;
            }
            return false;
        } catch (e) {
            console.error(e);
            return false;
        }
    },
    getKeyFromObject(obj: Object, ar: string): string | undefined {
        do {
            for (const key in Object.getOwnPropertyDescriptors(obj)) {
                if (key.toLowerCase() == ar) return key;
            }
            obj = Object.getPrototypeOf(obj);
        } while (obj != null || obj != undefined);
        return undefined;
    },
    parse(obj: object, isOfthisClass: string): boolean {
        if (obj == undefined || Object.getPrototypeOf(obj) == null) return false;
        while (Object.getPrototypeOf(obj).constructor.name != isOfthisClass) {
            obj = Object.getPrototypeOf(obj);
            if (Object.getPrototypeOf(obj) == null) return false;
        }
        return true;
    },
    assign(to: object, from: object): void {
        Object.keys(to).forEach(ky => {
            to[ky] = from[ky];
        });
    },
    emptyObject(obj: object): void {
        Object.keys(obj).forEach(function (key) { delete obj[key] });
    },
    clone<T>(obj: T): T {
        return JSON.parse(JSON.stringify(obj));
    },
    deepClone1<T>(obj: T): T {
        return objectOpt.clone(obj);
    },
    getValByNameSpace(obj: object, str: string): object {
        let ars = str.split('.');
        try {
            ars.forEach(ar => {
                obj = obj[ar];
            });
            return obj;
        } catch { return undefined; }
    },
    getParentClass(obj: object): object {
        return Object.getPrototypeOf(obj.constructor);
    },
    getClassName(obj: any): string {
        return Object.getPrototypeOf(obj).constructor.name;
    },
    has(key: string, obj: object): boolean {
        return key in obj;
    }
}
export const uniqOpt = {
    get guid(): string {
        return crypto.randomBytes(16).toString('hex');
    },
    get guidAs_(): string {
        return crypto.randomBytes(16).toString('hex');
    },
    randomNo(min: number = 0, max: number = 1000000): number {
        let difference = max - min;
        let rand = Math.random();
        rand = Math.floor(rand * difference);
        rand = rand + min;
        return rand;
    },
}
/*export enum ExtensionType {
    none = "none",
    Usercontrol = ".uc",
    template = ".tpt",
}*/
export type ExtensionType = "none" | ".uc" | ".tpt";
export enum ExtensionEnum {
    none = "none",
    uc = ".uc",
    tpt = ".tpt",
}
export type ScopeType = "private" | "protected" | "package" | "public";
export const buildOptions = {
    extType: {
        none: "none",
        Usercontrol: ".uc",
        template: ".tpt",
    },
    ignoreDirs: [
        'ucbuilder/node_modules',
        'ucbuilder/.vscode',
    ],
}
export interface SourceCodeNode {
    designerCode?: string,
    jsFileCode?: string,
    htmlCode?: string,
}
export interface FilePartlyInfo {
    dirPath: string;
    sortDirPath: string,
    fileName: string;
    extension: ExtensionType;
    type: string;
    fullPath?: string;
}