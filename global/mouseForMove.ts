import { Point } from "ucbuilder/global/drawing/shapes";
import { newObjectOpt } from "ucbuilder/global/objectOpt";

interface MouseEvent {
    pageX: number;
    pageY: number;
}

interface MouseForMoveOptions {
    onDown: (evt: MouseEvent, downPoint: Point) => boolean|void;
    onMove: (evt: MouseEvent, diff: Point) => void;
    onUp: (evt: MouseEvent, diff: Point) => void;
}
const mouseForMoveOptions: MouseForMoveOptions = {
    onDown: (evt: MouseEvent, downPoint: Point) => false,
    onMove: (evt: MouseEvent, diff: Point) => { },
    onUp: (evt: MouseEvent, diff: Point) => { },
}
class MouseForMove {
    downPoint: Point = new Point();
    diffPoint: Point = new Point();
    _options: MouseForMoveOptions;

    constructor() { }

    bind(pera: MouseForMoveOptions, ...targetElement: HTMLElement[]) {
        this._options = Object.assign({},mouseForMoveOptions);
        this._options = Object.assign(this._options, pera);
        targetElement.forEach((ele) =>
            ele.addEventListener("mousedown", this.doMouseDown)
        );
    }

    doMouseDown = (e: MouseEvent) => {
        this.downPoint.setBy.value(e.pageX, e.pageY);
        let _this = this;
        if (
            _this._options.onDown != undefined &&
            _this._options.onDown(e, this.downPoint) === false
        )
            return;

        function mousemoveEvent(mouseEvt: MouseEvent) {
            _this.diffPoint.setBy.value(mouseEvt.pageX, mouseEvt.pageY);
            _this.diffPoint.Subtract(_this.downPoint);
            if (_this._options.onMove != undefined)
                _this._options.onMove(mouseEvt, _this.diffPoint);
        }

        function mouseupEvent(mouseEvt: MouseEvent) {
            _this._options.onUp(mouseEvt, _this.diffPoint);
            document.body.off("mousemove", mousemoveEvent);
            document.body.off("mouseup", mouseupEvent);
            document.body.off("mouseleave", mouseupEvent);
        }

        document.body.on("mousemove", mousemoveEvent);
        document.body.on("mouseup", mouseupEvent);
        document.body.on("mouseleave", mouseupEvent);
    };

    static BOUND_COUNTER = 0;
}

export { MouseForMove };