import { CommonEvent } from "../global/commonEvent.js";
import { GetRandomNo, GetUniqueId, IBuildKeyBinding } from "../ipc/enumAndMore.js";
import { Usercontrol } from "../Usercontrol.js";
import { TabIndexManager } from "./TabIndexManager.js";


interface WinNode {
    uc?: Usercontrol,
    display?: string,
    lastFocusedAt?: HTMLElement
}
export class FocusManager {
    currentElement: HTMLElement | undefined;
    Event = {
        onFatch: new CommonEvent<(ele: HTMLElement) => void>(),
        onFocus: new CommonEvent<(ele: HTMLElement) => void>(),
    }
    fetch(ele: HTMLElement) {
        this.currentElement = undefined;
        //console.log(ele);

        this.currentElement = ele ?? document.activeElement as HTMLElement;
        this.Event.onFatch.fire([this.currentElement]);
        //this.currentElement.fireEvent('blur');
    }
    /**
     * 
     * @param containerElement if last focused element not insde `contaierElement` than direct focus to `containerElement`
     */
    focus(containerElement?: HTMLElement) {
        if (containerElement != undefined && !containerElement["#contain"](this.currentElement)) {
            if (containerElement.hasAttribute('tabindex')) {
                containerElement.focus();
            } else {
                TabIndexManager.moveNext(containerElement, undefined);
            }
        } else {
            if (this.currentElement == undefined) return;
            this.currentElement.focus();
        }

        this.Event.onFocus.fire([this.currentElement]);
    }
}
export interface IKeyEventBindingNode {
    key: IBuildKeyBinding;
    callback: (e: KeyboardEvent) => void;
}
export class KeyCaptureManage {
    static source: IKeyEventBindingNode[] = [];
    static Add(node: IKeyEventBindingNode, updateIfExist = false) {
        const _k = node.key;
        _k.altKey = _k.altKey ?? false;
        _k.shiftKey = _k.shiftKey ?? false;
        _k.ctrlKey = _k.ctrlKey ?? false;
        _k.keyCode = _k.keyCode ?? undefined;
        const fIndex = this.source.findIndex(s => WinManager.isSameKey(s.key, _k));
        if (fIndex == -1)
            this.source.push(node);
        else {
            if (updateIfExist) {
                this.source.splice(fIndex, 1);
                this.source.push(node);
            }
        }
    }
    static init() {
        let keyBindingNode: IKeyEventBindingNode = undefined;
        WinManager.event.keyup((ev) => {
            if (keyBindingNode != undefined) {
                if (WinManager.isKeyOK(keyBindingNode.key, ev)) {
                    keyBindingNode.callback(ev);
                    keyBindingNode = undefined;
                }
            }
        });

        WinManager.event.keydown((ev) => {
            for (let i = 0, ilen = this.source.length; i < ilen; i++) {
                const iItem = this.source[i];
                if (WinManager.isKeyOK(iItem.key, ev)) {
                    keyBindingNode = iItem;
                }
            }
        });
    }
}
export class WinManager {
    static isSameKey = (j: IBuildKeyBinding, k: IBuildKeyBinding) => {
        return j.keyCode == k.keyCode && j.altKey == k.altKey && j.shiftKey == k.shiftKey && j.ctrlKey == k.ctrlKey;
    }
    static isKeyOK = (k: IBuildKeyBinding, ev: KeyboardEvent) => {
        let rtrn = (k.shiftKey == ev.shiftKey && k.ctrlKey == ev.ctrlKey && k.altKey == ev.altKey);
        rtrn = rtrn && (Number.isNaN(k.keyCode) || k.keyCode == ev.keyCode);
        return rtrn;
    }
    private static _keydown = new CommonEvent<(e: KeyboardEvent) => void>();
    private static _keyup = new CommonEvent<(e: KeyboardEvent) => void>();
    static initEvent() {
        const _this = this;
        window.addEventListener('keydown', (e) => {
            if (e.defaultPrevented) return;
            _this._keydown.fire([e]);
        });
        window.addEventListener('keyup', (e) => {
            if (e.defaultPrevented) return;
            _this._keyup.fire([e]);
        })
    }
    static event = {
        onFreez: (uc: Usercontrol) => {

        },
        onUnFreez: (uc: Usercontrol) => {

        },
        keydown: (callback: (e: KeyboardEvent) => void, uc?: Usercontrol) => {
            this._keydown.on(callback, uc);
        },
        keyup: (callback: (e: KeyboardEvent) => void, uc?: Usercontrol) => {
            this._keyup.on(callback, uc);
        },

    }
    static ACCESS_KEY = 'WinManager_' + GetUniqueId();
    static getNode(htNode: HTMLElement): WinNode { return htNode["#data"](WinManager.ACCESS_KEY); }
    static setNode(htNode: HTMLElement): WinNode {
        const dta: WinNode = {};
        dta.uc = Usercontrol.parse(htNode);
        htNode["#data"](WinManager.ACCESS_KEY, dta);
        return dta;
    }
    static focusMng: FocusManager = new FocusManager();
    static push = (form: Usercontrol): void => {
        let _this = this;
        const mainHT = form.ucExtends.wrapperHT;
        if (form.ucExtends.isForm) {
            const prevNode = mainHT.previousElementSibling as HTMLElement;
            if (prevNode != null) {
                const wn = WinManager.getNode(prevNode) ?? WinManager.setNode(prevNode);
                const activeElement = wn.uc.ucExtends.lastFocuedElement;// document.activeElement;
                if (prevNode.contains(activeElement))
                    wn.lastFocusedAt = activeElement as any;
                wn.display = prevNode.style.display;
                let doStyleDisplay = form.ucExtends.Events.beforeUnFreez.fire([wn?.uc]);
                this.setfreez(true, wn/*, doStyleDisplay*/);
            }
        }
    }

