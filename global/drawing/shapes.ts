type SVGElements = SVGElement & SVGLineElement & SVGRectElement & SVGCircleElement & SVGEllipseElement;
export class Point {
    x: number = 0;
    y: number = 0;

    equal(pt: Point): boolean { return pt.x === this.y && pt.y === this.y; }
    get left(): number { return this.x; }
    set left(val: number) { this.x = val; }

    get top(): number { return this.y; }
    set top(val: number) { this.y = val; }

    constructor(x: number = 0, y: number = 0) { this.x = x; this.y = y; }

    move(x: number, y: number): void {
        this.x += x;
        this.y += y;
    }

    rectIn(rct: DOMRect): boolean {
        return (this.x >= rct.left && this.x <= rct.right && this.y >= rct.top && this.y <= rct.bottom);
    }

    applyHT = {
        both: (): { left: string, top: string } => {
            return {
                left: `${this.x}px`,
                top: `${this.y}px`,
            }
        },
        left: (): { left: string } => {
            return { left: `${this.x}px` }
        },
        top: (): { top: string } => {
            return { top: `${this.y}px` }
        }
    }

    applyJQ = {
        both: (elementJQ: JQuery): void => {
            elementJQ.css({
                "left": this.x,
                "top": this.y,
            });
        },
        left: (elementJQ: JQuery): void => {
            elementJQ.css({ "left": this.x, });
        },
        top: (elementJQ: JQuery): void => {
            elementJQ.css({ "top": this.y, });
        }
    }

    Add(pt: Point): void {
        this.x += pt.x;
        this.y += pt.y;
    }

    Subtract(pt: Point): void {
        this.x -= pt.x;
        this.y -= pt.y;
    }

    DevideByValue(value: number): void {
        this.x /= value;
        this.y /= value;
    }

    MultiplyByValue(value: number): void {
        this.x *= value;
        this.y *= value;
    }

    MinusByValue(value: number): void {
        this.x -= value;
        this.y -= value;
    }

    AddByValue(value: number): void {
        this.x += value;
        this.y += value;
    }

    setBy = {
        point: (target: Point): void => {
            this.x = target.x;
            this.y = target.y;
        },
        value: (x: number, y: number): void => {
            this.x = x;
            this.y = y;
        },
        SVGEle: (ele: SVGElements): void => {
            this.y = ele.y.baseVal.value;
            this.x = ele.x.baseVal.value;
        },
        style: (elestyle: CSSStyleDeclaration): void => {
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
        HTMLEle: (ele: HTMLElement): void => {
            this.x = ele.offsetLeft;
            this.y = ele.offsetTop;
        },
        JqEle: (ele: JQuery): void => {
            let pos = ele.position();
            this.x = pos.left;
            this.y = pos.top;
        }
    }
}

export class Size {
    width: number = 0;
    height: number = 0;

    constructor(width: number = 0, height: number = 0) { this.width = width; this.height = height; }

    Add(sz: Size): void {
        this.width += sz.width;
        this.height += sz.height;
    }

    Subtract(sz: Size): void {
        this.width -= sz.width;
        this.height -= sz.height;
    }

    DevideByValue(value: number): void {
        this.width /= value;
        this.height /= value;
    }

    MultiplyByValue(value: number): void {
        this.width *= value;
        this.height *= value;
    }

    MinusByValue(value: number): void {
        this.width -= value;
        this.height -= value;
    }

    AddByValue(value: number): void {
        this.width += value;
        this.height += value;
    }

    applyHT = {
        both: (): { width: string, height: string } => {
            return {
                width: `${this.width}px`,
                height: `${this.height}px`,
            }
        },
        width: (): { width: string } => {
            return {
                width: `${this.width}px`,
            }
        },
        height: (): { height: string } => {
            return {
                height: `${this.height}px`,
            }
        }
    }

