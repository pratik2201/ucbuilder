
import { looping } from "ucbuilder/build/common";
import { uniqOpt } from "ucbuilder/enumAndMore";
import { regsManage } from "ucbuilder/build/regs/regsManage";
import { FileDataBank } from "ucbuilder/global/fileDataBank";
import { Usercontrol } from "ucbuilder/Usercontrol";



class rowInfo {
    id: string = "";
    data: {} = {};
    event: { [key: string]: {} } = {};
}

class dataManager {
    source: {} = {};
    map: {} = {};
    static ATTR = {
        DM_DATA: "dm" + uniqOpt.randomNo(),
    }
    eventIncrementId: number = 0;
    elementIncrementId: number = 1;

    getId = (element: HTMLElement): rowInfo => {
        let row: rowInfo = element[dataManager.ATTR.DM_DATA];
        if (row == undefined) {
            this.elementIncrementId++;
            let _id = "id_" + this.elementIncrementId;
            row = new rowInfo();
            row.id = _id;
            //console.log(this.source);
            // console.log(this.elementIncrementId.toAlphabate()+"  ("+this.elementIncrementId+")");

            element[dataManager.ATTR.DM_DATA] = row;
            //this.source[_id] = element;
        }
        return row;
    }

    getElement(id: string): HTMLElement {
        return this.source[id];
    }

    fillObjectRef(targetObject: HTMLElement, arr: string[]): void {
        arr.push(this.getId(targetObject).id);
        looping.htmlChildren(targetObject, s => this.fillObjectRef(s, arr));
    }

    deleteObjectRef(targetObject: HTMLElement): void {
        //console.log('deleting.,');

        let keylist: string[] = [];
        this.fillObjectRef(targetObject, keylist);
        keylist.forEach(e => delete this.source[e]);
    }

    getData(targetObject: HTMLElement, key?: string): any {
        let row: rowInfo = this.getId(targetObject);
        switch (arguments.length) {
            case 2:
                return row.data[key];
            case 1:
                return row.data;
            default:
                return row;
        }
    }

    setData(targetObject: HTMLElement, key: string, value?: any): void {
        let row: rowInfo = this.getId(targetObject);
        switch (arguments.length) {
            case 3:
                row.data[key] = value;
                break;
            case 2:
                row.data = value;
                break;
        }
    }

    compareElements(ele1: HTMLElement, ele2: HTMLElement): boolean {
        return this.getId(ele1).id === this.getId(ele2).id;
    }

    initElement(target: HTMLElement): void {
        target.querySelectorAll('*').forEach((ele) => {
            this.getId(ele as HTMLElement);
        });
    }

    setEvent<K extends keyof HTMLElementEventMap>(element: HTMLElement, eventName: K, key: string, handler: (this: HTMLDivElement, ev: HTMLElementEventMap[K]) => any): void {
        let evt: {} = {};
        let row: rowInfo = this.getId(element);
        if (eventName in row.event) {
            evt = row.event[eventName];
            evt[key] = handler;
        } else {
            evt[key] = handler;
            row.event[eventName] = evt;
        }
        element.addEventListener(eventName, handler, false);
    }

    unSetEvent<K extends keyof HTMLElementEventMap>(element: HTMLElement, eventName: K, key?: string, handler?: (this: HTMLDivElement, ev: HTMLElementEventMap[K]) => any): void {
        let evt: {} = {};
        if (handler == undefined) {
            let row: rowInfo = this.getId(element);
            if (eventName in row.event) {
                evt = row.event[eventName];
                if (key == undefined) {
                    Object.keys(evt).forEach(s => element.removeEventListener(eventName, evt[s], false));
                }
                else {
                    handler = evt[key];
                    element.removeEventListener(eventName as keyof HTMLElementEventMap, handler, false);
                }
            }
        } else element.removeEventListener(eventName as keyof HTMLElementEventMap, handler, false);
    }

    onHandler<K extends keyof HTMLElementEventMap>(element: HTMLElement, eventName: K, handler: (this: HTMLDivElement, ev: HTMLElementEventMap[K]) => any): void {
        let eType: string[] = eventName.split(".");
        if (eType.length == 0) {
            this.setEvent(element, eType[0] as keyof HTMLElementEventMap, uniqOpt.guidAs_, handler);
        } else {
            this.setEvent(element, eType[0] as keyof HTMLElementEventMap, eType[1], handler);
        }
    }