    static pop = (form: Usercontrol): void => {
        const prevHt = form.ucExtends.wrapperHT.previousElementSibling as HTMLElement;
        if (prevHt != undefined) {
            const wn = WinManager.getNode(prevHt);
            if (wn != undefined) {
                this.setfreez(false, wn/*, res*/);
            }

        }
    }

    static ATTR = {
        DISABLE: {
            NEW_VALUE: "disnval" + GetUniqueId(),
            OLD_VALUE: "disoval" + GetUniqueId(),
        },
        INERT: {
            NEW_VALUE: "inrtnval" + GetUniqueId(),
            OLD_VALUE: "inrtoval" + GetUniqueId(),
        }
    }

    static setfreez = (freez: boolean, wnode: WinNode/*, handeledDisplay: boolean*/): void => {
        let element = wnode.uc.ucExtends.wrapperHT;

        if (freez) {

            this.event.onFreez(wnode.uc);
            this.focusMng.fetch(wnode.uc.ucExtends.lastFocuedElement);
            wnode.lastFocusedAt = this.focusMng.currentElement;
            wnode.display = element.style.display;
            this.FreezThese(freez, element);
            if (!wnode.uc.ucExtends.keepVisible) element.style.display = 'none';
        } else {
            this.event.onUnFreez(wnode.uc);
            this.FreezThese(freez, element);
            element.style.display = wnode.display;
            this.focusMng.currentElement = wnode.lastFocusedAt;
            requestAnimationFrame(() => {
                this.focusMng.focus(element);
            })
        }
    }

    static FreezThese(freez: boolean, ...elements: HTMLElement[]) {
        if (freez) {
            for (let i = 0, ilen = elements.length; i < ilen; i++) {
                const element = elements[i];
                let inertAttr = element.getAttribute("inert");
                if (inertAttr != null) element["#data"](WinManager.ATTR.INERT.OLD_VALUE, inertAttr);
                element.setAttribute('inert', 'true');
            }
        } else {
            for (let i = 0, ilen = elements.length; i < ilen; i++) {
                const element = elements[i];
                element.setAttribute('active', '1');
                let inertAttr = element["#data"](WinManager.ATTR.INERT.OLD_VALUE);
                if (inertAttr != undefined) element.setAttribute('inert', inertAttr);
                else element.removeAttribute('inert');
            }
        }
    }


    static captureElementAsImage(element: HTMLElement) {
        // const element = document.getElementById(elementId);
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        // Set canvas dimensions to match the element
        canvas.width = element.offsetWidth;
        canvas.height = element.offsetHeight;

        // Draw the element onto the canvas
        ctx.drawImage(element as CanvasImageSource, 0, 0);
        // Get the image data as a data URL
        const imageData = canvas.toDataURL('image/png');
        return imageData;
    }

}
WinManager.initEvent();