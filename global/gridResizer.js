const { Rect } = require("@ucbuilder:/global/drawing/shapes");
const { newObjectOpt } = require("@ucbuilder:/global/objectOpt");
const { Usercontrol } = require("@ucbuilder:/Usercontrol");

const measurementRow = {
    /** @type {number}  */
    size: undefined,
    data: {}
};
const gridResizerInitOptions = {
    /** @type {HTMLElement}  */
    grid: undefined,
    /** @type {HTMLElement}  */
    container: undefined,
    /** @type {Usercontrol}  */
    uc: undefined,
    nodeName: "",
}
class bounderies {
    /**
     * @typedef {{ bindCallback:(e:MouseEvent)=>{},unbindCallback:(e:MouseEvent)=>{}}} boundryArgs
     * @type {boundryArgs[]}
     */
    static source = [];
    /**
     * @param {HTMLElement} eleHT
     * @param {(e:MouseEvent)=>{}} bindCallback 
     * @param {(e:MouseEvent)=>{}} unbindCallback 
     */
    static push(eleHT, bindCallback, unbindCallback) {        
        eleHT.addEventListener("mouseenter", (e) => {        
            this.unbind(this.source[this.source.length - 1]);
            this.source.push({
                bindCallback: bindCallback,
                unbindCallback: unbindCallback
            });
            this.bind(this.source[this.source.length - 1]);
        });
        
        eleHT.addEventListener("mouseleave", (e) => {
            let lval = this.source.pop();
            this.unbind(lval);
            this.bind(this.source[this.source.length - 1]);
        });

    }

    /**
     * 
     * @param {boundryArgs} row 
     */
    static unbind(row){
        if(row!=undefined){
            row.unbindCallback();
        }
    }
    /**
     * 
     * @param {boundryArgs} row 
     */
     static bind(row){
        if(row!=undefined){
            row.bindCallback();
        }
    }
}
class gridResizer {
    nameList = {
        offsetSize: 'offsetWidth',
        splitterText: 'splitter-width',
        templeteOf: 'grid-template-columns',
        point: 'x',
        size: 'width',
        dir: 'left',
        pagePoint: 'pageX',
        _OPPOSITE: {
            scrollPoint: "scrollTop",
            scrollSize: "scrollBarHeight",
        },
        /** @param {spliterType} type */
        setByType: (type) => {
            let _this = this.nameList;
            switch (type) {
                case 'grid-template-columns':
                    _this.offsetSize = 'offsetWidth';
                    _this.splitterText = 'splitter-width';
                    _this.templeteOf = type;
                    _this.size = 'width';
                    _this.point = 'x';
                    _this.dir = "left";
                    _this.pagePoint = 'pageX';
                    _this._OPPOSITE = {
                        scrollPoint: "scrollTop",
                        scrollSize: "scrollBarHeight",
                    };
                    break;
                case 'grid-template-rows':
                    _this.offsetSize = 'offsetHeight';
                    _this.splitterText = 'splitter-height';
                    _this.templeteOf = type;
                    _this.size = 'height',
                        _this.point = 'y';
                    _this.dir = "top";
                    _this.pagePoint = 'pageY';
                    _this._OPPOSITE = {
                        scrollPoint: "scrollLeft",
                        scrollSize: "scrollBarWidth",
                    };
                    break;
            }
        }
    }
    constructor() {
    }
    /** @type {HTMLElement[]}  */
    static boundContainers = [];
    /** @type {gridResizerInitOptions}  */
    options = undefined;
    /** @param {gridResizerInitOptions} options */
    init(options) {
        this.options = newObjectOpt.copyProps(options, gridResizerInitOptions);
        //bounderies.push(this.options.container,this.bindContainer,this.unbindContainer);
      
        /*this.options.container.addEventListener("mouseleave", (e) => {
            this.unbindContainer();
        });*/
    }
    bindContainer = (e)=> {
        console.log('bindContainer');
        console.log(this.options.container);
        this.options.uc.ucExtends.passElement(gridResizer.drawSelectionHT);
        //gridResizer.drawSelectionHT.style.visibility = 'visible';
        this.options.container.appendChild(gridResizer.drawSelectionHT);
        this.dgvDomRect.setBy.HTMLEle(this.options.container);
        this.options.container.addEventListener("mouseover", this.mouseoverlistner);
        this.options.container.addEventListener("scroll", this.refreshScrollbar);
    }
    unbindContainer = (e)=>{
        console.log('unbindContainer');
        console.log(this.options.container);
        //gridResizer.drawSelectionHT.style.visibility = 'collapse';
        this.options.container.removeEventListener("mouseover", this.mouseoverlistner);
        this.options.container.removeEventListener("scroll", this.refreshScrollbar);
    }

