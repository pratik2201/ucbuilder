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
    nodeName: "",
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
        
    }
    /** @type {Rect}  */
    dgvDomRect = new Rect();
    
    /** @type {measurementRow[]}  */
    measurement = [];
    /** @type {"fill"|"unfill"}*/
    fillMode = "unfill";

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

module.exports = { gridResizer, measurementRow }