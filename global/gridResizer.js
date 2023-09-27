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
const namingConversion = {
    offsetSize: 'offsetWidth',
    splitterText: 'splitter-width',
    gridTemplate: 'grid-template-columns',
    gridAuto: 'grid-auto-rows',
    point: 'x',
    size: 'width',
    dir: 'left',
    pagePoint: 'pageX',
    OPPOSITE: {
        scrollPoint: "scrollTop",
        scrollSize: "scrollBarHeight",
    }
}
class gridResizer {
    /**
     * @param {"grid-template-columns"|"grid-template-rows"} gridTemplate 
     * @returns {namingConversion}
     */
    static getConvertedNames(gridTemplate = 'grid-template-columns') {
        let _rtrn = newObjectOpt.clone(namingConversion);
        if (gridTemplate == 'grid-template-rows') {
            _rtrn.offsetSize = 'offsetHeight';
            _rtrn.splitterText = 'splitter-height';
            _rtrn.gridTemplate = gridTemplate;
            _rtrn.gridAuto = 'grid-auto-columns'
            _rtrn.size = 'height',
                _rtrn.point = 'y';
            _rtrn.dir = "top";
            _rtrn.pagePoint = 'pageY';
            _rtrn.OPPOSITE = {
                scrollPoint: "scrollLeft",
                scrollSize: "scrollBarWidth",
            };
        }
        return _rtrn;
    }

    constructor() {
    }
    /** @type {container[]}  */
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
    /** @type {"slider"|"unfill"}*/
    resizeMode = "unfill";

    get measureText() {
        return this.measurement.length <= 1 ? 'auto'
            : this.measurement
                .map(s => s.size)
                .slice(0, -1)
                .join('px ') + 'px auto';
    }
    /** @type {"grid-template-columns"|"grid-template-rows"}  */
    gridTemplate = namingConversion.gridTemplate;
    /** @type {"grid-auto-columns"|"grid-auto-rows"}  */
    gridAuto = '';
    refreshView() {
        //this, this.grid.contains
        this.options.grid.style[this.gridTemplate] = this.measureText;
    }
    get hasDefinedStyles() {
        return this.options.grid.style[this.gridTemplate] != "";
    }
}

module.exports = { gridResizer, measurementRow, namingConversion }