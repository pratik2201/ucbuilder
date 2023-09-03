const { readFileSync, writeFileSync, existsSync, unlinkSync, unwatchFile } = require("fs");
//const { v1 } = require("uuid");
const crypto = require("crypto");
const __THIS = {   
    numOpt: {
        gtv(ifBeingThis, equalToThis, thanHowMuchAboutThis) { return this.getThirdValue(ifBeingThis, equalToThis, thanHowMuchAboutThis); },
        getThirdValue(ifBeingThis, equalToThis, thanHowMuchAboutThis) {
            return this.SafeDivision((equalToThis * thanHowMuchAboutThis), ifBeingThis);
        },
        gtvc(ifBeingThis, equalToThis, thanHowMuchAboutThis) { return this.getThirdValueCheck(ifBeingThis, equalToThis, thanHowMuchAboutThis); },
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
    },
    strOpt: {
        /**
         * @param {string} str 
         * @param {boolean} defValue 
         * 
         * @returns {boolean}
         */
        getBool: (str, defValue = false) => {
            switch (str) {
                case undefined:
                case null:
                case NaN: return defValue;
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

        /**
        * @param {string} text 
        * @returns {string}
        */
        cleanTextForRegs(text) {
            return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        },
        /**
        * @param {string} source 
        * @param {string} textToFind 
        * @param {string} replaceWith 
        * @returns {string}
        */
        replaceAll: (source, textToFind, replaceWith) => {
            return source.replace(new RegExp("(.)" + textToFind, 'g'),
                (match, fkey) => {
                    return fkey == "\\" ? textToFind : fkey + "" + replaceWith;
                });
        },
        encode_utf8: (s) => {
            return unescape(encodeURIComponent(s));
        },
        decode_utf8: (s) => {
            return decodeURIComponent(escape(s));
        },
        _trim: (source, charlist) => {
            if (charlist === undefined)
                charlist = "\s";
            return source.replace(new RegExp("^(" + charlist + ")+"), "");
        },
        /**
         * 
         * @param {string} source 
         * @param {string[]} charlist 
         * @returns {string}
         */
        trim_: (source, ...charlist) => {
            if (charlist === undefined)
                charlist = "\s";

            let src = source;
            Array.from(charlist).forEach((nd) => {
                nd = nd.replace('.', "\.");
                src = src.replace(new RegExp("(" + nd + ")+$"), "");
            });
            return src;
        }
    },
    arrayOpt: {
        /**
         * @param {Array} currentArr 
         * @param {Array} elementToPush 
         * @param {number} atPosition 
         */
        pushRange(currentArr, elementToPush, atPosition) {
            currentArr.splice(atPosition, 0, ...elementToPush);
        },
        /**
        * 
        * @param {Array} source 
        * @param {number|Array} indexToDelete
        * @returns 
        */
        removeAt: (source, deleteIndex) => {
            if (typeof (deleteIndex) == "number")
                source.splice(deleteIndex, 1);
            else {
                deleteIndex.forEach(indTodelete => {
                    source.splice(deleteIndex, 1);
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
        /**
        * @param {Array} arr 
        * @param {Function} callback 
        * @returns 
        */
        removeByCallback: (arr, callback = (ele) => { return false; }) => {
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
        /** @param {Array} array */
        Max: (array, propName) => {
            return Math.max(...array.map(o => o[propName]))
        }
    },
    pathInfo: {
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
            /*ucHtmlFile: "ucHtmlFile",
            ucTemplateFile: "ucTemplateFile",
            ucDesignerFile: "ucDesignerFile",
            ucCodeFile: "ucCodeFile",
            ucStyleFile: "ucStyleFile",*/

        }),
        /* unRootPath(_path) {
             return _path.replace(this.cleanPath(rootPathHandler.path) + "/", '')
         },*/
        cleanPath: (_pth = "") => {

            return _pth.replace(/[\\/]{1,}/g, "/").trim_("\/ ");
        },
        existFile: (_path) => {
            return existsSync(_path);
        },
        removeFile: (_path) => {
            unlinkSync(_path);
        },

        readFile: (_path) => {
            return readFileSync(_path, "binary");
        },
        writeFile: (_path, _data) => {
            writeFileSync(_path, _data);
        },
        /**
        * @param {string} fullPath 
        * @returns string
        */
        getFileNameFromPath: (fullPath) => {
            return fullPath.replace(/^.*[\\\/]/, '');
        },

        /**
        * @param {string} fullPath 
        * @returns string
        */
        getFileNameWithoutExtFromPath: (fullPath) => {
            return fullPath.replace(/(^.*[\\\/])(.*)/gm,
                /**
                 * @param {string} mch 
                 * @param {string} dirPath 
                 * @param {string} filename 
                 * @returns 
                 */
                (mch, dirPath, filename) => {
                    let index = filename.indexOf(".");
                    if (index != -1)
                        filename = filename.substring(0, index);
                    return dirPath + filename;
                });
        },
        /**
           * @param {string} fullPath 
           * @returns string
           */
        getFileInfoPartly: (fullPath) => {
            let rtrn = { dirPath: "", fileName: "", extension: "", type: "", fullPath: "" }
            const array = Array.from(fullPath.matchAll(/(^.*[\\\/])(.*)/gm))[0];
            if (array != undefined) {
                /** @type {string}  */
                let dirPath = array[1];
                /** @type {string}  */
                let filename = array[2];
                let index = filename.indexOf(".");
                rtrn.dirPath = dirPath;
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
    },
    looping: {
        /**
        * @param {Array} arr 
        * @param {Function} callback 
        * @returns 
        */
        removeFromArray: (arr, callback = (ele) => { return false; }) => {
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
        kvp(obj, callback = (k, v) => { }) {
            Object.entries(obj).forEach(([key, value]) => {
                callback(key, value);
            });
        },
        /**
        * @param {[]} ar Array To iterate
        * @param {Function} callback func return true will exit the loop
        */
        iterateArray: (ar = [], callback = (ele) => { return true; }) => {
            let escapeLoop = undefined;
            for (let index = 0; index < ar.length && escapeLoop !== true; index++) {
                escapeLoop = callback(ar[index]);
            }
            return escapeLoop === true;
        },
        filterJson: (jData = {}, eachCalback = (row, index) => { return false; }) => {
            return $.grep(jData, eachCalback);
        },

        /**
         * @param {HTMLElement} htEle 
         */
        htmlChildren: (htEle, eachCalback =
            /** 
             * @param {HTMLElement} row 
             * @param {number} index 
             * @returns 
             */
            (row, index) => { return false; }) => {
            for (let index = 0; index < htEle.children.length; index++) {
                if (eachCalback(htEle.children.item(index), index) === true) return;
            }
        }
    },
    propOpt: {
        ATTR: Object.freeze({

            // UC_STAMP: "a" + randNumbers(),
            // PARENT_STAMP: "a" + randNumbers(),
            // UNIQUE_STAMP: "a" + randNumbers(),

            FILE_STAMP: "file-stamp",
            BASE_OBJECT: "base_object",
            ACCESS_KEY: "x-name",
            TEMPLETE_DEFAULT:"primary",
            SCOPE_KEY: "x-scope",
            OPTION: "_option",
            //
        }),
        hasAttr: (attr) => {

            return (typeof attr !== 'undefined' && attr !== false);
        },
        /**
         * @param {JQuery} $selector 
         * @param {string} attrib 
         * @returns 
         */
        getMaxAttr: ($selector, attrib = 'tab-index') => {
            let max = -1;
            $selector.attr(attrib, function (a, b) {
                max = Math.max(max, +b);
            });
            return max;
        }
    },
    controlOpt: {
        ATTR: Object.freeze({
            editableControls: "input,textarea,select,button,[tabindex='-1'],[contenteditable='true']",
        }),
        type: Object.freeze({
            usercontrol: "userontrol",
            form: "form",
        }),
        /** @private */

        /**
         * @param {JQuery} $ele 
         */
        hasFocus($ele) {
            return $ele.is(":focus");
        },

        /** @param {HTMLElement} elem  */
        selectAllText: (elem) => {
            if (elem.select) elem.select();
            else selectElementContents(elem);
            function selectElementContents(el) {
                //console.log(el);
                var range = document.createRange();
                range.selectNodeContents(el);
                var sel = window.getSelection();
                sel.removeAllRanges();
                try{
                        sel.addRange(range);
                }catch(exp){
                    console.log(exp);
                }
            }
        },
        setProcessCSS: (styleName, value) => {
            document.execCommand('styleWithCSS', true, true);
            document.execCommand(styleName, true, value);
        },
        /**
         * @param {HTMLElement|HTMLElement[]} obj 
         * @returns {HTMLElement[]}
         */
        getArray: (obj) => {
            switch (Object.getPrototypeOf(obj.constructor)) {
                case HTMLElement: return [obj];
                case Element: return [obj];
                default:
                    //console.log(obj);
                    //console.log(Object.getPrototypeOf(obj.constructor).name);
                    return Array.from(obj);
                    break;
            }
        },
        /**
         * 
         * @param {HTMLElement} elem  only allow jquery element of `input[type=text]`/`textarea` 
         * @returns {string}
         */
        getSeletectedText: (elem) => {
            if (elem.nodeName === "TEXTAREA" ||
                (elem.nodeName === "INPUT" && elem.type === "TEXT")) {
                return elem.value.substring(elem.selectionStart,
                    elem.selectionEnd);
                // or return the return value of Tim Down's selection code here
            }
            return null;
        },
        /**
         * @param {string|HTMLElement} tagName 
         * @returns {boolean}
         */
        hasClosingTag: (tagName) => {
            try {
                //console.log(typeof tagName);
                switch (typeof tagName) {
                    case "string":
                        tagName = tagName.toLowerCase();
                        /** @type {HTMLElement}  */
                        var element = document.createElement(tagName);
                        return '<' + tagName + '>' !== element.outerHTML;
                    case "object":
                        tagName = tagName.nodeName.toLowerCase();
                        /** @type {HTMLElement}  */
                        var element = document.createElement(tagName);
                        return '<' + tagName + '>' !== element.outerHTML;
                }
            } catch (ex) {
                return false;
            }
        },
        /**
         * @param {HTMLElement} srcEle 
         * @param {HTMLElement|string} wrapin 
         * @returns {HTMLElement} wrapped element
         */
        wrap(srcEle, wrapin) {
            /** @type {HTMLElement}  */
            let e = srcEle;
            /** @type {HTMLElement}  */
            let ne = undefined;
            switch (typeof wrapin) {
                case "string":
                    /** @type {HTMLElement}  */
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
        /** 
         * @param {HTMLElement} wrapper
         * @returns {HTMLElement[]} array of unwrapped elements
         */
        unwrap(wrapper) {
            /** @type {HTMLElement[]}  */
            let rtrn = [];
            rtrn = Array.from(wrapper.childNodes);
            rtrn.forEach(s => {
                wrapper.before(s);
            });
            wrapper.remove();
            return rtrn;
        },
        /** @param {HTMLElement} elementHT @returns {string} */
        xPropToAttr: (elementHT) => {
            let ar = Array.from(elementHT.attributes).filter(s => s.nodeName.startsWith("x:"));
            return ar.length == 0 ? "" : " " + ar.map(s => s.nodeName + '="' + s.value + '"').join(" ") + " ";
        },
        /**
         * @param {HTMLElement} sourceTag 
         * @param {string} newName 
         * @returns {HTMLElement}
         */
        renameTag: (sourceTag, newName) => {
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
        /**
         * @param {Node} textNode 
         */
        TextNodeToElement: (textNode) => {
            var spanNode = document.createElement('span');
            spanNode.setAttribute('class', 'red');
            var newTextNode = document.createTextNode(textNode.textContent);
            spanNode.appendChild(newTextNode);
            textNode.parentNode.replaceChild(spanNode, textNode);
        },

        sizing: {
            /** @param {CSSStyleDeclaration} elestyle */
            getFullHeight: (elestyle) => {
                return (parseFloat(elestyle.height)
                    + parseFloat(elestyle.paddingBottom)
                    + parseFloat(elestyle.paddingTop)
                    + parseFloat(elestyle.borderBottomWidth)
                    + parseFloat(elestyle.borderTopWidth));
            },
            /** @param {CSSStyleDeclaration} elestyle */
            getFullWidth: (elestyle) => {
                return (parseFloat(elestyle.width)
                    + parseFloat(elestyle.paddingLeft)
                    + parseFloat(elestyle.paddingRight)
                    + parseFloat(elestyle.borderLeftWidth)
                    + parseFloat(elestyle.borderRightWidth));
            },
        }
    },
    objectOpt: {
        /**
         * @param {Object} obj 
         * @param {string} isOfthisClass class name to compare
         */
        parse: (obj, isOfthisClass) => {
            if (obj == undefined || obj.__proto__ == null) return false;
            while (obj.__proto__.constructor.name != isOfthisClass) {
                obj = obj.__proto__;
                if (obj.__proto__ == null) return false;
            }
            return true;
        },
        assign(to, from) {
            Object.keys(to).forEach(ky => {
                to[ky] = from[ky];
            });
        },
        /**
        * @param {{}} obj 
        */
        emptyObject: (obj) => {
            Object.keys(obj).forEach(function (key) { delete obj[key] });
        },
        /**
        * @template T 
        * 
        * @param {T} obj 
        * @returns {T}
        */
        clone: (obj) => {
            //console.log('here');
            return JSON.parse(JSON.stringify(obj));
        },
        /**
        * @param {{}} obj 
        */
        deepClone1: (obj) => {
            return __THIS.objectOpt.clone(obj);
        },
        /**
        * @param {{}} obj 
        
        deepClone: (obj) => {
            return cloneDeep(obj);
        },*/
        /**
        * @param {{}} obj 
        * @param {string} str property name i.e. person.address.home;
        */
        getValByNameSpace: (obj, str) => {
            let ars = str.split('.');
            try {
                ars.forEach(ar => {
                    obj = obj[ar];
                });
                return obj;
            } catch { return undefined; }
        },
        /**
        * @param {{}} obj 
        * @param {string} namespace property name i.e. person.address.home;
        * @param {string} valToAssign value to assign last property
        */
        setChildValueByNameSpace(obj, namespace, valToAssign) {
            namespace.toLowerCase();
            //console.log("==>"+namespace);
            let ars = namespace.split('.');

            try {
                for (let i = 0; i < ars.length - 1; i++) {
                    let k = this.getKeyFromObject(obj, ars[i]);

                    if (k != undefined) obj = obj[k];
                    else return false;
                }
                let lk = this.getKeyFromObject(obj, ars.pop());
                //console.log(lk);
                if (lk != undefined) {
                    obj[lk] = valToAssign;
                    return true;
                } return false;
            } catch { return false; }
        },
        /**
         * @param {Object} obj 
         * @param {string} ar lowercase string to find
         */
        getKeyFromObject: (obj, ar) => {
            //console.log(Object.pr;
            /*for (const key in obj) {
    
                if (Object.hasOwnProperty.call(obj, key))
                    if (key.toLowerCase() == ar) return key;
            }*/
            do {
                for (const key in Object.getOwnPropertyDescriptors(obj)) {
                    if (key.toLowerCase() == ar) return key;
                }
                obj = obj.__proto__;
            } while (obj != null || obj != undefined);
            /* obj = obj.__proto__;
             for (const key in Object.getOwnPropertyDescriptors(obj.__proto__)) {
     
                 if (key.toLowerCase() == ar) return key;
             } obj = obj.__proto__;
             console.log(obj.__proto__.__proto__.__proto__.__proto__);
             for (const key in Object.getOwnPropertyDescriptors(obj.__proto__)) {
     
                 if (key.toLowerCase() == ar) return key;
             }*/
            return undefined;
        },
        getParentClass: (obj) => {
            return Object.getPrototypeOf(obj.constructor);
        },
        /**
         * @param {any} obj class reference
         * @returns {string}
         */
        getClassName: (obj) => { return Object.getPrototypeOf(obj).constructor.name; },
        has: (key, obj) => {
            return key in obj;
        }
    },
    
    uniqOpt: {
        get guid() {
            return crypto.randomBytes(16).toString('hex');
            //let v = v1();
            //return v;
        },
        get guidAs_() {
            return crypto.randomBytes(16).toString('hex');
            //let v = v1().replace(/-/g, "_");
            //return v;
        },
        randomNo(min = 0, max = 1000000) {
            let difference = max - min;
            let rand = Math.random();
            rand = Math.floor(rand * difference);
            rand = rand + min;
            return rand;
        },
    },
    buildOptions: {
        controlType: Object.freeze({
            elementHT: 'elementHT',
            Usercontrol: 'Usercontrol'
        }),
        extType: Object.freeze({
            none: "none",
            Usercontrol: ".uc",
            template: ".tpt",
        }),
        ignoreDirs: [
            '@ucbuilder:/node_modules',
            '@ucbuilder:/.vscode',
        ],
    },
   
};
module.exports = __THIS;