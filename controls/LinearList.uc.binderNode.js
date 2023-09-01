
const { commonEvent } = require("@ucbuilder:/global/commonEvent");
const { Rect } = require("@ucbuilder:/global/drawing/shapes");
const { TempleteNode } = require("@ucbuilder:/Template");
const LinearList = require("@ucbuilder:/controls/LinearList.uc");
const { positionar } = require("@ucbuilder:/controls/LinearList.uc.positionar");
const { keyBoard } = require("@ucbuilder:/global/hardware/keyboard");

class binderNode {
    constructor() {

    }
    /**
     * 
     * @param {number} index 
     * @param {MouseEvent} evt 
     */
    itemMouseUp_listner = (index, evt) => {
        this.selectedIndex = index;
        this.hide();
        this.dontOpen = true;
        this.boundElement.focus();
        this.dontOpen = false;
        evt.stopImmediatePropagation();

    }
    /**
     * @param {{
     *  elementHT :HTMLElement,
     *  bindUpDownKeys :boolean,
     *  bindFocusEvents :boolean
     * }} param0 
     */
    bindInputBox = ({
        elementHT = undefined,
        bindUpDownKeys = true,
        bindFocusEvents = true,
    } = {}) => {
        this.boundElement = elementHT;
        if (bindUpDownKeys) {
            this.Events.onShow.on(() => {
                elementHT.addEventListener("keydown", this.main.lv_items.lvUI.keydown_listner);
                this.main.lv_items.Events.itemMouseUp.on(this.itemMouseUp_listner);
                elementHT.addEventListener("keyup", this.keyup_listner);

            });
            this.Events.onHide.on(() => {
                elementHT.removeEventListener("keydown", this.main.lv_items.lvUI.keydown_listner);
                this.main.lv_items.Events.itemMouseUp.off(this.itemMouseUp_listner);
                elementHT.removeEventListener("keyup", this.keyup_listner);
            });
        }
        if (bindFocusEvents) {
            elementHT.addEventListener("focusin", (e) => {
                let txtboxRect = new Rect();
                txtboxRect.setBy.domRect(e.target.getClientRects()[0]);
                this.showAt(txtboxRect);
            });
            elementHT.addEventListener("mousedown", (e) => {
                if (!document.activeElement.is(e.target) || this.hasBound) return;
                let txtboxRect = new Rect();
                txtboxRect.setBy.domRect(e.target.getClientRects()[0]);
                this.showAt(txtboxRect);
            });
        }

        elementHT.addEventListener("blur", (e) => {
            setTimeout(() => {
                this.mousedown_focus_listner(e);
            }, 0);
        });
    }
    /** @private */
    _selectedIndex = -1;
    get selectedRecord() { return this.filteredSource[this._selectedIndex]; };
    get selectedItem() { return this.main.lv_items.Records.itemAt(this._selectedIndex); }
    get selectedIndex() { return this._selectedIndex; }
    set selectedIndex(val) {
        //  if (this.hasBound) {
        /** @type {HTMLElement}  */
        let node = undefined;
        if (val >= 0 && val <= this.filteredSource.length) {
            let oIndex = this.selectedIndex;
            node = this.selectedItem;
            if (node != undefined)
                node.setAttribute('is-selected', '0');
            this._selectedIndex = val;
            node = this.selectedItem;
            if (node != undefined)
                node.setAttribute('is-selected', '1');
            this.Events.selectedIndexChange.fire(val, oIndex);
        }
        // }
    }
    /** @type {TempleteNode}  */
    template = undefined;
    
