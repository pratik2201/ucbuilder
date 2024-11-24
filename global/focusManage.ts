import { TabIndexManager } from "ucbuilder/global/tabIndexManager";

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


    private static _onlyFocusOn: HTMLElement = undefined;
    public static get onlyFocusOn(): HTMLElement {
        return FocusManager._onlyFocusOn;
    }
    public static set onlyFocusOn(value: HTMLElement) {
        FocusManager._onlyFocusOn = value;
        this.init();
    }
    static allowdInOnly: HTMLElement[] = [];
    private static hasBound = false;
    static init() {
        if (!this.hasBound) {
            window.addEventListener('focusin', this.focusListner);
            this.hasBound = true;
        }
    }
    private static stopIt() { window.removeEventListener('focusin', this.focusListner); this.hasBound = false; }
    static focusListner = (e: FocusEvent) => {
        if (this.onlyFocusOn != undefined && this.onlyFocusOn.isConnected) {
            if (this.allowdInOnly.length > 0) {
                let aonly = this.allowdInOnly;
                for (let i = 0, len = aonly.length; i < len; i++) {
                    if (aonly[i].contains(e.target as HTMLElement)) {
                        this.onlyFocusOn.focus();
                        e.preventDefault();
                        break;
                    }
                }
            } else {
                e.stopImmediatePropagation();
                this.onlyFocusOn.focus();
                //}, this.parentUC);
            }
        } else {
            this.stopIt(); return;
        }
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