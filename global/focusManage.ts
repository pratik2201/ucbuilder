import { ResourcesUC } from "ucbuilder/ResourcesUC";

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
        if (containerElement!=undefined && !containerElement.contain(this.currentElement)) {
            if (containerElement.hasAttribute('tabindex'))
                containerElement.focus();
            else {
                ResourcesUC.tabMng.keymoveNext(containerElement);
            }
        } else {
            this.currentElement.focus();
        }
        /*if (this.currentElement !== undefined && this.currentElement !== null && this.currentElement.isConnected) {
            this.currentElement.focus();
        }*/
    }
   // static activeEditor: HTMLInputElement;
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