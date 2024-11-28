import { TabIndexManager } from "ucbuilder/global/tabIndexManager";
import { CommonEvent } from "ucbuilder/global/commonEvent";

export class FocusManager {
    currentElement: HTMLElement | undefined;

    fetch() {
        this.currentElement = undefined;
        this.currentElement = document.activeElement as HTMLElement;
        //this.currentElement.fireEvent('blur');
    }
    /**
     * 
     * @param containerElement if last focused element not insde `contaierElement` than direct focus to `containerElement`
     */
    focus(containerElement?: HTMLElement) {
        if (containerElement != undefined && !containerElement.contain(this.currentElement)) {
            if (containerElement.hasAttribute('tabindex'))
                containerElement.focus();
            else {
                TabIndexManager.moveNext(containerElement);
            }
        } else {
            this.currentElement.focus();
        }
        /*if (this.currentElement !== undefined && this.currentElement !== null && this.currentElement.isConnected) {
            this.currentElement.focus();
        }*/
    }
    // static activeEditor: HTMLInputElement;



    /*
        private static _onlyFocusOn: HTMLElement[] = [];
        public static get onlyFocusOn(): HTMLElement[] {
            return FocusManager._onlyFocusOn;
        }
        public static set onlyFocusOn(value: HTMLElement[]) {
            FocusManager._onlyFocusOn = value;
            this.init();
        }
        static onOtherElementsFocus = (e: FocusEvent) => { };
        private static hasBound = false;
        static init() {
            //if (!this.hasBound) {
            window.addEventListener('focusin', this.focusListner);
            // //   this.hasBound = true;
            //}
        }
        //private static stopIt() { window.removeEventListener('focusin', this.focusListner); this.hasBound = false; }
        static focusListner = (e: FocusEvent) => {
            if (this.onlyFocusOn.length == 0) return;
            let outFocus = true;
            let aonly = [...this.onlyFocusOn];
            for (let i = 0, len = aonly.length; i < len; i++) {
                if (aonly[i].contains(e.target as HTMLElement)) {
                    outFocus = false;
                    break;
                }
            }
            if (outFocus) {
                TabIndexManager.stopFurther(e);
                this.onOtherElementsFocus(e);
            }
        }
        */
}
export class CompoundFocus {
    focus = (e: FocusEvent) => { };
    blur = (e: FocusEvent) => { };
    allowedFocus = (e: KeyboardEvent) => { }
    allowdList: HTMLElement[] = [];
    inp: HTMLElement;
    blurEvent: FocusEvent;
    constructor(inp: HTMLElement, allowdList: HTMLElement[] = [],
        focus = (e: FocusEvent) => { },
        blur = (e: FocusEvent) => { }, allowedFocus = (e: KeyboardEvent) => { }) {
        this.inp = inp;
        this.allowdList = allowdList;
        this.focus = focus;
        this.blur = blur;
        this.allowedFocus = allowedFocus;
        let _this = this;
        inp.addEventListener('focus', (e) => {
            focus(e);
            console.log('focus');

            _this.unbind();
              inp.addEventListener('blur', _this.inpBlur);
            window.addEventListener('mousedown', _this.winFocusin);

        });
    }
    inpBlur = (e: FocusEvent) => {
        console.log('inpBlur');
        
        this.blurEvent = e;
        this.unbind();
        this.blur(e);
    }
    onDownAllowedCallback = (e: MouseEvent): boolean => { return false; };
    winFocusin = (e: MouseEvent) => {

        console.log('winFocusin');
        // console.log(this);

        let isOutFocus = true;


        if (this.inp.contains(e.target as HTMLElement))
            isOutFocus = false;
        else
            for (let i = 0, len = this.allowdList.length; i < len; i++)
                if (this.allowdList[i].contains(e.target as HTMLElement)) {
                    TabIndexManager.stopFurther(e);
                    isOutFocus = false;
                    break;
                }

        if (isOutFocus) {
            //console.log(['winFocusin',inp]);
            this.unbind();
            this.blur(this.blurEvent);
            //console.log('unbind all');
        } else {
            /*if (this.onDownAllowedCallback(e) === true) {
                TabIndexManager.stopFurther(e);
                isOutFocus = false;
            } */
             this.inp.removeEventListener('blur', this.inpBlur);
            //console.log('unbind blur');
        }
    }

    unbind() {
        this.inp.removeEventListener('blur', this.inpBlur);
        window.removeEventListener('mousedown', this.winFocusin);
    }
}
/*window.addEventListener('mousedown', (e) => {
    let htE = e.target as HTMLElement;
    // if (window.getComputedStyle(htE).cursor == 'text') {
    //     moveFromTo(document.activeElement as HTMLElement, e.target as HTMLElement);
    //    }
    
    winFocusManage.fetch();
    window.addEventListener('focus',focus);
    function focus(e: FocusEvent) {
        
        winFocusManage.focus();
        window.removeEventListener('focus', focus);
    }
});*/
/*function moveFromTo(from: HTMLElement, to: HTMLElement) {
    if(from.parentElement.contain(to))
}*/