    _source = [];
    filteredSource = [];
    set source(val) {
        this._source = val;
        this.filteredSource = [];
        this.filteredSource = [...val];
    }
    /** @type {LinearList}  */
    main = undefined;
    /** @type {positionar}  */
    position = undefined;
    /** @param {LinearList} main */
    init(main) {
        this.main = main;

        this.position = new positionar();
        this.position.init(this.main.ucExtends.self);
    }
    Events = {
        /**
         * @type {{on:(callback = (
         *          newindex:number,
         *          oldIndex:number,
         * ) =>{})} & commonEvent}
         */
        selectedIndexChange: new commonEvent(),
        /**
         * @type {{on:(callback = (
         * ) =>{})} & commonEvent}
         */
        onShow: new commonEvent(),
        /**
         * @type {{on:(callback = (
         * ) =>{})} & commonEvent}
         */
        onHide: new commonEvent(),
        /** @param {HTMLElement} target  @returns */
        isOutOfTarget: (target) => { return true; },
    };
    /** @type {HTMLElement[]}  */
    allowedElementList = [];
    /** @param {HTMLElement} tar */
    isOutOfTarget(tar) {
        /* console.log(this.main.ucExtends.self.contains(tar)+'||'
             +(this.allowedElementList.findIndex(s => s.is(tar))!=-1)+'||'
             +this.Events.isOutOfTarget(tar)+'  =  '
 
             + !(
                 this.main.ucExtends.self.contains(tar)
              || this.allowedElementList.findIndex(s => s.is(tar))==-1
              || this.Events.isOutOfTarget(tar))
             );*/

        return (!this.main.ucExtends.self.contains(tar)
            && this.allowedElementList.findIndex(s => s.is(tar)) == -1
            && this.Events.isOutOfTarget(tar));
    }
    /**  @param {MouseEvent|FocusEvent} e  */
    mousedown_focus_listner = (e) => {

        if (this.isOutOfTarget(document.activeElement)) this.hide();
    }
    /** @param {KeyboardEvent} evt */
    keyup_listner = (evt) => {
        switch (evt.keyCode) {
            case keyBoard.keys.enter:
                this.selectedIndex = this.main.lv_items.lvUI.currentIndex;
                this.hide();
                evt.preventDefault();
                break;
        }
        //this.selectedIndex = index;
        //this.hide();
    }
    hasBound = false;
    get direction() { return this.position.direction; }
    set direction(val) { this.position.direction = val; }
    dontOpen = false;
    /** @param {Rect} txtboxRect */
    showAt(txtboxRect) {

        //this.main.ucExtends.self.hidden = false;
        this.main.lv_items.template = this.template;
        this.main.source.rows = this.filteredSource;
        this.main.lv_items.Records.fillAll();
        this.main.lv_items.lvUI.currentIndex = this.main.lv_items.lvUI.currentIndex;
        //this.main.lv_items.lvUI.currentIndex = 0;
        //window.addEventListener("mousedown", this.mousedown_focus_listner);
        //window.addEventListener("focusin", this.mousedown_focus_listner);
        //this.main.lv_items.listvw1.addEventListener('keyup', this.keyup_listner);
        this.hasBound = true;
        this.selectedIndex = this.selectedIndex;
        this.Events.onShow.fire();
        this.position.show(txtboxRect);


        /*let styles = {
            'left': `${txtboxRect.left}px`,
            'top': `${txtboxRect.top}px`,
            'width': `${txtboxRect.width}px`,
            'height': `${txtboxRect.height}px`,
            'visibility': 'visible',
        };

        let bodyRect = new Rect();
        bodyRect.initByDOMRect(document.body.getClientRects()[0]);

        let dockRect = new Rect();
        dockRect.initByDOMRect(this.main.ucExtends.self.getClientRects()[0]);
        let tbFlowDetail = txtboxRect.getOverFlowDetail(bodyRect);
        switch (this.direction) {
            case 'bottom': dockRect.location.initPointByVal(txtboxRect.left, txtboxRect.bottom); break;
            case 'right':
                console.log(tbFlowDetail);
                dockRect.location.initPointByVal(txtboxRect.right, txtboxRect.top);
                break;
            case 'left': dockRect.location.initPointByVal(txtboxRect.left - dockRect.width, txtboxRect.top); break;
            case 'top': dockRect.location.initPointByVal(txtboxRect.left, txtboxRect.top - dockRect.height); break;
        }
        //dockRect.location.initPointByVal(txtboxRect.left,txtboxRect.top);

        let overFlowDetail = dockRect.getOverFlowDetail(bodyRect);
        document.body.appendChild(this.main.ucExtends.self);
        switch (this.direction) {
            case 'bottom':
                styles.top = (txtboxRect.bottom) + "px";

                break;
            case 'right':
                styles.left = (txtboxRect.right) + "px";
                break;
        }
        console.log(overFlowDetail.right);
        if (overFlowDetail.bottom > 0)
            delete styles.height;
        else
            styles.height = overFlowDetail.bottomSize + "px";
        if (overFlowDetail.right > 0)
            delete styles.width;
        else
            styles.width = overFlowDetail.rightSize + "px";
        Object.assign(this.main.ucExtends.self.style, styles);
        */

    }
    verticalMinHeight = 15;
    horizontalMinHeight = 15;
    hide() {
        this.hasBound = false;
        this.Events.onHide.fire();
        //setTimeout(() => {
        Object.assign(this.main.ucExtends.self.style, {
            'visibility': 'collapse',
        });

        // }, 1);

    }

}
module.exports = { binderNode };