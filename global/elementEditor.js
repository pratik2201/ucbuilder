const { controlOpt, uniqOpt, strOpt } = require("ucbuilder/build/common");
const { keyBoard } = require("ucbuilder/global/hardware/keyboard");

class elementEditor {
    constructor() {

    }
    /** @type {HTMLElement}  */
    htEle = undefined;
    isInEditMode = false;
    ATTR = {
        lastEditedData: '______lval' + uniqOpt.guidAs_,
    }
    multiline = false;
    callbackOnSave = (changedContent, oldContent) => { }
    callbackOnReset = (oldContent) => { }
    onDemandActualValue = () => {
        return this.htEle.innerHTML;
    }
    bindEvents() {
        this.lastActiveElement = document.activeElement;
        this.htEle.setAttribute("contenteditable", "true");
        this.htEle.addEventListener('blur', this.blurEvent_listner);
        this.htEle.addEventListener('keydown', this.keydown_listner);
    }
    unbindEvents() {
        this.htEle.setAttribute("contenteditable", "false");
        this.htEle.removeEventListener('blur', this.blurEvent_listner);
        this.htEle.removeEventListener('keydown', this.keydown_listner);
        if (this.lastActiveElement != undefined) this.lastActiveElement.focus();
    }
    /** @param {HTMLElement} htEle */
    editRow(htEle = undefined, callbackOnSave =
        /** @param {string} changedContent @param {string} oldContent */
        (changedContent, oldContent) => { }, callbackOnReset =
            /** @param {string} oldContent */
            (oldContent) => { }, multiline = false) {

        this.multiline = multiline;

        this.callbackOnSave = callbackOnSave;
        this.callbackOnReset = callbackOnReset;

        this.htEle = htEle;
        this.bindEvents();

        let val = this.onDemandActualValue();
        this.htEle.data(this.ATTR.lastEditedData, val);
        this.isInEditMode = true;
        this.htEle.innerHTML = val;
        this.htEle.focus();
        //debugger;
        controlOpt.selectAllText(this.htEle);
       
    }





    /** @param {FocusEvent} event */
    blurEvent_listner = (event) => {
        if (this.isInEditMode) {
            console.log('blurEvent_listner');
            this.saveRow();
            //this.focusMng.focus();
            event.preventDefault();
        }
    }
    /**
     * @param {KeyboardEvent} event 
     * @returns 
     */
    keydown_listner = (event) => {
        switch (event.keyCode) {
            case keyBoard.keys.escape:
                this.reset();
                event.preventDefault();
                break;
            case keyBoard.keys.up:
            case keyBoard.keys.down:
                if (!this.multiline) {
                    this.reset();
                    event.preventDefault();
                }
                break;
            case keyBoard.keys.enter:
                if (this.isInEditMode) {
                    if (this.multiline && event.shiftKey) {
                        event.stopPropagation();
                        return;
                    }
                    this.saveRow();
                    event.preventDefault();
                }
                break;
        }
    }
    reset() {
        let oldContent = this.htEle.data(this.ATTR.lastEditedData);
        this.callbackOnReset(oldContent);
        this.unbindEvents();
        this.htEle.innerHTML = oldContent;

    }

    saveRow() {
        if (this.isInEditMode) {
            let cntnt = this.htEle.innerText.trim_("\n");
            let newContent = strOpt.replaceAll(cntnt,"\n","<br>");
            let oldContent = this.htEle.data(this.ATTR.lastEditedData);
            this.callbackOnSave(newContent, oldContent);
            this.unbindEvents();
        }
        this.isInEditMode = false;
    }

}
module.exports = { elementEditor }