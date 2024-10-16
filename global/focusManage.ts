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
        if (!containerElement.contain(this.currentElement)) {
            if (containerElement.hasAttribute('tabindex'))
                containerElement.focus();
            else {
                ResourcesUC.tabMng.moveNext(containerElement);
            }
        } else {
            this.currentElement.focus();
        }
        /*if (this.currentElement !== undefined && this.currentElement !== null && this.currentElement.isConnected) {
            this.currentElement.focus();
        }*/
    }
}