    /** @type {Rect}  */
    dgvDomRect = new Rect();
    /** @type {HTMLElement}  */
    lastOverCell = undefined;

    /** @param {Event} e  */
    refreshScrollbar = (e) => {
        /*let scrollBarWidth = this.scrollBarWidth;
        this.main.header.style.marginRight =
            this.main.footer.style.marginRight = scrollBarWidth + "px";
        this.main.header.scrollLeft =
            this.main.footer.scrollLeft = this.main.detail.scrollLeft;*/
    }
    get scrollBarWidth() { return this.main.detail.offsetWidth - this.main.detail.clientWidth; }
    get scrollBarHeight() { return this.main.detail.offsetHeight - this.main.detail.clientHeight; }
    /** @param {MouseEvent} e  */
    mouseoverlistner = (e) => {
        //console.log(document.elementsFromPoint(e.clientX, e.clientY));
        let cell = this.getCell(document.elementsFromPoint(e.clientX, e.clientY));
        console.log(cell);
        if (cell == this.lastOverCell) return;
        
       // e.stopImmediatePropagation();

        this.lastOverCell = cell;
        this.drawHoverEffect();
    }


    isShowing = false;
    drawHoverEffect = () => {
        let cell = this.lastOverCell;
        if (cell != undefined) {
            let row = this.getRow(cell);

            /*
            console.log(cell);
            console.log(cell.nodeName +" : "+cell.index()+":"+cell.offsetLeft+";"+cell.offsetTop);*/
            Object.assign(gridResizer.drawSelectionHT.style, {
                "left": `${cell.offsetLeft}px`,
                "width": `${cell.offsetWidth}px`,
                "top": `${row.offsetTop}px`,
                "height": `${row.offsetHeight}px`,
                // 'visibility': 'visible',
            });
        }
        /* if (cell != undefined) {
             Object.assign(this.main.transHoverVerticalline.style, {
                 "left": `${cell.offsetLeft}px`,
                 "width": `${cell.offsetWidth}px`,
                 "top": `${this.main.detail.scrollTop}px`,
                 "height": `${this.dgvDomRect.height - this.scrollBarHeight}px`,
                 // 'visibility': 'visible',
             });
         }
         let row = this.getRow(cell);
         if (row != undefined) {
             Object.assign(this.main.transHoverHorizontalline.style, {
                 "left": `${this.main.detail.scrollLeft}px`,
                 "width": `${this.dgvDomRect.width - this.scrollBarWidth}px`,
                 "top": `${row.offsetTop}px`,
                 "height": `${row.offsetHeight}px`,
             });
         }*/
        this.isShowing = false;
    }

    /**
     * @param {HTMLElement[]} elem 
     * @returns {HTMLElement}
     */
    getCell(elem = []) {
        let lname = this.options.nodeName.toUpperCase();
        return elem.find(s => { return s.nodeName == lname && this.options.uc.ucExtends.isOurElement(s); });
        /*if (elem == undefined) return undefined;
        if (elem.nodeName.toLowerCase() == this.node.cellNodeName.toLowerCase()) return elem;
        else return this.getCell(elem.parentElement);*/
    }
    /**
     * @param {HTMLElement} cell 
     * @returns {HTMLElement}
     */
    getRow(cell) {
        if (cell == undefined) return undefined;
        return cell.parentElement;
        /*if (cell.nodeName.toLowerCase() == this.main.node.rowNodeName.toLowerCase()) return cell;
        else return this.getRow(cell.parentElement);*/
    }










    templeteOf = 'grid-template-columns';
    /** @type {measurementRow[]}  */
    measurement = [];
    /** @type {"fill"|"unfill"}*/
    fillMode = "unfill";

    /** @type {HTMLElement}  */
    static drawSelectionHT = `<resizer role="drawSelection"></resizer>`.$();
    /** @type {HTMLElement}  */
    static h_resizerHT = `<resizer role="left"></resizer>`.$();
    /** @type {HTMLElement}  */
    static v_resizerHT = `<resizer role="bottom"></resizer>`.$();


    get measureText() {
        return this.measurement.length <= 1 ? 'auto'
            : this.measurement
                .map(s => s.size)
                .slice(0, -1)
                .join('px ') + 'px auto';
    }
    refreshView() {
        //this, this.grid.contains
        this.options.grid.style[this.nameList.templeteOf] = this.measureText;
    }
    get hasDefinedStyles() {
        return this.options.grid.style[this.nameList.templeteOf] != "";
    }
}
gridResizer.drawSelectionHT.append(gridResizer.h_resizerHT);
gridResizer.drawSelectionHT.append(gridResizer.v_resizerHT);
module.exports = { gridResizer, measurementRow }
