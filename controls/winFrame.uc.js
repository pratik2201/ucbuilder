const { designer } = require('./winFrame.uc.designer.js');
const { dragUc } = require('@ucbuilder:/controls/common/draguc.js');
const { windowStates } = require('@ucbuilder:/controls/common.js');
const { controlOpt } = require('@ucbuilder:/build/common.js');
const { ResourcesUC } = require('@ucbuilder:/ResourcesUC.js');
const { winManager } = require('@ucbuilder:/controls/winFrame.uc.winManager.js');

class winFrame extends designer {

    /** @type {number} @private */
    _backgroundOpacity = 0.500;
    set backgroundOpacity(val) { this._backgroundOpacity = val > 1 ? val / 1000 : val }
    get backgroundOpacity() { return this._backgroundOpacity; }

    /** @type {HTMLElement}  */
    static transperency = "<transperencyBack></transperencyBack>".$();
    static hasInitedTransperency = false;
    /** @type {Boolean} */
    allowResize = true;

    get allowMove() { return this.drag.allowMove; }
    set allowMove(val) { this.drag.allowMove = val; }
    get allowResize() { return this.drag.allowResize; }
    set allowResize(val) { this.drag.allowResize = val; }

    designAll() {

        let titleHT = this.ucExtends.wrapperHT;

        let ctrls = [];
        for (let index = 0; index < this.ucExtends.garbageElementsHT.length; index++) {
            const node = this.ucExtends.garbageElementsHT[index];
            //if (node.nodeType == node.ELEMENT_NODE) {
            if (!node.is(titleHT)) {
                ctrls.push(node);
            }
            // }
        }
        ctrls.forEach(ctr => {
            this.container1.appendChild(ctr);
        });
        this.ucExtends.stageHT = this.container1;
        //console.log(this.container1.innerHTML);
        //console.log('designAll');
    }

    //#endregion

    constructor() {
        eval(designer.giveMeHug);

        if (!winFrame.hasInitedTransperency) {
            this.ucExtends.passElement(winFrame.transperency);
            winFrame.hasInitedTransperency = true;
        }
        this.init();
        this.parentUCExt.Events.activate.on(() => {
            this.parentElementHT.before(winFrame.transperency);            
        });

    }

    init() {

        this.initEvent();
        this.lbl_title.innerText = this.parentUCExt.wrapperHT.getAttribute("x-caption");

    }
    drag = new dragUc();
    SESSION_DATA = {
        winState: windowStates.normal,
        rect: {
            left: 0,
            top: 0,
            width: 0,
            height: 0,
        }
    }
    initEvent() {
        this.parentUCExt = this.ucExtends.PARENT.ucExtends;
        this.parentElementHT = this.parentUCExt.wrapperHT;

        this.container = ResourcesUC.contentHT;

        //this.ucExtends.._..updateLayout();
        this.designAll();

        this.drag.init(this.ucExtends.self, this.title_panel);
        this.drag.resizer.connect(this);
        this.parentUCExt.Events.captionChanged.on((nval) => {
            this.lbl_title.innerText = nval;
        });
        this.cmd_close.on('mousedown', (event) => {
            this.doCloseWindow(); 
        });
    }
    doCloseWindow() {
        console.log('window is closing...');            
        let result = this.parentUCExt.destruct();
        if (result === true) {
            winFrame.manage.pop();
        }
    }
    /**
     * @param {{
     * defaultFocusAt:HTMLElement
     * }} param0 
     */
    showDialog({ defaultFocusAt = undefined } = {}) {

        winFrame.manage.push(this.ucExtends.PARENT);

        ResourcesUC.contentHT.append(this.parentElementHT);
        //this.parentUCExt.Events.activate.fire();
        // console.log('showDialog');
        setTimeout(() => {
            if (defaultFocusAt == undefined) {
                ResourcesUC.tabMng.moveNext(this.ucExtends.self);
            } else {
                ResourcesUC.tabMng.focusTo(defaultFocusAt);
            }
        }, 0);


    }
    static manage = new winManager();
}
module.exports = winFrame;          