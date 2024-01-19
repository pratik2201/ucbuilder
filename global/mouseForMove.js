"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MouseForMove = void 0;
const shapes_1 = require("ucbuilder/global/drawing/shapes");
const mouseForMoveOptions = {
    onDown: (evt, downPoint) => false,
    onMove: (evt, diff) => { },
    onUp: (evt, diff) => { },
};
class MouseForMove {
    constructor() {
        this.downPoint = new shapes_1.Point();
        this.diffPoint = new shapes_1.Point();
        this.doMouseDown = (e) => {
            this.downPoint.setBy.value(e.pageX, e.pageY);
            let _this = this;
            if (_this._options.onDown != undefined &&
                _this._options.onDown(e, this.downPoint) === false)
                return;
            function mousemoveEvent(mouseEvt) {
                _this.diffPoint.setBy.value(mouseEvt.pageX, mouseEvt.pageY);
                _this.diffPoint.Subtract(_this.downPoint);
                if (_this._options.onMove != undefined)
                    _this._options.onMove(mouseEvt, _this.diffPoint);
            }
            function mouseupEvent(mouseEvt) {
                _this._options.onUp(mouseEvt, _this.diffPoint);
                document.body.off("mousemove", mousemoveEvent);
                document.body.off("mouseup", mouseupEvent);
                document.body.off("mouseleave", mouseupEvent);
            }
            document.body.on("mousemove", mousemoveEvent);
            document.body.on("mouseup", mouseupEvent);
            document.body.on("mouseleave", mouseupEvent);
        };
    }
    bind(pera, ...targetElement) {
        this._options = Object.assign({}, mouseForMoveOptions);
        this._options = Object.assign(this._options, pera);
        targetElement.forEach((ele) => ele.addEventListener("mousedown", this.doMouseDown));
    }
}
exports.MouseForMove = MouseForMove;
MouseForMove.BOUND_COUNTER = 0;