    applyJQ = {
        both: (elementJQ: JQuery): void => {
            elementJQ.css({
                "width": this.width,
                "height": this.height,
            });
        },
        width: (elementJQ: JQuery): void => {
            elementJQ.css({ "width": this.width, });
        },
        height: (elementJQ: JQuery): void => {
            elementJQ.css({ "height": this.height, });
        }
    }

    static getFullHeight = (elestyle: CSSStyleDeclaration): number => {
        return (parseFloat(elestyle.height)
            + parseFloat(elestyle.paddingBottom)
            + parseFloat(elestyle.paddingTop)
            + parseFloat(elestyle.borderBottomWidth)
            + parseFloat(elestyle.borderTopWidth));
    }

    static getFullWidth = (elestyle: CSSStyleDeclaration): number => {
        return (parseFloat(elestyle.width)
            + parseFloat(elestyle.paddingRight)
            + parseFloat(elestyle.paddingLeft)
            + parseFloat(elestyle.borderLeftWidth)
            + parseFloat(elestyle.borderRightWidth));
    }

    get midWidth(): number { return (this.width / 2); }
    get midHeight(): number { return (this.height / 2); }

    setBy = {
        size: (target: Size): void => {
            this.width = target.width;
            this.height = target.height;
        },
        value: (w: number, h: number): void => {
            this.height = h;
            this.width = w;
        },
        SVGEle: (ele: SVGElements): void => {
            this.width = ele.width.baseVal.value;
            this.height = ele.height.baseVal.value;
        },
        style: (elestyle: CSSStyleDeclaration): void => {
            this.height = Size.getFullHeight(elestyle);
            this.width = Size.getFullWidth(elestyle);
        },
        HTMLEle: (ele: HTMLElement): void => {
            this.height = ele.offsetHeight;
            this.width = ele.offsetWidth;
        },
        JqEle: (ele: JQuery): void => {
            this.height = ele.height();
            this.width = ele.width();
        }
    }
}

export class Rect {
    size: Size = new Size();
    location: Point = new Point();
    scale: Point = new Point();
    clientRect: any = {};

    get x(): number { return this.location.x; }
    get y(): number { return this.location.y; }

    pointIn(x: number, y: number): boolean {
        return (x >= this.left && x <= this.right && y >= this.top && y <= this.bottom);
    }

    rectIn(rct: Rect): boolean {
        return (
            this.x < rct.right &&
            this.right > rct.x &&
            this.y < rct.bottom &&
            this.bottom > rct.y
        );
    }

    setBy = {
        rect: (target: Rect): void => {
            this.location.setBy.point(target.location);
            this.size.setBy.size(target.size);
        },
        SVGEle: (ele: SVGElements): void => {
            this.location.setBy.SVGEle(ele);
            this.size.setBy.SVGEle(ele);
        },
        domRect: (rct: DOMRect): void => {
            this.location.setBy.value(rct.x, rct.y);
            this.size.setBy.value(rct.width, rct.height);
        },
        style: (elestyle: CSSStyleDeclaration): void => {
            this.location.setBy.style(elestyle);
            this.size.setBy.style(elestyle);
        },
        HTMLEle: (ele: HTMLElement): void => {
            this.location.setBy.HTMLEle(ele);
            this.size.setBy.HTMLEle(ele);
        },
        JqEle: (ele: JQuery): void => {
            this.location.setBy.JqEle(ele);
            this.size.setBy.JqEle(ele);
        }
    }

    offset(x: number, y: number): void {
        this.location.x = x;
        this.location.y = y;
    }

    get topleft(): { x: number, y: number } { return { x: this.left, y: this.top }; }
    get topright(): { x: number, y: number } { return { x: this.right, y: this.top }; }
    get bottomleft(): { x: number, y: number } { return { x: this.left, y: this.bottom }; }
    get bottomright(): { x: number, y: number } { return { x: this.right, y: this.bottom }; }

