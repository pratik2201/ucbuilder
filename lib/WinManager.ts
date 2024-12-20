import { controlOpt } from 'ucbuilder/build/common';
import { uniqOpt } from "ucbuilder/enumAndMore";
import { FocusManager } from 'ucbuilder/lib/focusManage';
import { Usercontrol } from 'ucbuilder/Usercontrol';

interface WinNode {
    uc?: Usercontrol,
    display?: string,
    lastFocusedAt?: HTMLElement
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
            this.setfreez(true, _this.CURRENT_WIN, doStyleDisplay);
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
                this.setfreez(false, this.CURRENT_WIN,res);

                return;
            }
        }
        //this.transperency.remove();
        this.CURRENT_WIN = undefined;
    }

    static ATTR = {
        DISABLE: {
            NEW_VALUE: "disnval" + uniqOpt.randomNo(),
            OLD_VALUE: "disoval" + uniqOpt.randomNo(),
        },
        INERT: {
            NEW_VALUE: "inrtnval" + uniqOpt.randomNo(),
            OLD_VALUE: "inrtoval" + uniqOpt.randomNo(),
        }
    }

    static setfreez = (freez: boolean, wnode: WinNode, handeledDisplay: boolean): void => {
        let element = wnode.uc.ucExtends.wrapperHT;
        if (freez) {
            this.focusMng.fetch();
            wnode.lastFocusedAt = this.focusMng.currentElement;
            wnode.display = element.style.display;
            let inertAttr = element.getAttribute("inert");
            if (inertAttr != null) element.data(WinManager.ATTR.INERT.OLD_VALUE, inertAttr);
            element.setAttribute('inert', 'true');
            if (!handeledDisplay && !wnode.uc.ucExtends.keepVisible) element.style.display = 'none';
        } else {
            element.setAttribute('active', '1');

            let inertAttr = element.data(WinManager.ATTR.INERT.OLD_VALUE);
            if (inertAttr != undefined) element.setAttribute('inert', inertAttr);
            else element.removeAttribute('inert');

            if (!handeledDisplay) element.style.display = wnode.display;
            this.focusMng.currentElement = wnode.lastFocusedAt;
            this.focusMng.focus(element);
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