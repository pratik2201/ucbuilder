const { Rect } = require("ucbuilder/src/global/drawing/shapes");

/**
 * @typedef {import ("ucbuilder/Usercontrol").Usercontrol} Usercontrol
 */
const splitterCell = {
    /** @type {number}  */
    size: undefined,
    ucPath: "",
    attribList: "",
    /** @type {{}}  */
    session: {},
};
/** @type {"undefined"|"columns"|"rows"}  */
const splitterType = 'undefined';
class splitHandler {
    nameList = {
        offsetSize: 'offsetWidth',
        splitterText: 'splitter-width',
        grisTemeplate: 'grid-template-columns',
        point: 'x',
        size: 'width',
        dir: 'left',
        pagePoint: 'pageX',
        /**  @param {splitterType} type */
        setByType(type) {
            switch (type) {
                case 'columns':
                    this.offsetSize = 'offsetWidth';
                    this.splitterText = 'splitter-width';
                    this.grisTemeplate = 'grid-template-columns';
                    this.size = 'width',
                        this.point = 'x';
                    this.dir = "left";
                    this.pagePoint = 'pageX';
                    break;
                case 'rows':
                    this.offsetSize = 'offsetHeight';
                    this.splitterText = 'splitter-height';
                    this.grisTemeplate = 'grid-template-rows';
                    this.size = 'height',
                        this.point = 'y';
                    this.dir = "top";
                    this.pagePoint = 'pageY';
                    break;

            }
        }
    }
    constructor() {

    }
    gapSize = 0;
    minSizeValue = 20;
    /** @type {Usercontrol}  */
    uc = undefined;
    /** @type {HTMLElement}  */
    resizerHT = `<resizer role="left"></resizer>`.$();
    /** @type {HTMLElement}  */
    static rectHT = `<resizer role="drawSelection"></resizer>`.$();
    /** @type {splitterCell[]}  */
    measurement = [];
    /** @type {HTMLElement}  */
    container = undefined;
    /** @type {HTMLElement}  */
    grid = undefined;
    init(container, grid) {
        this.container = container;
        this.grid = grid;
        this.initChilds();
    }
    initChilds() {
        this.giveResizer();
    }
    /** @type {splitterType}  */
    spliterType = 'undefined';

    refreshView() {
        this.grid.style[this.nameList.grisTemeplate] = this.measureText;
    }
    get measureText() {

        return this.measurement.length <= 1 ?
            'auto'
            :
            (this.measurement.map(s => s.size)).slice(0, -1).join('px ') + 'px auto';
    }
    /** @type {HTMLElement[]}  */
    get allElementHT() { return this.grid.children; }
    /** @type {HTMLElement[]}  */
    resizerHTlist = [];
    giveResizer() {
        /*switch (this.spliterType) {
            case 'columns': this.refreshView(); return;
            case 'rows': this.refreshView(); return;
        }*/
        let len = this.allElementHT.length;
        this.resizerHTlist.forEach(s => s.delete());
        this.resizerHTlist = [];

        for (let i = 1; i < len; i++) {
            let resHt = this.uc.ucExtends.passElement(this.resizerHT.cloneNode(true));
            resHt.setAttribute("role", this.nameList.dir);
            this.allElementHT[i].append(resHt);
            this.resizerHTlist.push(this.resizerHT);
            this.doWithIndex(resHt, i);
        }
        this.refreshView();
    }
    isPrevEmpty = false;
    isNextEmpty = false;
    /**
     * @param {number} index 
     * @param {HTMLElement} resizer 
     */
    doWithIndex(resizer, index) {
        let _this = this;
        /** @type {number}  */
        let lpos = undefined;
        let measurement = _this.measurement;
        let prevSize = -1;
        let nextSize = -1;

        //console.log(resizer);
        resizer.addEventListener("mousedown", (downEvt) => {
            let htEle = _this.main.allElementHT[index];
            _this.uc.ucExtends.passElement(splitHandler.rectHT);
            document.body.appendChild(splitHandler.rectHT);
            let rct = new Rect();
            Object.assign(splitHandler.rectHT.style, rct.applyHT.all());
            splitHandler.rectHT.style.visibility = "visible";
            lpos = downEvt[_this.nameList.pagePoint];
            rct.setBy.domRect(htEle.getClientRects()[0]);
            rct.applyHT.all(splitHandler.rectHT);
            let oval = rct.location[_this.nameList.point];
            let osz = rct.size[_this.nameList.size];
            let diff = 0;
            function mousemoveEvent(moveEvt) {
                let cpos = moveEvt[_this.nameList.pagePoint];
                diff = cpos - lpos;

                if ((prevSize + diff) <= _this.minSizeValue && _this.isPrevEmpty) {
                    diff -= prevSize + diff;
                } else if ((nextSize - diff) <= _this.minSizeValue && _this.isNextEmpty) {
                    diff += nextSize - diff;
                }

                rct.location[_this.nameList.point] = oval + diff;
                rct.size[_this.nameList.size] = (osz - diff);

                Object.assign(splitHandler.rectHT.style, rct.applyHT.all());
            }
            _this.isPrevEmpty = this.allElementHT[index - 1].data('box').uc.length === 0;
            _this.isNextEmpty = this.allElementHT[index].data('box').uc.length === 0;
            prevSize = this.measurement[index - 1].size;
            nextSize = this.measurement[index].size;
            document.body.on("mousemove", mousemoveEvent);
            document.body.on("mouseup mouseleave", mouseupEvent);

            function mouseupEvent(moveEvt) {
                let prev = measurement[index - 1];
                let next = measurement[index];
                let ovl = prev.size;
                //console.log(prev.size + ' | ' + diff + ' | ' + next.size);
                diff = (ovl + diff) <= 0 ? -ovl : diff;
                diff = (next.size - diff) <= 0 ? next.size : diff;
                //console.log(measurement);
                prev.size += diff;
                //next.size -= diff;
                next.size = rct.size[_this.nameList.size];
                //console.log("AFTER : "+prev.size+' : '+next.size);

                _this.checkAndRemoveNode(index - 1, index);
                _this.refreshView();

                splitHandler.rectHT.style.visibility = "collapse";
                
                _this.uc.ucExtends.session.onModify();
                document.body.off("mousemove", mousemoveEvent);
                document.body.off("mouseup mouseleave", mouseupEvent);
            }
        });
    }
}
module.exports = { splitHandler };