
const { messageBoxResult, buttonTypes } = require('@ucbuilder:/controls/messageBox.uc.enumAndMore.js');
const { keyBoard } = require('@ucbuilder:/global/hardware/keyboard.js');
const { intenseGenerator } = require('@ucbuilder:/intenseGenerator.js');
const { designer } = require('./messageBox.uc.designer.js');
class messageBox extends designer {

    /**
     * @param {string} message 
     * @param {(result:messageBoxResult)=>{}} result 
     * @param {{
     *  title:string,
     *  detail:string,
     *  buttonType: buttonTypes,
     *  defaultFocus : messageBoxResult,
     * }} param2
     */
    static Show(
        message = "",
        result = (res) => { },
        {
            title = undefined,
            detail = "",
            buttonType = 'Ok',
            defaultFocus = 'ok',
        } = {}) {
        /** @type {messageBox}  */
        let uc = intenseGenerator.generateUC('@ucbuilder:/controls/messageBox.uc',
            {}, arguments[2]);
        uc.resultCallback = result,
            uc.lbl_message.innerHTML = message;
        if (title == undefined) {
            switch (buttonType) {
                case 'Ok': uc.ucExtends.caption = 'Message'; break;
                case 'OkCancel': uc.ucExtends.caption = 'Message'; break;
                case 'YesNo': uc.ucExtends.caption = 'Confirm'; break;
                case 'RetryCancel': uc.ucExtends.caption = 'Retry'; break;
                case 'YesNoCancel': uc.ucExtends.caption = 'Confirm'; break;
                case 'AbortRetryIgnore': uc.ucExtends.caption = 'Choose'; break;
            }
        } else {
            uc.ucExtends.caption = title;
        }
        
        let eleToFocus = undefined;
        let ele = uc.ucExtends.find(`[role="${defaultFocus}"]`);
        if (ele.length == 1) eleToFocus = ele[0];
        uc.winframe1.showDialog({
            defaultFocusAt: eleToFocus
        });
    }
    /** @param {messageBoxResult} res */
    resultCallback = (res) => { }
    /** @type {messageBoxResult}  */
    result = "none";
    /** @private @param {messageBoxResult} res */
    finalResult = (res) => {
        this.result = res;
        this.ucExtends.destruct();
    }


    /**
     * @param {{
     *  title:string,
     *  detail:string,
     *  buttonType: buttonTypes,
     * }} 
     */
    constructor({
        title = "",
        detail = "",
        buttonType = 'Ok',
    } = {}) {
        eval(designer.giveMeHug);

        this.lbl_messagedetail.innerHTML = detail;
        this.initByButtonType(buttonType);


        this.ucExtends.Events.beforeClose.on(() => {
            this.resultCallback(this.result);
        });

        this.buttonList.addEventListener("mouseup", (e) => {
            this.fire(document.activeElement.stamp());
        });

        this.buttonList.addEventListener('keyup', (e) => {
            switch (e.keyCode) {
                case keyBoard.keys.enter:
                    this.fire(document.activeElement.stamp());
                    break;
                case keyBoard.keys.y: this.fire(this.cmd_yes.stamp()); break;
                case keyBoard.keys.n: this.fire(this.cmd_no.stamp()); break;
                case keyBoard.keys.o: this.fire(this.cmd_ok.stamp()); break;
                case keyBoard.keys.c: this.fire(this.cmd_cancel.stamp()); break;
                case keyBoard.keys.a: this.fire(this.cmd_abort.stamp()); break;
                case keyBoard.keys.r: this.fire(this.cmd_retry.stamp()); break;
                case keyBoard.keys.i: this.fire(this.cmd_ignore.stamp()); break;
            }
        })
        /*this.ucExtends.Events.loaded.on(() => {
            //setTimeout(() => {
                let ele = this.ucExtends.find(`[role="${defaultFocus}"]`);
                if (ele.length == 1) ele[0].focus();
           //  },1000);
        });*/
    }
    fire(stmp) {
        switch (stmp) {
            case this.cmd_ok.stamp(): this.finalResult('ok'); break;
            case this.cmd_cancel.stamp(): this.finalResult('cancel'); break;
            case this.cmd_no.stamp(): this.finalResult('no'); break;
            case this.cmd_yes.stamp(): this.finalResult('yes'); break;
            case this.cmd_abort.stamp(): this.finalResult('abort'); break;
            case this.cmd_retry.stamp(): this.finalResult('retry'); break;
            case this.cmd_ignore.stamp(): this.finalResult('ignore'); break;
        }
    }
    /** @param {buttonTypes} type */
    initByButtonType(type) {
        switch (type) {
            case 'Ok':
                this.cmd_ok.style.display = 'inline-block';
                break;
            case 'OkCancel':
                this.cmd_ok.style.display =
                    this.cmd_cancel.style.display = 'inline-block';
                break;
            case 'AbortRetryIgnore':
                this.cmd_abort.style.display =
                    this.cmd_retry.style.display =
                    this.cmd_ignore.style.display = 'inline-block';
                break;
            case 'RetryCancel':
                this.cmd_retry.style.display =
                    this.cmd_cancel.style.display = 'inline-block';
                break;
            case 'YesNo':
                this.cmd_yes.style.display =
                    this.cmd_no.style.display = 'inline-block';
                break;

            case 'YesNoCancel':
                this.cmd_yes.style.display =
                    this.cmd_no.style.display =
                    this.cmd_cancel.style.display = 'inline-block';
                break;
        }
    }
}
module.exports = messageBox;