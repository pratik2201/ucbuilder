const { objectOpt, arrayOpt, controlOpt } = require("@ucbuilder:/build/common");
const { ATTR_OF } = require("@ucbuilder:/global/runtimeOpt");
const { Rect } = require("@ucbuilder:/global/drawing/shapes");
const { boxHandler } = require("@ucbuilder:/controls/Splitter.uc.boxHandler");
const { spliterType, splitterCell } = require("@ucbuilder:/controls/Splitter.uc.enumAndMore");
const { splitersGrid } = require("@ucbuilder:/controls/Splitter.uc.splitersGrid");

class resizeHandler {
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
                case spliterType.COLUMN:
                    this.offsetSize = 'offsetWidth';
                    this.splitterText = 'splitter-width';
                    this.grisTemeplate = 'grid-template-columns';
                    this.size = 'width',
                        this.point = 'x';
                    this.dir = "left";
                    this.pagePoint = 'pageX';
                    break;
                case spliterType.ROW:
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
    /** @type {splitersGrid}  */
    get main() { return this._main; }
    get spl() { return this.main.main; }

    _main = undefined;
    /**
     *  @param {splitersGrid} main 
     */
    init(main) {
        this._main = main;

    }
    refreshView() {
        this.main.grid.style[this.nameList.grisTemeplate] = this.measureText;
    }
    get hasDefinedStyles() {
        //console.log(this.nameList.grisTemeplate);
        //console.log(this.main.grid.style[this.nameList.grisTemeplate]);
        return this.main.grid.style[this.nameList.grisTemeplate] != "";
    }

