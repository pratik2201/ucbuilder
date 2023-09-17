const measurementRow = {
    /** @type {number}  */
    size: undefined,
    data: {}
};
class gridResizer {
    nameList = {
        offsetSize: 'offsetWidth',
        splitterText: 'splitter-width',
        templeteOf: 'grid-template-columns',
        point: 'x',
        size: 'width',
        dir: 'left',
        pagePoint: 'pageX',
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
                    break;
                case 'grid-template-rows':
                    _this.offsetSize = 'offsetHeight';
                    _this.splitterText = 'splitter-height';
                    _this.templeteOf = type;
                    _this.size = 'height',
                    _this.point = 'y';
                    _this.dir = "top";
                    _this.pagePoint = 'pageY';
                    break;
            }
        }
    }
    constructor() {
    }
    /** @type {HTMLElement}  */
    _grid = undefined;
    get grid() {
        return this._grid;
    }
    set grid(value) {
        this._grid = value;
        if(this.container==undefined) this.container = this._grid;
    }
    /** @type {HTMLElement}  */
    container = undefined;

    templeteOf = 'grid-template-columns';
    /** @type {measurementRow[]}  */
    measurement = [];
    /** @type {"fill"|"unfill"}*/
    fillMode = "unfill";
    /** @type {HTMLElement}  */
    static rectHT = `<resizer role="drawSelection"></resizer>`.$();
    /** @type {HTMLElement}  */
    static resizerHT = `<resizer role="left"></resizer>`.$();
    get measureText() {
        return this.measurement.length <= 1 ? 'auto'
            : this.measurement
                .map(s => s.size)
                .slice(0, -1)
                .join('px ') + 'px auto';
    }
    refreshView() {
        //this, this.grid.contains
        this.grid.style[this.nameList.templeteOf] = this.measureText;
    }
    get hasDefinedStyles() {
        return this.grid.style[this.nameList.templeteOf] != "";
    }
}
module.exports = { gridResizer, measurementRow }
