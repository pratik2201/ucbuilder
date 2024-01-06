
class Point {
    x = 0;
    y = 0;
    /**
     * @param {Point} pt 
     */
    equal(pt) { return pt.x === this.y && pt.y === this.y; }
    get left() { return this.x; }
    set left(val) { this.x = val; }

    get top() { return this.y; }
    set top(val) { this.y = val; }
    constructor(x = 0, y = 0) { this.x = x; this.y = y; }

    move(x, y) {
        this.x += x;
        this.y += y;
    }
    /**  @param {DOMRect} rct */
    rectIn(rct) {
        return (this.x >= rct.left && this.x <= rct.right && this.y >= rct.top && this.y <= rct.bottom);
    }

    applyHT = {
        /** @param {HTMLElement} elementHT */
        both: () => {
            return {
                left: `${this.x}px`,
                top: `${this.y}px`,
            }
        },
        left: () => {
            return { left: `${this.x}px` }
        },
        top: (elementHT) => {
            return { top: `${this.y}px` }
        }
    }
    applyJQ = {
        /** @param {JQuery} elementJQ */
        both: (elementJQ) => {
            // console.log(this.x);
            elementJQ.css({
                "left": this.x,
                "top": this.y,
            });
        },
        /** @param {JQuery} elementJQ */
        left: (elementJQ) => {
            elementJQ.css({ "left": this.x, });
        },
        /** @param {JQuery} elementJQ */
        top: (elementJQ) => {
            elementJQ.css({ "top": this.y, });
        }
    }


    /** @param {Point} pt */
    Add(pt) {

        this.x += pt.x;
        this.y += pt.y;
    }/** @param {Point} pt */
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

    setBy = {
        /** @param {Point} target  */
        point: (target) => {
            this.x = target.x;
            this.y = target.y;
        },
        value: (x, y) => {
            this.x = x;
            this.y = y;
        },
        /** @param {SVGElement} ele */
        SVGEle: (ele)=>{
            
        },
        /** @param {CSSStyleDeclaration} elestyle */
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
        /** @param {HTMLElement} ele  */
        HTMLEle: (ele) => {
            this.x = parseFloat(ele.offsetLeft);
            this.y = parseFloat(ele.offsetTop);
        },
        /** @param {JQuery} ele  */
        JqEle: (ele) => {
            let pos = ele.position();
            this.x = parseFloat(pos.left);
            this.y = parseFloat(pos.top);
        }
    }
}
class Size {
    constructor(width = 0, height = 0) { this.width = width; this.height = height; }



    /** @param {Size} sz */
    Add(sz) {

        this.width+= sz.width;
        this.height += sz.height;
    }/** @param {Size} pt */
    Subtract(sz) {
        this.width-= sz.width;
        this.height -= sz.height;
    }
    DevideByValue(value) {
        this.width/= value;
        this.height /= value;
    }
    MultiplyByValue(value) {
        this.width*= value;
        this.height *= value;
    }
    applyHT = {
        /** @param {HTMLElement} elementHT */
        both: (elementHT) => {

            return {
                width: `${this.width}px`,
                height: `${this.height}px`,
            }
        },
        /** @param {HTMLElement} elementHT */
        width: (elementHT) => {
            return {
                width: `${this.width}px`,
            }
        },
        /** @param {HTMLElement} elementHT */
        height: (elementHT) => {
            return {
                height: `${this.height}px`,
            }
        }
    }
    applyJQ = {
        /** @param {JQuery} elementJQ */
        both: (elementJQ) => {

            elementJQ.css({
                "width": this.width,
                "height": this.height,
            });
        },
        /** @param {JQuery} elementJQ */
        width: (elementJQ) => {
            elementJQ.css({ "width": this.width, });
        },
        /** @param {JQuery} elementJQ */
        height: (elementJQ) => {
            elementJQ.css({ "height": this.height, });
        }
    }


    /** @param {CSSStyleDeclaration} elestyle */
    static getFullHeight = (elestyle) => {
        /*console.log(`${elestyle.height}
         + ${parseFloat(elestyle.paddingBottom)}
         + ${parseFloat(elestyle.paddingTop)}
         + ${parseFloat(elestyle.borderBottomWidth)}
         + ${parseFloat(elestyle.borderTopWidth)}`);*/
        return (parseFloat(elestyle.height)
            + parseFloat(elestyle.paddingBottom)
            + parseFloat(elestyle.paddingTop)
            + parseFloat(elestyle.borderBottomWidth)
            + parseFloat(elestyle.borderTopWidth));
    }
    /** @param {CSSStyleDeclaration} elestyle */
    static getFullWidth = (elestyle) => {
        return (parseFloat(elestyle.width)
            + parseFloat(elestyle.paddingRight)
            + parseFloat(elestyle.paddingLeft)
            + parseFloat(elestyle.borderLeftWidth)
            + parseFloat(elestyle.borderRightWidth));
    }
    width = 0;
    height = 0;
    get midWidth() { return (this.width / 2); }
    get midHeight() { return (this.height / 2); }