    get measureText() {

        return this.main.info.measurement.length <= 1 ?
            'auto'
            :
            (this.main.info.measurement.map(s => s.size)).slice(0, -1).join('px ') + 'px auto';
    }
    set type(val) {

        this.nameList.setByType(val);

    }
    /** @type {HTMLElement}  */
    static rectHT = `<resizer role="drawSelection"></resizer>`.$();
    get mainGrid() { return this.main.grid; }
    /** @type {HTMLElement}  */
    resizerHT = `<resizer role="left"></resizer>`.$();
    refresh() {
        let len = this.main.allElementHT.length;

        if (len == 0) {/*this.main.type = spliterType.NOT_DEFINED;*/ return; }
        let hasStyle = this.hasDefinedStyles;
        let offsetSize = this.nameList.offsetSize;
        //console.log(window.getComputedStyle(this.mainGrid).width);
        let gridSize = hasStyle ? 0 : this.mainGrid[offsetSize];
        //console.log(this.mainGrid.clientWidth);
        let eqSize = gridSize / len;
        //console.log(gridSize+';'+eqSize);
        /** @type {splitterCell}  */
        let obj = undefined;
        //
        if (hasStyle) {

            for (let i = 0; i < len; i++) {

                obj = this.main.info.measurement[i];

                /** @type {boxHandler}  */
                let box = this.main.allElementHT[i].data('box');

                box.uc.ucExtends.session.exchangeParentWith(obj.session);
                obj.ucPath = box.uc.ucExtends.fileInfo.html.rootPath;
                obj.attribList = controlOpt.xPropToAttr(box.uc.ucExtends.self);
                //obj.size = this.main.allElementHT[i][offsetSize];
            }
        } else {

            for (let i = 0; i < len; i++) {
                /** @type {boxHandler}  */
                let box = this.main.allElementHT[i].data('box');
                obj = objectOpt.clone(splitterCell);
                box.uc.ucExtends.session.exchangeParentWith(obj.session);
                obj.size = eqSize;
                obj.ucPath = box.uc.ucExtends.fileInfo.html.rootPath;
                obj.attribList = controlOpt.xPropToAttr(box.uc.ucExtends.self);
                this.main.info.measurement[i] = obj;
            }
        }
        this.giveResizer();
    }
    /** @type {HTMLElement[]}  */
    resizerHTlist = [];
    giveResizer() {
        switch (this.spl.SESSION_DATA.type) {
            case spliterType.COLUMN:if(!this.spl.allowResizeColumn){this.refreshView();return;}break;
            case spliterType.ROW:if(!this.spl.allowResizeRow){this.refreshView();return;}break;
        }
        let len = this.main.allElementHT.length;
        this.resizerHTlist.forEach(s => s.delete());
        this.resizerHTlist = [];

        for (let i = 1; i < len; i++) {
            let resHt = this.spl.ucExtends.passElement(this.resizerHT.cloneNode(true));
            resHt.setAttribute("role", this.nameList.dir);
            this.main.allElementHT[i].append(resHt);
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
        let measurement = _this.main.measurement;
        let prevSize = -1;
        let nextSize = -1;

        //console.log(resizer);
        resizer.addEventListener("mousedown", (downEvt) => {
            let htEle = _this.main.allElementHT[index];
            _this.spl.ucExtends.passElement(resizeHandler.rectHT);

            document.body.appendChild(resizeHandler.rectHT);
            let rct = new Rect();
            Object.assign(resizeHandler.rectHT.style, rct.applyHT.all());
            resizeHandler.rectHT.style.visibility = "visible";
            lpos = downEvt[_this.nameList.pagePoint];
            rct.setBy.domRect(htEle.getClientRects()[0]);
            rct.applyHT.all(resizeHandler.rectHT);
            let oval = rct.location[_this.nameList.point];
            let osz = rct.size[_this.nameList.size];
            let diff = 0;
            function mousemoveEvent(moveEvt) {
                let cpos = moveEvt[_this.nameList.pagePoint];
                diff = cpos - lpos;

                if ((prevSize + diff) <= _this.spl.minSizeValue && _this.isPrevEmpty) {
                    diff -= prevSize + diff;
                } else if ((nextSize - diff) <= _this.spl.minSizeValue && _this.isNextEmpty) {
                    diff += nextSize - diff;
                }

                rct.location[_this.nameList.point] = oval + diff;
                rct.size[_this.nameList.size] = (osz - diff);

                Object.assign(resizeHandler.rectHT.style, rct.applyHT.all());
            }
            _this.isPrevEmpty = this.main.allElementHT[index - 1].data('box').uc.length === 0;
            _this.isNextEmpty = this.main.allElementHT[index].data('box').uc.length === 0;
            prevSize = this.main.measurement[index - 1].size;
            nextSize = this.main.measurement[index].size;
            document.body.on("mousemove", mousemoveEvent);
            document.body.on("mouseup mouseleave", mouseupEvent);

            function mouseupEvent(moveEvt) {
                let prev = measurement[index - 1];
                let next = measurement[index];
                let ovl = prev.size;
                diff = (ovl + diff) <= 0 ? -ovl : diff;

                diff = (next.size - diff) <= 0 ? next.size : diff;

                prev.size += diff;
                next.size -= diff;



                _this.checkAndRemoveNode(index - 1, index);
                _this.refreshView();

                resizeHandler.rectHT.style.visibility = "collapse";
                _this.spl.ucExtends.session.onModify();
                document.body.off("mousemove", mousemoveEvent);
                document.body.off("mouseup mouseleave", mouseupEvent);
            }
        });
    }
    /**
     * @param {number} index item index to remove
     * @param {number} spaceAllocateIndex item index in which removed element's space will added
     */
    removeNode(index, spaceAllocateIndex) {
        let pmes = this.main.measurement[index];
        let nmes = this.main.measurement[spaceAllocateIndex];
        nmes.size += pmes.size;
        this.main.measurement.splice(index, 1);
        this.main.allElementHT[index].delete();
        this.refresh();
    }
    isPrevEmpty = false;
    isNextEmpty = false;
    checkAndRemoveNode(prevIndex, nextIndex) {
        let pmes = this.main.measurement[prevIndex];
        let nmes = this.main.measurement[nextIndex];
        /** @type {HTMLElement}  */
        let node = undefined;
        /** @type {boxHandler}  */
        let box = undefined;

        if (pmes.size <= this.spl.minSizeValue && this.isPrevEmpty)
            this.removeNode(prevIndex, nextIndex);
        else if (nmes.size <= this.spl.minSizeValue && this.isNextEmpty)
            this.removeNode(nextIndex, prevIndex);


    }
}
module.exports = { resizeHandler };