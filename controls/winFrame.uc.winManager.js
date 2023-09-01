const { Usercontrol } = require('@ucbuilder:/Usercontrol.js');
class winManager {

    curIndex = 0;
    /** @type {Usercontrol}  */
    CURRENT_WIN = undefined;
    /** @type {Usercontrol[]}  */
    pages = [];

    /** @param {Usercontrol} form */
    push = (form) => {
        let _this = this;
        if (_this.CURRENT_WIN != undefined) {
            _this.CURRENT_WIN.ucExtends.designer.setfreez(true);
        }
        _this.CURRENT_WIN = form;
        _this.pages.push(_this.CURRENT_WIN);
        _this.curIndex = _this.pages.length - 1;
    }

    pop = () => {
        this.curIndex--;
        if (this.curIndex >= 0) {
            this.pages.pop();
            this.curIndex = this.pages.length - 1;
            this.CURRENT_WIN = this.pages[this.curIndex];
            if (this.CURRENT_WIN != undefined) {
                this.CURRENT_WIN.ucExtends.designer.setfreez(false);
            }

        }
    }
}
module.exports = { winManager };          