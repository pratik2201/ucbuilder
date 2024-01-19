"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FocusManager = void 0;
class FocusManager {
    fetch() {
        this.currentElement = undefined;
        this.currentElement = document.activeElement;
        //this.currentElement.fireEvent('blur');
    }
    focus() {
        if (this.currentElement !== undefined && this.currentElement !== null && this.currentElement.isConnected) {
            this.currentElement.focus();
        }
    }
}
exports.FocusManager = FocusManager;
