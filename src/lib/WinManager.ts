import { CommonEvent } from "../global/commonEvent.js";
import { GetUniqueId } from "../ipc/enumAndMore.js";
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
export class WinManager {
    //mainNode: HTMLElement;
    static curIndex: number = 0;
    static CURRENT_WIN: WinNode;
    static pages: WinNode[] = [];
    static focusMng: FocusManager = new FocusManager();

    static push = (form: Usercontrol): void => {
        let _this = this;
        let cWin = _this.CURRENT_WIN;
        let doStyleDisplay = form.ucExtends.Events.beforeUnFreez.fire([_this.CURRENT_WIN?.uc]);
        if (_this.CURRENT_WIN != undefined) {
            this.setfreez(true, _this.CURRENT_WIN/*, doStyleDisplay*/);
        } else _this.CURRENT_WIN = {
            uc: undefined,
            lastFocusedAt: undefined
        };
        _this.CURRENT_WIN = {};
        _this.CURRENT_WIN.uc = form;
        _this.pages.push(_this.CURRENT_WIN);

        _this.curIndex = _this.pages.length - 1;
    }

    static pop = (): void => {
        this.curIndex = this.pages.length - 1;
        // 
        if (this.curIndex >= 0) {
            this.pages.pop();
            this.curIndex--;
            this.CURRENT_WIN = this.pages[this.curIndex];
            if (this.CURRENT_WIN != undefined) {
                let _wrapperHT = this.CURRENT_WIN.uc.ucExtends.self;
                let res = this.CURRENT_WIN.uc.ucExtends.Events.beforeUnFreez.fire([undefined]);
                this.setfreez(false, this.CURRENT_WIN/*, res*/);

                return;
            }
        }
        //this.transperency.remove();
        this.CURRENT_WIN = undefined;
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
    static Event = {
        onFreez: (uc: Usercontrol) => {

        },
        onUnFreez: (uc: Usercontrol) => {

        }
    }
    static setfreez = (freez: boolean, wnode: WinNode/*, handeledDisplay: boolean*/): void => {
        let element = wnode.uc.ucExtends.wrapperHT;

        if (freez) {
            this.Event.onFreez(wnode.uc);
            this.focusMng.fetch(wnode.uc.ucExtends.lastFocuedElement);
            wnode.lastFocusedAt = this.focusMng.currentElement;
            wnode.display = element.style.display;
            this.FreezThese(freez, element);
            if (!wnode.uc.ucExtends.keepVisible) element.style.display = 'none';
        } else {
            this.Event.onUnFreez(wnode.uc);
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