    setBy = {
        /** @param {Size} target  */
        size: (target) => {
            this.width = target.width;
            this.height = target.height;
        },
        value: (w, h) => {
            this.height = h;
            this.width = w;
        },
        /** @type {SVGElement}  */ 
        SVGEle: (ele)=>{
            
        },
        /** @param {CSSStyleDeclaration} elestyle */
        style: (elestyle) => {
            this.height = Size.getFullHeight(elestyle);
            this.width = Size.getFullWidth(elestyle);
        },
        /** @param {HTMLElement} ele  */
        HTMLEle: (ele) => {
            this.height = parseFloat(ele.offsetHeight);
            this.width = parseFloat(ele.offsetWidth);
        },
        /** @param {JQuery} ele  */
        JqEle: (ele) => {
            this.height = parseFloat(ele.height());
            this.width = parseFloat(ele.width());
        }
    }
}
class Rect {
    constructor() {
    }

    /**
     * 
     * @param {number} x 
     * @param {number} y
     * @returns {"left"|"right"|"top"|"bottom"}
     */
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
    applyHT = {

        all: () => {
            return Object.assign({},
                this.location.applyHT.both(),
                this.size.applyHT.both());
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
    }
    applyJQ = {
        /** @param {HTMLElement} elementHT */
        all: (elementHT) => {
            this.size.applyJQ.both(elementHT);
            this.location.applyJQ.both(elementHT);

        },
        /** @param {HTMLElement} elementHT */
        size: (elementJQ) => {
            this.size.applyJQ.both(elementHT);
        },
        /** @param {HTMLElement} elementHT */
        location: (elementJQ) => {
            this.location.applyJQ.both(elementHT);
        },
        /** @param {HTMLElement} elementHT */
        width: (elementJQ) => {
            this.size.applyJQ.width(elementHT);
        },
        /** @param {HTMLElement} elementHT */
        height: (elementJQ) => {
            this.size.applyJQ.height(elementHT);
        },
        /** @param {HTMLElement} elementHT */
        left: (elementJQ) => {
            this.location.applyJQ.left(elementHT);
        },
        /** @param {HTMLElement} elementHT */
        top: (elementJQ) => {
            this.location.applyJQ.top(elementHT);
        },

        /** @param {HTMLElement} elementHT */
        leftwidth: (elementJQ) => {
            elementJQ.css({
                "left": this.location.x,
                "width": this.size.width,
            })
        },
        /** @param {JQuery} elementJQ */
        topheight: (elementJQ) => {
            elementJQ.css({
                "top": this.location.y,
                "height": this.size.height,
            })
        },
        /** @param {JQuery} elementJQ */
        topheightwidth: (elementJQ) => {
            elementJQ.css({
                "top": this.location.y,
                "height": this.size.height,
                "width": this.size.width,
            })
        },
        /** @param {JQuery} elementJQ */
        leftheightwidth: (elementJQ) => {
            elementJQ.css({
                "left": this.location.x,
                "height": this.size.height,
                "width": this.size.width,
            })
        },
    }



    size = new Size();
    location = new Point();
    scale = new Point();
    clientRect = {};
    get x() { return this.location.x; }
    get y() { return this.location.y; }
    pointIn(x, y) {
        return (x >= this.left && x <= this.right && y >= this.top && y <= this.bottom);
    }
    /**
     * 
     * @param {Rect} rct 
     * @returns 
     */
    rectIn(rct) {
        return (
            this.x < rct.right &&
            this.right > rct.x &&
            this.y < rct.bottom &&
            this.bottom > rct.y
        );
    }

    setBy = {
        /** @param {Rect} target  */
        rect: (target) => {
            this.location.setBy.point(target.location);
            this.size.setBy.size(target.size);
        },
        /** @param {SVGElement} ele */
        SVGEle:(ele) => {
            this.location.setBy.SVGEle(ele);
            this.size.setBy.SVGEle(ele);
        },
        /** @param {DOMRect} rct */
        domRect:(rct) => {
            this.location.setBy.value(rct.x, rct.y);
            this.size.setBy.value(rct.width, rct.height);
        },
        /** @param {CSSStyleDeclaration} elestyle */
        style: (elestyle) => {
            this.location.setBy.style(elestyle);
            this.size.setBy.style(elestyle);
        },
        /** @param {HTMLElement} ele  */
        HTMLEle: (ele) => {
            this.location.setBy.HTMLEle(ele);
            this.size.setBy.HTMLEle(ele);
        },
        /** @param {JQuery} ele  */
        JqEle: (ele) => {
            this.location.setBy.JqEle(ele);
            this.size.setBy.JqEle(ele);
        }
    }
   
   
    offset(x, y) {

        this.location.x = x;
        this.location.y = y;
    }



    get topleft() { return new Point(this.left, this.top); }
    get topright() { return new Point(this.right, this.top); }
    get bottomleft() { return new Point(this.left, this.bottom); }
    get bottomright() { return new Point(this.right, this.bottom); }

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



    /** 
     * @param {Rect} bodyRect 
     * @returns  negative value mean overflowed that side
     * */
    getOverFlowDetail(bodyRect) {
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
module.exports = { Rect, Size, Point }