    offHandler<K extends keyof HTMLElementEventMap>(element: HTMLElement, eventName: K, handler: (this: HTMLDivElement, ev: HTMLElementEventMap[K]) => any): void {
        let eType: string[] = eventName.split(".");
        if (eType.length == 0) {
            this.unSetEvent(element, eType[0] as keyof HTMLElementEventMap, undefined, handler);
        } else {
            this.unSetEvent(element, eType[0] as keyof HTMLElementEventMap, eType[1], handler);
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
 */
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
class jqFeatures {
    static isInited: boolean = false;
    static data: dataManager = new dataManager();
    static eventMap: { [key: string]: string } = {
        "abort": "UIEvent",
        "animationcancel": "AnimationEvent",
        "animationend": "AnimationEvent",
        "animationiteration": "AnimationEvent",
        "animationstart": "AnimationEvent",
        "auxclick": "MouseEvent",
        "beforeinput": "InputEvent",
        "blur": "FocusEvent",
        "canplay": "Event",
        "canplaythrough": "Event",
        "change": "Event",
        "click": "MouseEvent",
        "close": "Event",
        "compositionend": "CompositionEvent",
        "compositionstart": "CompositionEvent",
        "compositionupdate": "CompositionEvent",
        "contextmenu": "MouseEvent",
        "cuechange": "Event",
        "dblclick": "MouseEvent",
        "drag": "DragEvent",
        "dragend": "DragEvent",
        "dragenter": "DragEvent",
        "dragleave": "DragEvent",
        "dragover": "DragEvent",
        "dragstart": "DragEvent",
        "drop": "DragEvent",
        "durationchange": "Event",
        "emptied": "Event",
        "ended": "Event",
        "error": "ErrorEvent",
        "focus": "FocusEvent",
        "focusin": "FocusEvent",
        "focusout": "FocusEvent",
        "formdata": "FormDataEvent",
        "gotpointercapture": "PointerEvent",
        "input": "Event",
        "invalid": "Event",
        "keydown": "KeyboardEvent",
        "keypress": "KeyboardEvent",
        "keyup": "KeyboardEvent",
        "load": "Event",
        "loadeddata": "Event",
        "loadedmetadata": "Event",
        "loadstart": "Event",
        "lostpointercapture": "PointerEvent",
        "mousedown": "MouseEvent",
        "mouseenter": "MouseEvent",
        "mouseleave": "MouseEvent",
        "mousemove": "MouseEvent",
        "mouseout": "MouseEvent",
        "mouseover": "MouseEvent",
        "mouseup": "MouseEvent",
        "pause": "Event",
        "play": "Event",
        "playing": "Event",
        "pointercancel": "PointerEvent",
        "pointerdown": "PointerEvent",
        "pointerenter": "PointerEvent",
        "pointerleave": "PointerEvent",
        "pointermove": "PointerEvent",
        "pointerout": "PointerEvent",
        "pointerover": "PointerEvent",
        "pointerup": "PointerEvent",
        "progress": "ProgressEvent",
        "ratechange": "Event",
        "reset": "Event",
        "resize": "UIEvent",
        "scroll": "Event",
        "securitypolicyviolation": "SecurityPolicyViolationEvent",
        "seeked": "Event",
        "seeking": "Event",
        "select": "Event",
        "selectionchange": "Event",
        "selectstart": "Event",
        "slotchange": "Event",
        "stalled": "Event",
        "submit": "SubmitEvent",
        "suspend": "Event",
        "timeupdate": "Event",
        "toggle": "Event",
        "touchcancel": "TouchEvent",
        "touchend": "TouchEvent",
        "touchmove": "TouchEvent",
        "touchstart": "TouchEvent",
        "transitioncancel": "TransitionEvent",
        "transitionend": "TransitionEvent",
        "transitionrun": "TransitionEvent",
        "transitionstart": "TransitionEvent",
        "volumechange": "Event",
        "waiting": "Event",
        "webkitanimationend": "Event",
        "webkitanimationiteration": "Event",
        "webkitanimationstart": "Event",
        "webkittransitionend": "Event",
        "wheel": "WheelEvent",
    };

    static getEventType(evtName: string): string {
        return (evtName in jqFeatures.eventMap) ? jqFeatures.eventMap[evtName] : "Event";
    }

    static getElementById(id: string): HTMLElement {
        return this.data.getElement(id);
    }

    static onReady(callback: Function = () => { }): void {
        if (/*document.readyState === 'ready' || */document.readyState === 'complete') {
            callback();
        } else {
            document.onreadystatechange = function () {
                if (document.readyState == "complete") {
                    callback();
                }
            }
        }
    }

    static regsMng: regsManage = new regsManage();
    private static doCommonDomProto(commonPrototype: any): void {
        commonPrototype.bindEventWithUC = function (event, handler, parentUc: Usercontrol, options) {
            this.addEventListener(event, handler, options);
            parentUc.ucExtends.Events.afterClose.on(() => {
                this.removeEventListener(event, handler);
            });
        };
        commonPrototype.parseUc = function (val: Usercontrol) {
            if (val) {
                return val.ucExtends.passElement(this);
            }
            return this;
        }
        commonPrototype.contain = function (child: HTMLElement) {
            let node = child.parentNode;
            while (node != null) {
                if (node === this) {
                    return true;
                }
                node = node.parentNode;
            }
            return false;
        }
        commonPrototype.index = function (): number {
            var i: number = 0;
            let child = this as Element;
            while ((child = child.previousElementSibling) != null)
                i++;
            return i;
        }
        commonPrototype.index = function (): number {
            var i: number = 0;
            let child = this as Element;
            while ((child = child.previousElementSibling) != null)
                i++;
            return i;
        }
       /* (function (supported){
            if (supported) return;
            Object.defineProperty(window.Node.prototype, 'isConnected', {get})
            function get() {
              return document.contains(this);
            }
          })('isConnected' in window.Node.prototype);*/
        commonPrototype.selector = function (rootEle:HTMLElement): string {
            let elm: HTMLElement = this;
            if (elm.tagName === "BODY") return "BODY";
            const names: string[] = [];
            while (elm.parentElement && elm.tagName !== "BODY") {
                if (rootEle != undefined && elm === rootEle) break;
                names.unshift(elm.tagName+":nth-child(" + (elm.index()+1) + ")");
                elm = elm.parentElement;
            }
            return names.join(">");
        }

        commonPrototype.find = function (selector: string, exclude?: string): HTMLElement[] {
            let res: HTMLElement[] = [];
            let trec: NodeListOf<HTMLElement> = (this as HTMLElement).querySelectorAll(selector);
            if (exclude != undefined) {
                let selectorStr: string = (this as HTMLElement).selector() + ' ' + exclude;
                trec.forEach(s => {
                    let n = s as HTMLElement;
                    if (!n.matches(selectorStr))
                        res.push(n);
                });
            } else res = Array.from(trec);
            return res;
        }

        commonPrototype.fireEvent = function (eventName: string, bubble: boolean = true, cancable: boolean = true): void {
            let evt: Event = document.createEvent(jqFeatures.getEventType(eventName));
            evt.initEvent(eventName, bubble, bubble);
            this.dispatchEvent(evt);
        }

        commonPrototype.delete = function (): void {
            jqFeatures.data.deleteObjectRef(this);
            this.remove();
        }

        commonPrototype.stamp = function (): string {
            return jqFeatures.data.getId(this).id;
        }

        commonPrototype.data = function (key?: string, value?: any): any {
            switch (arguments.length) {
                case 0:
                    return jqFeatures.data.getData(this);
                    break;
                case 1:
                    switch (typeof key) {
                        case "string": return jqFeatures.data.getData(this, key);
                        case "object": jqFeatures.data.getData(this, key);
                    }
                    break;
                case 2:
                    jqFeatures.data.setData(this, key, value);
                    break;
            }
        }
        commonPrototype.is = function (target: any): boolean {
            if (target == undefined || target == null) return false;
            return jqFeatures.data.compareElements(this, target);
        }
        /* commonPrototype.is = function (target: any): boolean {
             return (this as HTMLElement).is(target);
         }*/
        commonPrototype.$ = function (): HTMLElement {
            jqFeatures.data.initElement(this);
            return this;
        }
        commonPrototype.on = function <K extends keyof HTMLElementEventMap>(eventList: K, handlerCallback: (this: HTMLDivElement, ev: HTMLElementEventMap[K]) => any): void {
            let _tar: HTMLElement = this;
            eventList.split(" ").forEach(function (e) {
                jqFeatures.data.onHandler(_tar, e as keyof HTMLElementEventMap, handlerCallback);
            });
        }

        commonPrototype.off = function <K extends keyof HTMLElementEventMap>(eventList: K, handlerCallback: (this: HTMLDivElement, ev: HTMLElementEventMap[K]) => any): void {
            let _tar: HTMLElement = this;
            eventList.split(" ").forEach(function (e) {
                jqFeatures.data.offHandler(_tar, e as keyof HTMLElementEventMap, handlerCallback);
            });
        }
    }

    static init(): void {
        if (jqFeatures.isInited) return;
        //const commonPrototype = Object.assign({}, HTMLElement.prototype, Element.prototype, EventTarget.prototype);
        this.doCommonDomProto(HTMLElement.prototype);
        this.doCommonDomProto(Element.prototype);
        this.doCommonDomProto(EventTarget.prototype);

        /*const _capitalizeHandle = function () {
            let child = this as HTMLTextAreaElement;
            child.addEventListener('beforeinput', (e) => { 'keyup'
                var spring-box = event.target as HTMLInputElement;
                var start = spring-box.selectionStart;
                var end = spring-box.selectionEnd;
                spring-box.value = UcExtra.getAdvanceTextBeforeInput(e).toCamelCase();//spring-box.value.toCamelCase();
                spring-box.setSelectionRange(start+1, end+1);
                e.preventDefault();
            });
        }
        HTMLInputElement.prototype.capitalizeHandle = _capitalizeHandle;
        HTMLTextAreaElement.prototype.capitalizeHandle = _capitalizeHandle;*/

        const _getSelectedValuee = function (): string {
            let child = this as HTMLInputElement;

            if (child.tagName === "TEXTAREA" ||
                (child.tagName === "INPUT" && child.type === "text")) {
                return child.value.substring(child.selectionStart, child.selectionEnd);
                // or return the return value of Tim Down's selection code here
            } else return child.innerText.substring(child.selectionStart, child.selectionEnd);
        };
        HTMLInputElement.prototype.getSelectedValue =
            HTMLTextAreaElement.prototype.getSelectedValue = _getSelectedValuee;



        NodeList.prototype.on = function <K extends keyof HTMLElementEventMap>(eventList: K, handlerCallback: (this: HTMLDivElement, ev: HTMLElementEventMap[K]) => any): void {
            Array.from(this).on(eventList, handlerCallback);
        }

        Array.prototype.on = function <K extends keyof HTMLElementEventMap>(eventList: K, handlerCallback: (this: HTMLDivElement, ev: HTMLElementEventMap[K]) => any): void {
            let splEvt: string[] = eventList.split(" ");
            this.forEach((tar: HTMLElement) => {
                splEvt.forEach(function (e) {
                    jqFeatures.data.onHandler(tar, e as keyof HTMLElementEventMap, handlerCallback);
                });
            });
        }
        Array.prototype.distinct = function <T>(): Array<T> {
            return [...new Set(this)] as unknown as Array<T>;
        }

        Array.prototype.RemoveMultiple = function <T>(...eleList: T[]): Array<T> {
            var valuesArr = this as T[];
            const indices = [];
            let findex = -1;
            for (let i = 0; i < eleList.length; i++) {
                findex = valuesArr.indexOf(eleList[i]);
                if (findex != -1) indices.push(findex);
            }
            valuesArr.RemoveByFilter(row => eleList.indexOf(row) == -1);
            //  console.log(eleList);

            return [];
            //return valuesArr.RemoveAtMultiple(...indices);
        }
        Array.prototype.RemoveByFilter = function (callback) {
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

        Array.prototype.RemoveAtMultiple = function <T>(...removeValFromIndex: number[]): Array<T> {
            var valuesArr = this as T[];

            removeValFromIndex.sort(function (a, b) { return b - a; });
            let removedEle: T[] = [];
            for (var i = removeValFromIndex.length - 1; i >= 0; i--)
                return valuesArr.splice(removeValFromIndex[i], 1);
        }

        Array.prototype.fillInto = function (to: [], clearTarget = false) {
            let from = this as [];
            if (clearTarget) to.length = 0;
            for (let i = 0, len = from.length; i < len; i++)
                to.push(from[i]);

        }
        
        SVGElement.prototype.data = function (key?: string, value?: any): any {
            switch (arguments.length) {
                case 0:
                    return jqFeatures.data.getData(this as unknown as HTMLElement);
                    break;
                case 1:
                    switch (typeof key) {
                        case "string": return jqFeatures.data.getData(this as unknown as HTMLElement, key);
                        case "object": jqFeatures.data.getData(this as unknown as HTMLElement, key);
                    }
                    break;
                case 2:
                    jqFeatures.data.setData(this as unknown as HTMLElement, key, value);
                    break;
            }
        }

        Number.prototype.toAlphabate = function (): string {
            var arr = [];
            let count = this;
            while (count >> 0 > 0) {
                arr.unshift(String.fromCharCode(65 + --count % 26));
                count /= 26
            }
            return arr.join("")
        }
        String.prototype.escapeRegs = function () {
            return this.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }
        String.prototype.replaceAllWithResult = function (find, replace) {
            let hasReplaced = false;
            let content = this.replace(new RegExp(find.escapeRegs(), 'gi'), () => {
                hasReplaced = true;
                return replace;
            });
            return {
                result: content,
                hasReplaced: hasReplaced
            }
        }
        String.prototype.$ = function (): HTMLElement {
            var div = document.createElement('pre');
            div.innerHTML = this.trim();
            jqFeatures.data.initElement(div.firstChild as HTMLElement);
            return div.firstChild as HTMLElement;
        }

        String.prototype.parseUc = function <T = Usercontrol>(val: T): string {
            var div = document.createElement('pre');
            div.innerHTML = this;
            if (val) {
                return (val as Usercontrol).ucExtends.passElement(div).innerHTML;
            } return this;
        }
        String.prototype.toCamelCase = function () {
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

        String.prototype.templateBind = function (row) {

            return generateTemplateString(this)(row);
            //return eval('`' + this + '`');
            /*const names = Object.keys(params);
            const vals = Object.values(params);
            try {

                return new Function(...names, `return \`${this}\`;`)(...vals);
            } catch {
                debugger;
                return '';
            }*/
        }
        String.prototype.startsWithI = function (s) {
            if (this.startsWith(s)) return true;
            return this.match(new RegExp('^' + s.escapeRegs(), 'ig')) != null;
        }
        String.prototype.endsWithI = function (s) {
            if (this.endsWith(s)) return true;
            return this.match(new RegExp(s.escapeRegs() + '$', 'ig')) != null;
        }
        String.prototype.includesI = function (s) {
            let index = this.indexOf(s);
            if (index != -1) return { result: true, index: index };
            let res = new RegExp(s.escapeRegs(), 'ig').exec(this);
            if (res != null) {
                return {
                    result: true,
                    index: res.index
                };
            } else return { result: false, index: -1 }
            //return this.match(new RegExp(s, 'ig')) != null;
        }
        String.prototype.equalIgnoreCase = function (s) {
            return this.match(new RegExp('^' + s + '$', 'ig')) != null;
            //return this.toUpperCase() === s.toUpperCase();
        }
        String.prototype._trim_ = function (charlist?: string): string {
            if (charlist === undefined)
                charlist = "\s";
            return this.replace(new RegExp("^[" + charlist + "]+$", 'ig'), "");
        }
        String.prototype._trim = function (charlist?: string): string {
            if (charlist === undefined)
                charlist = "\s";
            return this.replace(new RegExp("^[" + charlist + "]+", 'ig'), "");
        }
        String.prototype._trimText = function (charlist?: string): string {
            if (charlist === undefined)
                charlist = "\s";
            return this.replace(new RegExp("^" + charlist + "", 'ig'), "");
        }
        String.prototype.trim_ = function (charlist?: string): string {
            if (charlist === undefined)
                charlist = "\s";
            return this.replace(new RegExp("[" + charlist + "]+$", 'ig'), "");
        }
        String.prototype.trimText_ = function (charlist?: string): string {
            if (charlist === undefined)
                charlist = "\s";
            return this.replace(new RegExp("" + charlist + "$", 'ig'), "");
        }
        String.prototype.toFilePath = function (trim=true): string {
            let ns = this.replace(/[\\\/]+/gi, "/");
            return trim?ns._trim_("/"):ns;
        }
        String.prototype.getDriveFromPath = function (): string | undefined {
            let r = this.match(/^[\w]+?:+/gi);
            return r.length > 0 ? r[0] : undefined;
        }

        String.prototype.__ = function (jsonRow: {}): string {
            let rtrn = this;
            if (jsonRow != undefined)
                rtrn = jqFeatures.regsMng.parse(jsonRow, rtrn);
            return FileDataBank.getReplacedContent(rtrn);
            /* return (async () => {
                 //let { FileDataBank } = await import("ucbuilder/global/fileDataBank");
                 //FileDataBank
                 return FileDataBank.getReplacedContent(rtrn);
             })();*/
            //});
        }
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

        jqFeatures.isInited = true;
    }
    static importMod = async (url: string, jsonRow = {}): Promise<string> => {
        let { FileDataBank } = await import("ucbuilder/global/fileDataBank");
        let rtrn: string = url;
        if (jsonRow != undefined)
            rtrn = jqFeatures.regsMng.parse(jsonRow, rtrn);
        return rtrn;
    }
}

export { dataManager, jqFeatures };