    get middleTop(): { x: number, y: number } { return { x: this.left + this.size.midWidth, y: this.top }; }
    get middleLeft(): { x: number, y: number } { return { x: this.left, y: this.top + this.size.midHeight }; }
    get middleRight(): { x: number, y: number } { return { x: this.right, y: this.top + this.size.midHeight }; }
    get middleBottom(): { x: number, y: number } { return { x: this.left + this.size.midWidth, y: this.bottom }; }

    get left(): number { return this.location.x; }
    set left(val: number) { this.location.x = val; }

    get top(): number { return this.location.y; }
    set top(val: number) { this.location.y = val; }

    get width(): number { return this.size.width; }
    set width(val: number) { this.size.width = val; }

    get height(): number { return this.size.height; }
    set height(val: number) { this.size.height = val; }

    get right(): number { return this.left + this.size.width; }
    get bottom(): number { return this.top + this.size.height; }

    getDockSide(x: number, y: number): "left" | "right" | "top" | "bottom" {
        let left = x;
        let top = y;
        let right = this.size.width - x;
        let bottom = this.size.height - y;
        let winner: "left" | "right" | "top" | "bottom" = "left";
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

    applyHT = {
        all: (): { left: string, top: string, width: string, height: string } => {
            return Object.assign({},
                this.location.applyHT.both(),
                this.size.applyHT.both());
        },
        size: (): { width: string, height: string } => {
            return Object.assign({}, this.size.applyHT.both());
        },
        location: (): { left: string, top: string } => {
            return Object.assign({}, this.location.applyHT.both());
        },
        width: (): { width: string } => {
            return Object.assign({}, this.size.applyHT.width());
        },
        height: (): { height: string } => {
            return Object.assign({}, this.size.applyHT.height());
        },
        left: (): { left: string } => {
            return Object.assign({}, this.location.applyHT.left());
        },
        top: (): { top: string } => {
            return Object.assign({}, this.location.applyHT.top());
        },
    }

    applyJQ = {
        all: (elementJQ: JQuery): void => {
            this.size.applyJQ.both(elementJQ);
            this.location.applyJQ.both(elementJQ);
        },
        size: (elementJQ: JQuery): void => {
            this.size.applyJQ.both(elementJQ);
        },
        location: (elementJQ: JQuery): void => {
            this.location.applyJQ.both(elementJQ);
        },
        width: (elementJQ: JQuery): void => {
            this.size.applyJQ.width(elementJQ);
        },
        height: (elementJQ: JQuery): void => {
            this.size.applyJQ.height(elementJQ);
        },
        left: (elementJQ: JQuery): void => {
            this.location.applyJQ.left(elementJQ);
        },
        top: (elementJQ: JQuery): void => {
            this.location.applyJQ.top(elementJQ);
        },
        leftwidth: (elementJQ: JQuery): void => {
            elementJQ.css({
                "left": this.location.x,
                "width": this.size.width,
            })
        },
        topheight: (elementJQ: JQuery): void => {
            elementJQ.css({
                "top": this.location.y,
                "height": this.size.height,
            })
        },
        topheightwidth: (elementJQ: JQuery): void => {
            elementJQ.css({
                "top": this.location.y,
                "height": this.size.height,
                "width": this.size.width,
            })
        },
        leftheightwidth: (elementJQ: JQuery): void => {
            elementJQ.css({
                "left": this.location.x,
                "height": this.size.height,
                "width": this.size.width,
            })
        },
    }

    getOverFlowDetail(bodyRect: Rect): { left: number, top: number, right: number, bottom: number, bottomSize: number, topSize: number, rightSize: number } {
        let rtrn = {
            left: this.left - bodyRect.left,
            top: this.top - bodyRect.top,
            right: bodyRect.right - this.right,
            bottom: bodyRect.bottom - this.bottom,
            bottomSize: 0,
            topSize: 0,
            rightSize: 0,
        }
        rtrn.bottomSize = (bodyRect.bottom - this.top);
        rtrn.topSize = (this.bottom - bodyRect.top);
        rtrn.rightSize = (bodyRect.right - this.left);

        return rtrn;
    }
}