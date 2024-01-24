
export class FocusManager {
    currentElement: HTMLElement | undefined;

    fetch() {
        this.currentElement = undefined;
        this.currentElement = document.activeElement as HTMLElement;
        //this.currentElement.fireEvent('blur');
    }

    focus() {
        if (this.currentElement !== undefined && this.currentElement !== null && this.currentElement.isConnected) {
            this.currentElement.focus();
        }
    }
}

