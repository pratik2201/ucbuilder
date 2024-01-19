"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildOptions = exports.uniqOpt = exports.objectOpt = exports.controlOpt = exports.propOpt = exports.looping = exports.pathInfo = exports.arrayOpt = exports.strOpt = exports.numOpt = void 0;
const fs_1 = require("fs");
const crypto_1 = __importDefault(require("crypto"));
exports.numOpt = {
    addFloat(actualNum) {
        let floatNumber = '' + actualNum;
        let position = floatNumber.indexOf(".");
        if (position == -1) {
            return +floatNumber + 1;
        }
        else {
            let len = floatNumber.length;
            let a = "0".repeat(len - 2) + '1';
            let dec = len - position - 1;
            let add = [a.slice(0, position), ".", a.slice(position)].join('');
            return +(parseFloat(floatNumber) + parseFloat(add)).toFixed(dec);
        }
    },
    gtv(ifBeingThis, equalToThis, thanHowMuchAboutThis) {
        return this.getThirdValue(ifBeingThis, equalToThis, thanHowMuchAboutThis);
    },
    getThirdValue(ifBeingThis, equalToThis, thanHowMuchAboutThis) {
        return this.SafeDivision((equalToThis * thanHowMuchAboutThis), ifBeingThis);
    },
    gtvc(ifBeingThis, equalToThis, thanHowMuchAboutThis) {
        return this.getThirdValueCheck(ifBeingThis, equalToThis, thanHowMuchAboutThis);
    },
    getThirdValueCheck(ifBeingThis, equalToThis, thanHowMuchAboutThis) {
        if (thanHowMuchAboutThis < ifBeingThis)
            return this.SafeDivision((equalToThis * thanHowMuchAboutThis), ifBeingThis);
        else {
            return (this.SafeDivision(thanHowMuchAboutThis, ifBeingThis) * equalToThis);
        }
    },
    SafeDivision(Numerator, Denominator) {
        return (Denominator == 0) ? 0 : Numerator / Denominator;
    },
};
exports.strOpt = {
    getBool(str, defValue = false) {
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
    cleanTextForRegs(text) {
        return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    },
    replaceAll(source, textToFind, replaceWith) {
        return source.replace(new RegExp("(.){0,1}" + textToFind, 'g'), (match, fkey) => {
            switch (fkey) {
                case "\\": return textToFind;
                case undefined: return replaceWith;
                default: return fkey + "" + replaceWith;
            }
        });
    },
    encode_utf8(s) {
        return unescape(encodeURIComponent(s));
    },
    decode_utf8(s) {
        return decodeURIComponent(escape(s));
    },
    _trim(source, charlist = "\s") {
        return source.replace(new RegExp("^(" + charlist + ")+"), "");
    },
    trim_(source, ...charlist) {
        if (charlist === undefined)
            charlist = ["\s"];
        let src = source;
        Array.from(charlist).forEach((nd) => {
            nd = nd.replace('.', "\.");
            src = src.replace(new RegExp("(" + nd + ")+$"), "");
        });
        return src;
    },
    __trim(source, charlist) {
        if (charlist === undefined)
            charlist = "s";
        return source.replace(new RegExp("^[" + charlist + "]+"), "");
    },
    trim__(source, charlist) {
        if (charlist === undefined)
            charlist = "s";
        return source.replace(new RegExp("[" + charlist + "]+$"), "");
    },
};
exports.arrayOpt = {
    pushRange(currentArr, elementToPush, atPosition) {
        currentArr.splice(atPosition, 0, ...elementToPush);
    },
    removeAt(source, deleteIndex) {
        if (typeof (deleteIndex) == "number")
            source.splice(deleteIndex, 1);
        else {
            deleteIndex.forEach(indTodelete => {
                source.splice(indTodelete, 1);
            });
        }
        return source;
    },
    moveElement(arr, old_index, new_index) {
        if (new_index >= arr.length) {
            var k = new_index - arr.length + 1;
            while (k--) {
                arr.push(undefined);
            }
        }
        arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
        return arr; // for testing
    },
    removeByCallback(arr, callback) {
        let i = 0;
        while (i < arr.length) {
            if (callback(arr[i])) {
                arr.splice(i, 1);
            }
            else {
                ++i;
            }
        }
        return arr;
    },
    Max(array, propName) {
        return Math.max(...array.map(o => o[propName]));
    }
};
exports.pathInfo = {
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
    cleanPath(_pth = "") {
        return exports.strOpt.trim__(_pth.replace(/[\\/]{1,}/g, "/"), "\/ ");
    },
    existFile(_path) {
        return (0, fs_1.existsSync)(_path);
    },
    removeFile(_path) {
        (0, fs_1.unlinkSync)(_path);
    },
    readFile(_path) {
        return (0, fs_1.readFileSync)(_path, "binary");
    },
    writeFile(_path, _data) {
        (0, fs_1.writeFileSync)(_path, _data, { encoding: "binary" });
    },
    getFileNameFromPath(fullPath) {
        return fullPath.replace(/^.*[\\\/]/, '');
    },
    getFileNameWithoutExtFromPath(fullPath) {
        return fullPath.replace(/(^.*[\\\/])(.*)/gm, (mch, dirPath, filename) => {
            let index = filename.indexOf(".");
            if (index != -1)
                filename = filename.substring(0, index);
            return dirPath + filename;
        });
    },
    getFileInfoPartly(fullPath) {
        let rtrn = {};
        let array = Array.from(fullPath.matchAll(/(^.*[\\\/])(.*)/gm))[0];
        if (array != undefined) {
            let dirPath = array[1];
            let filename = array[2];
            let index = filename.indexOf(".");
            rtrn.dirPath = dirPath;
            rtrn.fullPath = fullPath;
            if (index != -1) {
                rtrn.fileName = filename.substring(0, index);
                let flen = filename.length;
                rtrn.extension = filename.substring(index, flen);
                let lindex = filename.lastIndexOf(".");
                rtrn.type = (lindex == index) ? rtrn.extension : filename.substring(lindex, flen);
            }
        }
        return rtrn;
    }
};
exports.looping = {
    removeFromArray(arr, callback = (ele) => { return false; }) {
        let i = 0;
        while (i < arr.length) {
            if (callback(arr[i])) {
                arr.splice(i, 1);
            }
            else {
                ++i;
            }
        }
        return arr;
    },
    kvp(obj, callback) {
        Object.entries(obj).forEach(([key, value]) => {
            callback(key, value);
        });
    },
    iterateArray(ar, callback = (ele) => { return true; }) {
        let escapeLoop = undefined;
        for (let index = 0; index < ar.length && escapeLoop !== true; index++) {
            escapeLoop = callback(ar[index]);
        }
        return escapeLoop === true;
    },
    filterJson(jData, eachCalback) {
        return jData.filter(eachCalback);
    },
    htmlChildren(htEle, eachCalback) {
        for (let index = 0; index < htEle.children.length; index++) {
            eachCalback(htEle.children.item(index), index);
        }
    }
};
exports.propOpt = {
    ATTR: {
        FILE_STAMP: "file-stamp",
        BASE_OBJECT: "base_object",
        ACCESS_KEY: "x-name",
        TEMPLETE_DEFAULT: "primary",
        TEMPLETE_ACCESS_KEY: "x-tname",
        SCOPE_KEY: "x-scope",
        OPTION: "_option",
    },
    hasAttr(attr) {
        return (typeof attr !== 'undefined' && attr !== false);
    },
    getMaxAttr($selector, attrib = 'tab-index') {
        let max = -1;
        $selector.attr(attrib, function (a, b) {
            max = Math.max(max, +b);
        });
        return max;
    }
};
exports.controlOpt = {
    ATTR: {
        editableControls: "input,textarea,select,button,[tabindex='-1'],[contenteditable='true']",
    },
    type: {
        usercontrol: "userontrol",
        form: "form",
    },
    hasFocus($ele) {
        return $ele.is(":focus");
    },
    /* getArray(elem: HTMLElement): NodeListOf<HTMLElement> {
         return elem.querySelectorAll("*");
     },*/
    selectAllText(elem) {
        if (elem.select)
            elem.select();
        else
            selectElementContents(elem);
        function selectElementContents(el) {
            var range = document.createRange();
            range.selectNodeContents(el);
            var sel = window.getSelection();
            sel.removeAllRanges();
            try {
                sel.addRange(range);
            }
            catch (exp) {
                console.log(exp);
            }
        }
    },
    setProcessCSS(styleName, value) {
        document.execCommand('styleWithCSS', true, 'true');
        document.execCommand(styleName, true, value);
    },
    getSeletectedText(elem) {
        if (elem.nodeName === "TEXTAREA" ||
            (elem.nodeName === "INPUT" && elem.getAttribute("type") === "TEXT")) {
            let inpEle = elem;
            return inpEle.value.substring(inpEle.selectionStart, inpEle.selectionEnd);
        }
        return null;
    },
    wrap(srcEle, wrapin) {
        let e = srcEle;
        let ne = undefined;
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
    unwrap(wrapper) {
        let rtrn = Array.from(wrapper.childNodes);
        rtrn.forEach(s => {
            wrapper.before(s);
        });
        wrapper.remove();
        return rtrn;
    },
    getArray: (obj) => {
        if (obj == undefined)
            return [];
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
    xPropToAttr(elementHT) {
        let ar = Array.from(elementHT.attributes).filter(s => s.nodeName.startsWith("x:"));
        return ar.length == 0 ? "" : " " + ar.map(s => s.nodeName + '="' + s.value + '"').join(" ") + " ";
    },
    renameTag(sourceTag, newName) {
        var d = document.createElement(newName);
        d.innerHTML = sourceTag.innerHTML;
        Array.from(sourceTag.attributes).forEach(s => {
            if (s.specified)
                try {
                    d.setAttribute(s.name, s.value);
                }
                catch (e) {
                    console.log(e);
                }
        });
        sourceTag.parentNode.replaceChild(d, sourceTag);
        return d;
    },
    TextNodeToElement(textNode) {
        var spanNode = document.createElement('span');
        spanNode.setAttribute('class', 'red');
        var newTextNode = document.createTextNode(textNode.textContent);
        spanNode.appendChild(newTextNode);
        textNode.parentNode.replaceChild(spanNode, textNode);
    },
    sizing: {
        getFullHeight(elestyle) {
            return (parseFloat(elestyle.height)
                + parseFloat(elestyle.paddingBottom)
                + parseFloat(elestyle.paddingTop)
                + parseFloat(elestyle.borderBottomWidth)
                + parseFloat(elestyle.borderTopWidth));
        },
        getFullWidth(elestyle) {
            return (parseFloat(elestyle.width)
                + parseFloat(elestyle.paddingLeft)
                + parseFloat(elestyle.paddingRight)
                + parseFloat(elestyle.borderLeftWidth)
                + parseFloat(elestyle.borderRightWidth));
        },
    }
};
exports.objectOpt = {
    setChildValueByNameSpace(obj, namespace, valToAssign) {
        namespace.toLowerCase();
        let ars = namespace.split('.');
        try {
            for (let i = 0; i < ars.length - 1; i++) {
                let k = this.getKeyFromObject(obj, ars[i]);
                if (k != undefined)
                    obj = obj[k];
                else
                    return false;
            }
            let lk = this.getKeyFromObject(obj, ars.pop());
            if (lk != undefined) {
                obj[lk] = valToAssign;
                return true;
            }
            return false;
        }
        catch (e) {
            console.error(e);
            return false;
        }
    },
    getKeyFromObject(obj, ar) {
        do {
            for (const key in Object.getOwnPropertyDescriptors(obj)) {
                if (key.toLowerCase() == ar)
                    return key;
            }
            obj = Object.getPrototypeOf(obj);
        } while (obj != null || obj != undefined);
        return undefined;
    },
    parse(obj, isOfthisClass) {
        if (obj == undefined || Object.getPrototypeOf(obj) == null)
            return false;
        while (Object.getPrototypeOf(obj).constructor.name != isOfthisClass) {
            obj = Object.getPrototypeOf(obj);
            if (Object.getPrototypeOf(obj) == null)
                return false;
        }
        return true;
    },
    assign(to, from) {
        Object.keys(to).forEach(ky => {
            to[ky] = from[ky];
        });
    },
    emptyObject(obj) {
        Object.keys(obj).forEach(function (key) { delete obj[key]; });
    },
    clone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },
    deepClone1(obj) {
        return exports.objectOpt.clone(obj);
    },
    getValByNameSpace(obj, str) {
        let ars = str.split('.');
        try {
            ars.forEach(ar => {
                obj = obj[ar];
            });
            return obj;
        }
        catch (_a) {
            return undefined;
        }
    },
    getParentClass(obj) {
        return Object.getPrototypeOf(obj.constructor);
    },
    getClassName(obj) {
        return Object.getPrototypeOf(obj).constructor.name;
    },
    has(key, obj) {
        return key in obj;
    }
};
exports.uniqOpt = {
    get guid() {
        return crypto_1.default.randomBytes(16).toString('hex');
    },
    get guidAs_() {
        return crypto_1.default.randomBytes(16).toString('hex');
    },
    randomNo(min = 0, max = 1000000) {
        let difference = max - min;
        let rand = Math.random();
        rand = Math.floor(rand * difference);
        rand = rand + min;
        return rand;
    },
};
exports.buildOptions = {
    extType: {
        none: "none",
        Usercontrol: ".uc",
        template: ".tpt",
    },
    ignoreDirs: [
        '@ucbuilder:/node_modules',
        '@ucbuilder:/.vscode',
    ],
};
