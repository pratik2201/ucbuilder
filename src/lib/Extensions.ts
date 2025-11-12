import { ATTR_OF } from "../global/runtimeOpt.js";
import { ProjectManage } from "../ipc/ProjectManage.js";
import { IResolvePathResult } from "ucbuilder/ipc/enumAndMore.js";
import { Usercontrol } from "../Usercontrol.js";
import { dataManager } from "./dataManager.js";
import { ucUtil } from "../global/ucUtil.js";

 
export class Extensions {
    static data: dataManager = new dataManager();
    static isInited: boolean = false;
    static init() {
        if (Extensions.isInited) return;
        //const commonPrototype = Object.assign({}, HTMLElement.prototype, Element.prototype, EventTarget.prototype);
        this.doCommonDomProto(HTMLElement.prototype);
        this.doCommonDomProto(Element.prototype);
        this.doCommonDomProto(EventTarget.prototype);

        /*const _capitalizeHandle = function () {
            let child = this as HTMLTextAreaElement;
            child.addEventListener('beforeinput', (e) => { 'keyup'
                var text-box = event.target as HTMLInputElement;
                var start = text-box.selectionStart;
                var end = text-box.selectionEnd;
                text-box.value = UcExtra.getAdvanceTextBeforeInput(e).toCamelCase();//text-box.value.toCamelCase();
                text-box.setSelectionRange(start+1, end+1);
                e.preventDefault();
            });
        }
        HTMLInputElement.prototype.capitalizeHandle = _capitalizeHandle;
        HTMLTextAreaElement.prototype.capitalizeHandle = _capitalizeHandle;*/

        const _getSelectedValuee = function (this: HTMLInputElement): string {
            let child = this as HTMLInputElement;

            if (child.tagName === "TEXTAREA" ||
                (child.tagName === "INPUT" && child.type === "text")) {
                return child.value.substring(child.selectionStart, child.selectionEnd);
                // or return the return value of Tim Down's selection code here
            } else return child.innerText.substring(child.selectionStart, child.selectionEnd);
        };
        HTMLInputElement.prototype["#getSelectedValue"] =
            HTMLTextAreaElement.prototype["#getSelectedValue"] = _getSelectedValuee;



        NodeList.prototype["#on"] = function <K extends keyof HTMLElementEventMap>(eventList: K, handlerCallback: (this: HTMLDivElement, ev: HTMLElementEventMap[K]) => any): void {
            Array.from(this)["#on"](eventList, handlerCallback);
        }

        Array.prototype["#on"] = function <K extends keyof HTMLElementEventMap>(eventList: K, handlerCallback: (this: HTMLDivElement, ev: HTMLElementEventMap[K]) => any): void {
            let splEvt: string[] = eventList.split(" ");
            this.forEach((tar: HTMLElement) => {
                splEvt.forEach(function (e) {
                    Extensions.data.onHandler(tar, e as any, handlerCallback);
                });
            });
        }
        Array.prototype["#distinct"] = function <T>(): Array<T> {
            return [...new Set(this)] as unknown as Array<T>;
        }

        Array.prototype["#RemoveMultiple"] = function <T>(...eleList: T[]): Array<T> {
            var valuesArr = this as T[];
            const indices = [];
            let findex = -1;
            for (let i = 0; i < eleList.length; i++) {
                findex = valuesArr.indexOf(eleList[i]);
                if (findex != -1) indices.push(findex);
            }
            valuesArr["#RemoveByFilter"](row => eleList.indexOf(row) == -1);
            //  console.log(eleList);

            return [];
            //return valuesArr.RemoveAtMultiple(...indices);
        }
        Array.prototype["#RemoveByFilter"] = function (callback) {
            let i, j;

            for (i = 0, j = 0; i < this.length; ++i) {
                if (callback(this[i])) {
                    this[j] = this[i];
                    ++j;
                }
            }

            while (j < this.length) {
                this.pop();
            }
        }

        Array.prototype["#RemoveAtMultiple"] = function <T>(this: Array<T>, ...removeValFromIndex: number[]): Array<T> {
            var valuesArr = this as T[];

            removeValFromIndex.sort(function (a, b) { return b - a; });
            let removedEle: T[] = [];
            for (var i = removeValFromIndex.length - 1; i >= 0; i--)
                return valuesArr.splice(removeValFromIndex[i], 1);
        }

        Array.prototype["#fillInto"] = function <T>(this: Array<T>, to: Array<T>, clearTarget = false) {
            let from = this as [];
            if (clearTarget) to.length = 0;
            for (let i = 0, len = from.length; i < len; i++)
                to.push(from[i]);

        }
        Array.prototype["#fillIntoMultiple"] = function <T>(this: Array<T>, to: Array<T[]>, clearTarget = false) {
            let from = this as [];
            if (clearTarget) {
                for (let i = 0, iObj = to, ilen = iObj.length; i < ilen; i++) {
                    iObj[i].length = 0;
                }
            }
            for (let i = 0, iObj = from, ilen = iObj.length; i < ilen; i++) {
                const iItem = iObj[i];
                for (let j = 0, jObj = to, jlen = jObj.length; j < jlen; j++) {
                    jObj[j].push(iItem);
                }
            }

        }
        SVGElement.prototype["#data"] = function (key?: string, value?: any): any {
            switch (arguments.length) {
                case 0:
                    return Extensions.data.getData(this as unknown as HTMLElement);
                    break;
                case 1:
                    switch (typeof key) {
                        case "string": return Extensions.data.getData(this as unknown as HTMLElement, key);
                        case "object": Extensions.data.getData(this as unknown as HTMLElement, key);
                    }
                    break;
                case 2:
                    Extensions.data.setData(this as unknown as HTMLElement, key, value);
                    break;
            }
        }

        Number.prototype["#toAlphabate"] = function (this: number): string {
            var arr = [];
            let count = this;
            while (count >> 0 > 0) {
                arr.unshift(String.fromCharCode(65 + --count % 26));
                count /= 26
            }
            return arr.join("")
        }
        String.prototype["#escapeRegs"] = function () {
            return this.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }
        String.prototype["#replaceAllWithResult"] = function (find, replace) {
            let hasReplaced = false;
            let content = this.replace(new RegExp(find["#escapeRegs"](), 'gi'), () => {
                hasReplaced = true;
                return replace;
            });
            return {
                result: content,
                hasReplaced: hasReplaced
            }
        }
        String.prototype["#$"] = function (): HTMLElement & HTMLElement[] {
            var div = document.createElement('pre');
            div.innerHTML = this.trim();
            if (div.children.length == 1) {
                Extensions.data.initElement(div.firstChild as any);
                return div.firstChild as any;
            } else {
                let ar = Array.from(div.children);
                Extensions.data.initElement(ar as any);
                return ar as any;
            }
        }
        String.prototype["#PHP_REMOVE"] = function () {
            return (this as string).replace(/<\?(=|php| )(.*?)\?>/gm, '<!--?$1$2?-->');
        }
        String.prototype["#PHP_ADD"] = function () {
            return (this as string).replace(/<!--\?(=|php )(.*?)\?-->/gm, '<?$1$2?>');
        }
        String.prototype["#parseUc"] = function <T = Usercontrol>(this: string, val: T): string {
            var div = document.createElement('pre');
            div.innerHTML = this;
            if (val) {
                (val as Usercontrol).ucExtends.passElement(div);
                return div.innerHTML;
            } return this;
        }
        String.prototype["#toCamelCase"] = function () {
            let str = this;
            return str
                .replace(/\s(.)/g, function (a) {
                    return a.toUpperCase();
                })
                // .replace(/\s/g, '')
                .replace(/^(.)/, function (b) {
                    return b.toUpperCase();
                });

        }

        /*String.prototype.templateBind = function (row) {
            return ''; //generateTemplateString(this)(row);
        }*/
        String.prototype["#startsWithI"] = function (s) {
            return this.toLowerCase().startsWith(s.toLowerCase());
            //if (this.startsWith(s)) return true;
            //return this.match(new RegExp('^' + s["#escapeRegs"](), 'ig')) != null;
        }
        String.prototype["#endsWithI"] = function (s) {
            return this.toLowerCase().endsWith(s.toLowerCase());
            //if (this.endsWith(s)) return true;
            ///return this.match(new RegExp(s["#escapeRegs"]() + '$', 'ig')) != null;
        }
        String.prototype["#includesI"] = function (this: string, s) {
            let index = (this.toLowerCase()).indexOf(s.toLowerCase());
            if (index != -1) return { result: true, index: index };
            else return { result: false, index: -1 }
            /* let index = this.indexOf(s);
             if (index != -1) return { result: true, index: index };
             let res = new RegExp(s["#escapeRegs"](), 'ig').exec(this);
             if (res != null) {
                 return {
                     result: true,
                     index: res.index
                 };
             } else return { result: false, index: -1 }*/
            //return this.match(new RegExp(s, 'ig')) != null;
        }
        String.prototype["#equalIgnoreCase"] = function (s) {
            return this.toLowerCase() === s.toLowerCase();
            //return this.match(new RegExp('^' + s + '$', 'ig')) != null;
            //return this.toUpperCase() === s.toUpperCase();
        }
        // String.prototype["#convertToFullPath"] = function (this: string, importUrl?: string): IResolvePathResult {
        //     let fpath = ProjectManage.reso4lvePathObject(this, importUrl);   
        //     fpath.result = fpath.result?.["#toFilePath"]();
        //     return fpath;
        // }
        String.prototype["#devEsc"] = function (this: string): string {
             return ucUtil.devEsc(this);
            // return this.replace(/(.{0,1}){:(.*?)}/gm, (m, fchar, url) => {
            //   //  console.log([m,fchar,url]);
            //     let rtrn = (fchar == "\\") ? `{:${url}}` : (fchar ?? '') + "" + url;
            //     return rtrn;
            // });
        }
        String.prototype["#_trim_"] = function (charlist?: string): string {
            if (charlist === undefined)
                charlist = "\s";
            charlist = charlist["#escapeRegs"]();
            return this.replace(new RegExp("^[" + charlist + "]+$", 'ig'), "");
        }
        String.prototype["#_trim"] = function (charlist?: string): string {
            if (charlist === undefined)
                charlist = "\s";
            charlist = charlist["#escapeRegs"]();
            return this.replace(new RegExp("^[" + charlist + "]+", 'ig'), "");
        }
        String.prototype["#_trimText"] = function (charlist?: string): string {
            if (charlist === undefined)
                charlist = "\s";
            charlist = charlist["#escapeRegs"]();
            let pattern = new RegExp("^" + charlist + "", 'ig');
            return this.replace(pattern, "");
        }
        String.prototype["#trim_"] = function (charlist?: string): string {
            if (charlist === undefined)
                charlist = "\s";
            charlist = charlist["#escapeRegs"]();
            return this.replace(new RegExp("[" + charlist + "]+$", 'ig'), "");
        }
        String.prototype["#trimText_"] = function (charlist?: string): string {
            if (charlist === undefined)
                charlist = "\s";
            charlist = charlist["#escapeRegs"](); ``
            let pattern = new RegExp("" + charlist + "$", 'ig');
            return this.replace(pattern, "");
        }
        String.prototype["#toFilePath"] = function (trim = true): string {
            let ns = this.replace(/[\\\/]+/gi, "/");
            return trim ? ns["#_trim_"]("/") : ns;
        }
        String.prototype["#removeExtension"] = function (extList: string[]): string {
            let str = this as string;
            let ptr: string, reg: string, flag: string = "g";
            if (extList != undefined) {
                ptr = extList.join('|');
                reg = "\\.(${ptr})$";
            } else {
                reg = "\\.[^.]+";
            }
            return str.replace(new RegExp(reg, flag), "");
        }
        String.prototype["#getDriveFromPath"] = function (): string | undefined {
            let r = this.match(/^[\w]+?:+/gi);
            return r.length > 0 ? r[0] : undefined;
        }

        Object.defineProperty(Object.prototype, "getType", {
            value: function () {
                if (this == undefined || this == null) return this + '';
                return Object.getPrototypeOf(this)?.constructor.name;
            },
            enumerable: false, // Prevents from showing up in for...in
            writable: true,
            configurable: true,
        });


        //console.log(`hello {=s}`.__({ s: 'd' }).then(s => s));
        //
        // String.prototype.__ = async function (jsonRow: {} = undefined): string {

        //     //.then(({ FileDataBank }) => {
        //     let rtrn: string = this as string;
        //     if (jsonRow != undefined)
        //         rtrn = jqFeatures.regsMng.parse(jsonRow, rtrn);
        //     return FileDataBank.getReplacedContent(rtrn);
        //     // });

        // };

        Extensions.isInited = true;
        console.log('EXTENSION inited...');

    }
    static doCommonDomProto(commonPrototype: EventTarget): void {
        commonPrototype["#bindEventWithUC"] = function (this: HTMLElement, event, handler, parentUc: Usercontrol, options) {
            this.addEventListener(event, handler, options);
            parentUc.ucExtends.Events.afterClose.on(() => {
                this.removeEventListener(event, handler);
            });
        };
        commonPrototype["#currentStyles"] = function (this: HTMLElement) {
            let ele = this as HTMLElement;
            let css = ele["#data"](ATTR_OF.UC.CSSStyleDeclarations) as CSSStyleDeclaration;
            if (css == undefined) {
                css = window.getComputedStyle(ele);
                ele["#data"](ATTR_OF.UC.CSSStyleDeclarations, css);
            }
            return css;
        }
        commonPrototype["#parseUc"] = function (this: HTMLElement, val: Usercontrol) {
            if (val) {
                val.ucExtends.passElement(this);
            }
            return this;
        }
        commonPrototype["#contain"] = function (this: HTMLElement, child: HTMLElement) {
            if (child == undefined) return false;
            let node = child.parentNode;
            while (node != null) {
                if (node === this) {
                    return true;
                }
                node = node.parentNode;
            }
            return false;
        }
        commonPrototype["#index"] = function (this: HTMLElement,): number {
            var i: number = 0;
            let child = this as Element;
            while ((child = child.previousElementSibling) != null)
                i++;
            return i;
        }
        let ATTR_ALLC = ATTR_OF.UC.ALLC;
        commonPrototype["#clearUcStyleClasses"] = function (this: HTMLElement,): void {
            this.classList.remove(...(Array.from(this.classList)).filter(s => s.startsWith(ATTR_ALLC)));
        }
        commonPrototype["#copyUcStyleClassesTo"] = function (this: HTMLElement, ...to: HTMLElement[]): void {
            let clst = (Array.from(this.classList)).filter(s => s.startsWith(ATTR_ALLC));
            to.forEach(d => {
                d.classList.add(...clst);
            });
        }
        /*commonPrototype["#index"] = function (this: HTMLElement,): number {
            var i: number = 0;
            let child = this as Element;
            while ((child = child.previousElementSibling) != null)
                i++;
            return i;
        }*/
        /* (function (supported){
             if (supported) return;
             Object.defineProperty(window.Node.prototype, 'isConnected', {get})
             function get() {
               return document.contains(this);
             }
           })('isConnected' in window.Node.prototype);*/
        commonPrototype["#selector"] = function (this: HTMLElement, rootEle: HTMLElement): string {
            let elm: HTMLElement = this;
            if (elm.tagName === "BODY") return "BODY";
            const names: string[] = [];
            while (elm.parentElement && elm.tagName !== "BODY") {
                if (rootEle != undefined && elm === rootEle) break;
                names.unshift(elm.tagName + ":nth-child(" + (elm["#index"]() + 1) + ")");
                elm = elm.parentElement;
            }
            return names.join(">");
        }

        commonPrototype["#find"] = function (this: HTMLElement, selector: string, exclude?: string): HTMLElement[] {
            let res: HTMLElement[] = [];
            let trec: NodeListOf<HTMLElement> = (this as HTMLElement).querySelectorAll(selector);
            if (exclude != undefined) {
                let selectorStr: string = (this as HTMLElement)["#selector"]() + ' ' + exclude;
                trec.forEach(s => {
                    let n = s as HTMLElement;
                    if (!n.matches(selectorStr))
                        res.push(n);
                });
            } else res = Array.from(trec);
            return res;
        }


        commonPrototype["#fireEvent"] = function <K extends keyof HTMLElementEventMap>(
            this: HTMLElement,
            eventType: K,
            eventInit?: Partial<HTMLElementEventMap[K]>
        ) {
            const event = new Event(eventType, { bubbles: true, cancelable: true, ...eventInit });
            this.dispatchEvent(event);
        }



        /*commonPrototype.fireEvent =
            function (this: HTMLElement, eventName: string, bubble: boolean = true, cancable: boolean = true): void {
            let evt: Event = document.createEvent(jqFeatures.getEventType(eventName));
            evt.initEvent(eventName, bubble, bubble);
            this.dispatchEvent(evt);
        }*/

        commonPrototype["#delete"] = function (this: HTMLElement): void {
            Extensions.data.deleteObjectRef(this);
            this.remove();
        }

        commonPrototype["#stamp"] = function (this: HTMLElement): string {
            return Extensions.data.getId(this).id;
        }

        commonPrototype["#data"] = function (this: HTMLElement, key?: string, value?: any): any {
            switch (arguments.length) {
                case 0:
                    return Extensions.data.getData(this);
                    break;
                case 1:
                    switch (typeof key) {
                        case "string": return Extensions.data.getData(this, key);
                        case "object": Extensions.data.getData(this, key);
                    }
                    break;
                case 2:
                    Extensions.data.setData(this, key, value);
                    break;
            }
        }
        commonPrototype["#is"] = function (this: HTMLElement, target: any): boolean {
            if (target == undefined || target == null) return false;
            return Extensions.data.compareElements(this, target);
        }
        /* commonPrototype.is = function (target: any): boolean {
             return (this as HTMLElement).is(target);
         }*/
        commonPrototype["#$"] = function (this: HTMLElement): HTMLElement {
            Extensions.data.initElement(this as any);
            return this;
        }
        commonPrototype["#on"] = function <K extends keyof HTMLElementEventMap>(eventList: K, handlerCallback: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any): void {
            let _tar: HTMLElement = this as any;
            eventList.split(" ").forEach(function (e) {
                Extensions.data.onHandler(_tar, e as any, handlerCallback);
            });
        }

        commonPrototype["#off"] = function <K extends keyof HTMLElementEventMap>(eventList: K, handlerCallback: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any): void {
            let _tar: HTMLElement = this as any;
            eventList.split(" ").forEach(function (e) {
                Extensions.data.offHandler(_tar, e as any, handlerCallback);
            });
        }
    }
}

/**
 * Produces a function which uses template strings to do simple interpolation from objects.
 * 
 * Usage:
 *    var makeMeKing = generateTemplateString('${name} is now the king of ${country}!');
 * 
 *    console.log(makeMeKing({ name: 'Bryan', country: 'Scotland'}));
 *    // Logs 'Bryan is now the king of Scotland!'
 
var generateTemplateString = (function () {
    var cache = {};

    function generateTemplate(template) {
        var fn = cache[template];

        if (!fn) {
            // Replace ${expressions} (etc) with ${map.expressions}.

            var sanitized = template
                .replace(/\$\{([\s]*[^;\s\{]+[\s]*)\}/g, function (_, match) {
                    return `\$\{map.${match.trim()}\}`;
                })
                // Afterwards, replace anything that's not ${map.expressions}' (etc) with a blank string.
                .replace(/(\$\{(?!map\.)[^}]+\})/g, '');

            fn = Function('map', `return \`${sanitized}\``);
        }

        return fn;
    }

    return generateTemplate;
})();
*/