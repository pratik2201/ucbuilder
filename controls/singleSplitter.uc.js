const { propOpt, objectOpt } = require('@ucbuilder:/build/common.js');
const {  Rect } = require('@ucbuilder:/global/drawing/shapes.js');
const { spliterType } = require('@ucbuilder:/controls/singleSplitter.uc.enumAndMore.js');
const { designer } = require('./singleSplitter.uc.designer.js');
class singleSplitter extends designer {

    nameList = {
        offsetSize: 'offsetWidth',
        splitterText: 'splitter-width',
        grisTemeplate: 'grid-template-columns',
        point: 'x',
        size: 'width',
        dir: 'left',
        pagePoint: 'pageX',
        setByType(type) {
            switch (type) {
                case spliterType.HORIZONTAL:
                    this.offsetSize = 'offsetWidth';
                    this.splitterText = 'splitter-width';
                    this.grisTemeplate = 'grid-template-columns';
                    this.size = 'width',
                        this.point = 'x';
                        this.dir="left";
                    this.pagePoint = 'pageX';
                    break;
                case spliterType.VERTICAL:
                    this.offsetSize = 'offsetHeight';
                    this.splitterText = 'splitter-height';
                    this.grisTemeplate = 'grid-template-rows';
                    this.size = 'height',
                        this.point = 'y';
                        this.dir="top";
                    this.pagePoint = 'pageY';
                    break;

            }
        }
    }
    fillGargebase() {
        let ctrls = [];
        this.mainGrid.innerHTML = "";
        let gcHt = this.ucExtends.garbageElementsHT;
        while (gcHt.length != 0) {
            this.mainGrid.appendChild(
                this.GIB_ME_NODE(gcHt[0])
            );
        }
    }
    /**
     * @param {HTMLElement} node 
     * @returns {HTMLElement}
     */
    GIB_ME_NODE(node) {
        let nnode = this.nodeHT.cloneNode(true);
        let nview = this.viewHT.cloneNode(true);
        nnode.appendChild(nview);
        this.ucExtends.passElement(nnode);
        nview.appendChild(node);
        return nnode;
    }
    SESSION_DATA = {
        measurement: [],
        /** @type {spliterType}  */
        type: spliterType.NOT_DEFINED,
    }
    set type(val) {
        this.SESSION_DATA.type = val;
        this.nameList.setByType(val);
        setTimeout(() => { this.reCalculateMeasure(); }, 0)
    }

    constructor() {
        eval(designer.giveMeHug);


        this.allElementHT = this.mainGrid.childNodes;
        this.fillGargebase();
        this.init();
    }

    /** @type {HTMLElement[]}  */
    allElementHT = undefined;
    /** @type {HTMLElement}  */
    nodeHT = `<node></node>`.$();
    /** @type {HTMLElement}  */
    viewHT = `<view></view>`.$();
    /** @type {HTMLElement}  */
    resizerHT = `<resizer role="left"></resizer>`.$();
    /** @type {HTMLElement}  */
    static rectHT = `<resizer role="drawSelection"></resizer>`.$();

    init() {

    }
    refreshView() {
        this.mainGrid.style[this.nameList.grisTemeplate] = this.measureText;
    }
    get hasDefinedStyles() { 
        return this.mainGrid.style[this.nameList.grisTemeplate]!=""; 
    }
    get measureText() { return this.SESSION_DATA.measurement.slice(0, -1).join('px ') + 'px auto'; }
    /** @type {HTMLElement[]}  */
    resizerHTlist = [];
    reCalculateMeasure() {
        this.ucExtends.find("resizer").forEach(s => s.delete());
        let len = this.allElementHT.length;
        if (len == 0) { this.SESSION_DATA.type = spliterType.NOT_DEFINED; return; }
        this.resizerHTlist = [];
        let hasStyle = this.hasDefinedStyles;
        let offsetSize = this.nameList.offsetSize;
        let gridSize = hasStyle ? 0 : this.mainGrid[offsetSize];
        let eqSize = gridSize / len;
        if (hasStyle)
            for (let i = 0; i < len; i++)
                this.SESSION_DATA.measurement[i] = this.allElementHT[i][offsetSize];
        else
            for (let i = 0; i < len; i++)this.SESSION_DATA.measurement[i] = eqSize;        
        for (let i = 1; i < len; i++) {
            let resHt = this.ucExtends.passElement(this.resizerHT.cloneNode(true));
            resHt.setAttribute("role",this.nameList.dir);
            this.allElementHT[i].append(resHt);
            this.resizerHTlist.push(this.resizerHT);
            this.doWithIndex(resHt, i);
        }
        this.refreshView();
    }
    /**
     * @param {number} index 
     * @param {HTMLElement} resizer 
     */
    doWithIndex(resizer, index) {
        let _this = this;
        /** @type {number}  */
        let lpos = undefined;
        let measurement = _this.SESSION_DATA.measurement;
        resizer.addEventListener("mousedown", (downEvt) => {
            let htEle = this.allElementHT[index];
            _this.ucExtends.passElement(singleSplitter.rectHT);
            document.body.append(singleSplitter.rectHT);
            singleSplitter.rectHT.style.display = "block";
            lpos = downEvt[_this.nameList.pagePoint];
            let rct = new Rect();
            rct.setBy.domRect(htEle.getClientRects()[0]);
            rct.applyHT.all(singleSplitter.rectHT);
            let oval = rct.location[_this.nameList.point];
            let osz = rct.size[_this.nameList.size];
            let diff = 0;
            function mousemoveEvent(moveEvt) {
                let cpos = moveEvt[_this.nameList.pagePoint];
                diff = cpos - lpos;
                rct.location[_this.nameList.point] = oval + diff;
                rct.size[_this.nameList.size] = (osz - diff);
                rct.applyHT.all(singleSplitter.rectHT);
            }
            document.body.on("mousemove", mousemoveEvent);
            document.body.on("mouseup mouseleave", mouseupEvent);

            function mouseupEvent(moveEvt) {
                measurement[index - 1] += diff;
                measurement[index] -= diff;
                _this.refreshView();
                singleSplitter.rectHT.style.display = "none";
                document.body.off("mousemove", mousemoveEvent);
                document.body.off("mouseup mouseleave", mouseupEvent);
            }
        });
    }
    pushNode() {

    }
}

module.exports = singleSplitter;