import { CommonEvent } from "../global/commonEvent.js";
import { GetUniqueId } from "../ipc/enumAndMore.js";
import { Usercontrol } from "../Usercontrol.js";
import { KeyboardKey, KeyboardKeyEnum } from "./hardware.js";
import { TabIndexManager } from "./TabIndexManager.js";

type ShortcutCallback = (e: KeyboardEvent) => void;
export class ShortcutNode {
    private shortcutMap: Record<string, ShortcutCallback> = {};
    register(keys: KeyboardKey[][], callback: ShortcutCallback, override = false) {
        const rtrn: string[] = [];
        keys.forEach(key => {
            const combo = key.slice().sort().join("+");

            if (!(combo in this.shortcutMap)) {
                this.shortcutMap[combo] = callback;
                console.log(`${combo} Registered`);
                rtrn.push(combo);
            } else {
                if (override) {
                    this.shortcutMap[combo] = callback;
                    console.log(`[${combo}] Registered`);
                    rtrn.push(combo);
                }
            }
        });
        return rtrn;
    }

    /** Unregister a shortcut */
    unregister(keys: KeyboardKey[]) {
        const rtrn: string[] = [];
        const combo = keys.slice().sort().join("+");
        if (combo in this.shortcutMap) {
            delete this.shortcutMap[combo];
            rtrn.push(combo);
        }
        return rtrn;
    }

    /** Clear all shortcuts */
    clear(): void {
        this.shortcutMap = {};
    }

    callTask(combo: string, e: KeyboardEvent) {
        if (combo in this.shortcutMap) {
            const cb = this.shortcutMap[combo];
            if (cb) cb(e);
            return true;
        } else return false;

    }
}
export class ShortcutManager {
    private pressedKeys: Set<string>;
    source: ShortcutNode[] = [];
    CreateLayer() {
        const layer = new ShortcutNode();
        this.source.unshift(layer);
        return layer;
    }
    constructor() {
        this.pressedKeys = new Set();
        WinManager.event.keydown.on(this._keydown);
        WinManager.event.keyup.on(this._keyup);
        window.addEventListener("blur", this._blur);
    }
    /** Destroy manager and remove all listeners */
    destroy(): void {
        WinManager.event.keydown.off(this._keydown);
        WinManager.event.keyup.off(this._keyup);
        window.removeEventListener("blur", this._blur);
        this.pressedKeys.clear();
        this.source.forEach(s => s.clear());
    }

    /** Normalize key combination to string */
    private static getComboString(keys: Set<string>): string {
        return [...keys].sort().join("+");
    }

    // --- PRIVATE EVENT HANDLERS ---

    private _keydown = (e: KeyboardEvent): void => {
        if (this.pressedKeys.has(e.code)) return;

        this.pressedKeys.add(e.code);
        //console.log('down.');

        const combo = ShortcutManager.getComboString(this.pressedKeys);
        const src = this.source;
        for (let i = 0, ilen = src.length; i < ilen; i++) {
            const iItem = src[i];
            if (iItem.callTask(combo, e)) return;
        }
    }

    private _keyup = (e: KeyboardEvent): void => {
        this.pressedKeys.delete(e.code);
        //this.pressedKeys.clear();
    }

    private _blur(): void {
        this.pressedKeys.clear();
    }
}

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

export class WinManager {
    static shortcutManage: ShortcutManager;
    static isSameKey = <T>(arr1: T[], arr2: T[]): boolean => {
        if (arr1.length !== arr2.length) return false; // lengths must be same
        for (let i = 0; i < arr1.length; i++) {
            if (arr1[i] !== arr2[i]) return false; // check each element
        }
        return true;
    }

    static initEvent() {
        const _this = this;
        //.log('======================>WinManager.initEvent');

        window.addEventListener('keydown', async (e) => {
            if (e.code == undefined) return; 
            await _this.event.keydown.fireAsync([e]);

        });
        window.addEventListener('keyup', async (e) => {
            if (e.code == undefined) return;
            await _this.event.keyup.fireAsync([e]);
        });
        this.shortcutManage = new ShortcutManager();
    }
    static event = {
        onFreez: (uc: Usercontrol) => {

        },
        onUnFreez: (uc: Usercontrol) => {

        },
        keydown: new CommonEvent<(e: KeyboardEvent) => void>(),
        keyup: new CommonEvent<(e: KeyboardEvent) => void>(),

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
    static push = async (form: Usercontrol) => {
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
               await this.setfreez(true, wn/*, doStyleDisplay*/);
            }
            await form.ucExtends.Events.activate.fireAsync([]);
        }
    }

    static pop = async (form: Usercontrol) => {
        const prevHt = form.ucExtends.wrapperHT.previousElementSibling as HTMLElement;
        if (prevHt != undefined) {
            const wn = WinManager.getNode(prevHt);
            if (wn != undefined) {
                await this.setfreez(false, wn/*, res*/);
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

    static setfreez = async (freez: boolean, wnode: WinNode/*, handeledDisplay: boolean*/)  => {
        const uc = wnode.uc;
        const element = uc.ucExtends.wrapperHT;
        if (freez) { 
            this.event.onFreez(uc);
            this.focusMng.fetch(uc.ucExtends.lastFocuedElement);
            wnode.lastFocusedAt = this.focusMng.currentElement;
            wnode.display = element.style.display;
           await this.FreezThese(true, element);
            uc.ucExtends.Events.deactivate.fireAsync([]);
            if (!uc.ucExtends.keepVisible) element.style.display = 'none';
        } else {
            this.event.onUnFreez(uc);
            await this.FreezThese(false, element);
            element.style.display = wnode.display;
            this.focusMng.currentElement = wnode.lastFocusedAt;
            requestAnimationFrame(() => {
                this.focusMng.focus(element);
            });
            await uc.ucExtends.Events.activate.fireAsync([]);
        }
    }

    static async FreezThese(freez: boolean, ...elements: HTMLElement[]) {
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