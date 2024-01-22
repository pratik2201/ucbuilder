"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rect = exports.Size = exports.Point = void 0;
class Point {
    constructor(x = 0, y = 0) {
        this.x = 0;
        this.y = 0;
        this.applyHT = {
            both: () => {
                return {
                    left: `${this.x}px`,
                    top: `${this.y}px`,
                };
            },
            left: () => {
                return { left: `${this.x}px` };
            },
            top: () => {
                return { top: `${this.y}px` };
            }
        };
        this.applyJQ = {
            both: (elementJQ) => {
                elementJQ.css({
                    "left": this.x,
                    "top": this.y,
                });
            },
            left: (elementJQ) => {
                elementJQ.css({ "left": this.x, });
            },
            top: (elementJQ) => {
                elementJQ.css({ "top": this.y, });
            }
        };
        this.setBy = {
            point: (target) => {
                this.x = target.x;
                this.y = target.y;
            },
            value: (x, y) => {
                this.x = x;
                this.y = y;
            },
            SVGEle: (ele) => {
                this.y = ele.y.baseVal.value;
                this.x = ele.x.baseVal.value;
            },
            style: (elestyle) => {
                switch (elestyle.position) {
                    case "absolute":
                    case "-webkit-sticky":
                    case "-ms-page":
                    case "fixed":
                    case "sticky":
                        this.x = parseFloat(elestyle.left);
                        this.y = parseFloat(elestyle.top);
                        break;
                    case "relative":
                    case "static":
                        this.x = parseFloat(elestyle.marginLeft);
                        this.y = parseFloat(elestyle.marginTop);
                        break;
                }
            },
            HTMLEle: (ele) => {
                this.x = ele.offsetLeft;
                this.y = ele.offsetTop;
            },
            JqEle: (ele) => {
                let pos = ele.position();
                this.x = pos.left;
                this.y = pos.top;
            }
        };
        this.x = x;
        this.y = y;
    }
    equal(pt) { return pt.x === this.y && pt.y === this.y; }
    get left() { return this.x; }
    set left(val) { this.x = val; }
    get top() { return this.y; }
    set top(val) { this.y = val; }
    move(x, y) {
        this.x += x;
        this.y += y;
    }
    rectIn(rct) {
        return (this.x >= rct.left && this.x <= rct.right && this.y >= rct.top && this.y <= rct.bottom);
    }
    Add(pt) {
        this.x += pt.x;
        this.y += pt.y;
    }
    Subtract(pt) {
        this.x -= pt.x;
        this.y -= pt.y;
    }
    DevideByValue(value) {
        this.x /= value;
        this.y /= value;
    }
    MultiplyByValue(value) {
        this.x *= value;
        this.y *= value;
    }
    MinusByValue(value) {
        this.x -= value;
        this.y -= value;
    }
    AddByValue(value) {
        this.x += value;
        this.y += value;
    }
}
exports.Point = Point;
class Size {
    constructor(width = 0, height = 0) {
        this.width = 0;
        this.height = 0;
        this.applyHT = {
            both: () => {
                return {
                    width: `${this.width}px`,
                    height: `${this.height}px`,
                };
            },
            width: () => {
                return {
                    width: `${this.width}px`,
                };
            },
            height: () => {
                return {
                    height: `${this.height}px`,
                };
            }
        };
        this.applyJQ = {
            both: (elementJQ) => {
                elementJQ.css({
                    "width": this.width,
                    "height": this.height,
                });
            },
            width: (elementJQ) => {
                elementJQ.css({ "width": this.width, });
            },
            height: (elementJQ) => {
                elementJQ.css({ "height": this.height, });
            }
        };
        this.setBy = {
            size: (target) => {
                this.width = target.width;
                this.height = target.height;
            },
            value: (w, h) => {
                this.height = h;
                this.width = w;
            },
            SVGEle: (ele) => {
                this.width = ele.width.baseVal.value;
                this.height = ele.height.baseVal.value;
            },
            style: (elestyle) => {
                this.height = Size.getFullHeight(elestyle);
                this.width = Size.getFullWidth(elestyle);
            },
            HTMLEle: (ele) => {
                this.height = ele.offsetHeight;
                this.width = ele.offsetWidth;
            },
            JqEle: (ele) => {
                this.height = ele.height();
                this.width = ele.width();
            }
        };
        this.width = width;
        this.height = height;
    }
    Add(sz) {
        this.width += sz.width;
        this.height += sz.height;
    }
    Subtract(sz) {
        this.width -= sz.width;
        this.height -= sz.height;
    }
    DevideByValue(value) {
        this.width /= value;
        this.height /= value;
    }
    MultiplyByValue(value) {
        this.width *= value;
        this.height *= value;
    }
    MinusByValue(value) {
        this.width -= value;
        this.height -= value;
    }
    AddByValue(value) {
        this.width += value;
        this.height += value;
    }
    get midWidth() { return (this.width / 2); }
    get midHeight() { return (this.height / 2); }
}
exports.Size = Size;
Size.getFullHeight = (elestyle) => {
    return (parseFloat(elestyle.height)
        + parseFloat(elestyle.paddingBottom)
        + parseFloat(elestyle.paddingTop)
        + parseFloat(elestyle.borderBottomWidth)
        + parseFloat(elestyle.borderTopWidth));
};
Size.getFullWidth = (elestyle) => {
    return (parseFloat(elestyle.width)
        + parseFloat(elestyle.paddingRight)
        + parseFloat(elestyle.paddingLeft)
        + parseFloat(elestyle.borderLeftWidth)
        + parseFloat(elestyle.borderRightWidth));
};
class Rect {
    constructor() {
        this.size = new Size();
        this.location = new Point();
        this.scale = new Point();
        this.clientRect = {};
        this.setBy = {
            rect: (target) => {
                this.location.setBy.point(target.location);
                this.size.setBy.size(target.size);
            },
            SVGEle: (ele) => {
                this.location.setBy.SVGEle(ele);
                this.size.setBy.SVGEle(ele);
            },
            domRect: (rct) => {
                this.location.setBy.value(rct.x, rct.y);
                this.size.setBy.value(rct.width, rct.height);
            },
            style: (elestyle) => {
                this.location.setBy.style(elestyle);
                this.size.setBy.style(elestyle);
            },
            HTMLEle: (ele) => {
                this.location.setBy.HTMLEle(ele);
                this.size.setBy.HTMLEle(ele);
            },
            JqEle: (ele) => {
                this.location.setBy.JqEle(ele);
                this.size.setBy.JqEle(ele);
            }
        };
        this.applyHT = {
            all: () => {
                return Object.assign({}, this.location.applyHT.both(), this.size.applyHT.both());
            },
            size: () => {
                return Object.assign({}, this.size.applyHT.both());
            },
            location: () => {
                return Object.assign({}, this.location.applyHT.both());
            },
            width: () => {
                return Object.assign({}, this.size.applyHT.width());
            },
            height: () => {
                return Object.assign({}, this.size.applyHT.height());
            },
            left: () => {
                return Object.assign({}, this.location.applyHT.left());
            },
            top: () => {
                return Object.assign({}, this.location.applyHT.top());
            },
        };
        this.applyJQ = {
            all: (elementJQ) => {
                this.size.applyJQ.both(elementJQ);
                this.location.applyJQ.both(elementJQ);
            },
            size: (elementJQ) => {
                this.size.applyJQ.both(elementJQ);
            },
            location: (elementJQ) => {
                this.location.applyJQ.both(elementJQ);
            },
            width: (elementJQ) => {
                this.size.applyJQ.width(elementJQ);
            },
            height: (elementJQ) => {
                this.size.applyJQ.height(elementJQ);
            },
            left: (elementJQ) => {
                this.location.applyJQ.left(elementJQ);
            },
            top: (elementJQ) => {
                this.location.applyJQ.top(elementJQ);
            },
            leftwidth: (elementJQ) => {
                elementJQ.css({
                    "left": this.location.x,
                    "width": this.size.width,
                });
            },
            topheight: (elementJQ) => {
                elementJQ.css({
                    "top": this.location.y,
                    "height": this.size.height,
                });
            },
            topheightwidth: (elementJQ) => {
                elementJQ.css({
                    "top": this.location.y,
                    "height": this.size.height,
                    "width": this.size.width,
                });
            },
            leftheightwidth: (elementJQ) => {
                elementJQ.css({
                    "left": this.location.x,
                    "height": this.size.height,
                    "width": this.size.width,
                });
            },
        };
    }
    get x() { return this.location.x; }
    get y() { return this.location.y; }
    pointIn(x, y) {
        return (x >= this.left && x <= this.right && y >= this.top && y <= this.bottom);
    }
    rectIn(rct) {
        return (this.x < rct.right &&
            this.right > rct.x &&
            this.y < rct.bottom &&
            this.bottom > rct.y);
    }
    offset(x, y) {
        this.location.x = x;
        this.location.y = y;
    }
    get topleft() { return { x: this.left, y: this.top }; }
    get topright() { return { x: this.right, y: this.top }; }
    get bottomleft() { return { x: this.left, y: this.bottom }; }
    get bottomright() { return { x: this.right, y: this.bottom }; }
    get middleTop() { return { x: this.left + this.size.midWidth, y: this.top }; }
    get middleLeft() { return { x: this.left, y: this.top + this.size.midHeight }; }
    get middleRight() { return { x: this.right, y: this.top + this.size.midHeight }; }
    get middleBottom() { return { x: this.left + this.size.midWidth, y: this.bottom }; }
    get left() { return this.location.x; }
    set left(val) { this.location.x = val; }
    get top() { return this.location.y; }
    set top(val) { this.location.y = val; }
    get width() { return this.size.width; }
    set width(val) { this.size.width = val; }
    get height() { return this.size.height; }
    set height(val) { this.size.height = val; }
    get right() { return this.left + this.size.width; }
    get bottom() { return this.top + this.size.height; }
    getDockSide(x, y) {
        let left = x;
        let top = y;
        let right = this.size.width - x;
        let bottom = this.size.height - y;
        let winner = "left";
        let winnerVal = left;
        if (top < winnerVal) {
            winner = "top";
            winnerVal = top;
        }
        if (right < winnerVal) {
            winner = "right";
            winnerVal = right;
        }
        if (bottom < winnerVal) {
            winner = "bottom";
            winnerVal = bottom;
        }
        return winner;
    }
    getOverFlowDetail(bodyRect) {
        let rtrn = {
            left: this.left - bodyRect.left,
            top: this.top - bodyRect.top,
            right: bodyRect.right - this.right,
            bottom: bodyRect.bottom - this.bottom,
            bottomSize: 0,
            topSize: 0,
            rightSize: 0,
        };
        rtrn.bottomSize = (bodyRect.bottom - this.top);
        rtrn.topSize = (this.bottom - bodyRect.top);
        rtrn.rightSize = (bodyRect.right - this.left);
        return rtrn;
    }
}
exports.Rect = Rect;
