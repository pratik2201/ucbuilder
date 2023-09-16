const measurementRow = {
    /** @type {number}  */
    size: undefined,
    data: {}
};
class gridResizer {
    constructor() {
    }
    /** @type {HTMLElement}  */ 
    grid = undefined;
    templeteOf = 'grid-template-columns';
    /** @type {measurementRow[]}  */
    measurement = [];

    get measureText() {
        return this.measurement.length <= 1 ? 'auto'
            : this.measurement
                .map(s => s.size)
                .slice(0, -1)
                .join('px ') + 'px auto';
    }
    refreshView() {
        this.grid.style[this.templeteOf] = this.measureText;
    }
    get hasDefinedStyles() {
        return this.grid.style[this.templeteOf] != "";
    }
}
module.exports = { gridResizer, measurementRow }