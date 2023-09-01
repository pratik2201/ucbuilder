const { commonEvent } = require("@ucbuilder:/global/commonEvent");
const { Point, Size, Rect } = require("@ucbuilder:/global/drawing/shapes");
const { Usercontrol } = require("@ucbuilder:/Usercontrol");
const dragMode = Object.freeze({
    none: -1,
    move: 0,
    left: 1,
    top: 2,
    right: 3,
    bottom: 4,
    topleft: 5,
    topright: 6,
    bottomleft: 7,
    bottomright: 8,
});
class dragUc {
    resizer = {
        /** @type {HTMLElement}  */
        left: `<resizer role="left"></resizer>`.$(),
        /** @type {HTMLElement}  */
        top: `<resizer role="top"></resizer>`.$(),
        /** @type {HTMLElement}  */
        right: `<resizer role="right"></resizer>`.$(),
        /** @type {HTMLElement}  */
        bottom: `<resizer role="bottom"></resizer>`.$(),

        /** @type {HTMLElement}  */
        topleft: `<corner role="topleft"></corner>`.$(),
        /** @type {HTMLElement}  */
        topright: `<corner role="topright"></corner>`.$(),
        /** @type {HTMLElement}  */
        bottomleft: `<corner role="bottomleft"></corner>`.$(),
        /** @type {HTMLElement}  */
        bottomright: `<corner role="bottomright"></corner>`.$(),

        /** @type {HTMLElement}  */
        rect: `<resizer role="drawSelection"></resizer>`.$(),
        /** @param {"block":"none"} val */
        cssDisplay(val) {
            this.top.style.display =
                this.right.style.display =
                this.bottom.style.display =
                this.left.style.display =
                this.topleft.style.display =
                this.topright.style.display =
                this.bottomleft.style.display =
                this.bottomright.style.display = val;
            this.rect.style.display = val;
        },
        getResizerAr: () => {
            if (this.allowResize) {
                let rsz = this.resizer;
                return [rsz.left, rsz.top, rsz.right, rsz.bottom,
                        rsz.topleft, rsz.topright,
                        rsz.bottomright, rsz.bottomleft];
            } else return [];
        },
        /** @param {Usercontrol} uc */
        connect: (uc = undefined) => {
            let res = this.resizer;
            let ucHT = this.containerHT;

            if (this.allowResize)
                if (uc == undefined) {
                    ucHT.append(res.left, res.top, res.right, res.bottom,
                        res.topleft, res.topright, res.bottomright,
                        res.bottomleft, res.rect);
                } else {
                    ucHT.append(...uc.ucExtends.passElement(
                        [res.left, res.top, res.right, res.bottom, res.topleft,
                        res.topright, res.bottomright,
                        res.bottomleft, res.rect]));
                }
        },
        /**
         * @param {HTMLElement} ele 
         * @returns {dragMode}
         */
        getMode(ele) {
            switch (ele.stamp()) {
                case this.top.stamp(): return dragMode.top;
                case this.left.stamp(): return dragMode.left;
                case this.right.stamp(): return dragMode.right;
                case this.bottom.stamp(): return dragMode.bottom;
                case this.topleft.stamp(): return dragMode.topleft;
                case this.topright.stamp(): return dragMode.topright;
                case this.bottomleft.stamp(): return dragMode.bottomleft;
                case this.bottomright.stamp(): return dragMode.bottomright;
                default: return dragMode.none;
            }
        }
    };
    constructor() {

    }
    allowMove = true;
    allowResize = true;
    /** @type {HTMLElement}  */
    containerHT = undefined;

    /** @type {CSSStyleDeclaration}  */
    containerStyle = undefined;
    /** @type {HTMLElement[]}  */
    titleHT = [];
    /**
     * @param {HTMLElement} containerHT 
     * @param {HTMLElement[]} titleHT 
     */
    init(containerHT, ...titleHT) {
        this.containerHT = containerHT;
        this.containerStyle = window.getComputedStyle(this.containerHT);
        this.titleHT.push(...titleHT);

        /*this.titleHT.forEach(ele=>{
            this.callEvents(ele);
        });*/
        this.callEvents();
    }
    /**
     * 
     * @param {HTMLElement} ele
     * @returns {dragMode}
     */
    getMode(ele) {
        let index = this.titleHT.findIndex(s => s.contains(ele));
        if (index != -1) return dragMode.move;
        return this.resizer.getMode(ele);
    }
    Events = {
        /**
         * @param {MouseEvent} evt 
         * @returns {boolean|undefined} `true` will exit from event
         */
        onmousemove: (evt) => { },
        /**
         * @param {MouseEvent} evt 
         * @returns {boolean|undefined} `true` will exit from event
         */
        onmousedown: (evt) => { },
        /**
         * @param {MouseEvent} evt 
         * @returns {boolean|undefined} `true` will exit from event
         */
        onmouseup: (evt) => { },
        onResizeStart: new commonEvent(),
        onResizeEnd: new commonEvent(),
        onMoveStart: new commonEvent(),
        onMoveEnd: new commonEvent(),
    };
    finalRect = {
        left: 0,
        top: 0,
        width: 0,
        height: 0,
    }
    callEvents() {
        let _this = this;
        let controlRect = new Rect();
        let selectRect = new Rect();
        let rectStyles = this.resizer.rect.style;
        [...this.resizer.getResizerAr(), ...this.titleHT].on('mousedown', (evt) => {
            if (!_this.allowMove || _this.Events.onmousedown(evt) === true) return;
            let mode = _this.getMode(evt.target);
            if (mode != dragMode.none) {
                let real = _this.containerStyle,
                    cntnrPos = new Point(parseFloat(real.left), parseFloat(real.top)),
                    cntnrSize = new Size(parseFloat(real.width), parseFloat(real.height)),
                    downPos = new Point(evt.clientX, evt.clientY);
                controlRect.setBy.style(real);
                selectRect.setBy.point(controlRect);
                selectRect.size.width -= 5;
                selectRect.size.height -= 5;
                selectRect.location.x = 0;
                selectRect.location.y = 0;
                switch (mode) {
                    case dragMode.move: this.Events.onMoveStart.fire(); break;
                    default: this.Events.onResizeStart.fire(); break;
                }
                let target = evt.target;
                document.body.addEventListener('mousemove', drag, false);
                document.body.on('mouseup mouseleave', function () {
                    document.body.removeEventListener('mousemove', drag, false);

                    // console.log(_this.finalRect);
                    switch (mode) {
                        case dragMode.move: _this.Events.onmouseup(evt); _this.Events.onMoveEnd.fire(); break;
                        case dragMode.none: break;
                        default:
                            _this.finalRect.left = controlRect.left;
                            _this.finalRect.top = controlRect.top;
                            _this.finalRect.width = controlRect.width;
                            _this.finalRect.height = controlRect.height;
                            _this.containerHT.style.left = controlRect.left + "px";
                            _this.containerHT.style.top = controlRect.top + "px";
                            _this.containerHT.style.width = controlRect.width + "px";
                            _this.containerHT.style.height = controlRect.height + "px";
                            _this.Events.onResizeEnd.fire();
                            break;
                    }
                    _this.resizer.rect.style.display = "none";
                    mode = dragMode.none;
                }, false);
                /** @param {MouseEvent} evt */
                function drag(evt) {
                    if (_this.Events.onmousemove(evt) === true) return;
                    let difx = evt.clientX - downPos.x;
                    let dify = evt.clientY - downPos.y;
                    let drawRect = true;
                    switch (mode) {
                        case dragMode.move:
                            _this.containerHT.style.left = cntnrPos.x + difx + 'px';
                            _this.containerHT.style.top = cntnrPos.y + dify + 'px';

                            _this.finalRect.left = cntnrPos.x + difx;
                            _this.finalRect.top = cntnrPos.y + dify;
                            drawRect = false;
                            break;
                        case dragMode.left:
                            controlRect.left = cntnrPos.x + difx;
                            controlRect.width = cntnrSize.width - difx;
                            selectRect.left = difx;
                            selectRect.width = cntnrSize.width - difx;
                            break;
                        case dragMode.top:
                            controlRect.top = cntnrPos.y + dify;
                            controlRect.height = cntnrSize.height - dify;
                            selectRect.top = dify;
                            selectRect.height = cntnrSize.height - dify;
                            break;
                        case dragMode.bottom:
                            controlRect.height = cntnrSize.height + dify;
                            selectRect.height = cntnrSize.height + dify;
                            break;
                        case dragMode.right:
                            controlRect.width = cntnrSize.width + difx;
                            selectRect.width = cntnrSize.width + difx;
                            break;
                        case dragMode.topleft:
                            controlRect.top = cntnrPos.y + dify;
                            controlRect.left = cntnrPos.x + difx;
                            controlRect.width = cntnrSize.width - difx;
                            controlRect.height = cntnrSize.height - dify;
                            selectRect.top = dify;
                            selectRect.left = difx;
                            selectRect.width = cntnrSize.width - difx;
                            selectRect.height = cntnrSize.height - dify;
                            break;
                        case dragMode.topright:
                            controlRect.top = cntnrPos.y + dify;
                            controlRect.height = cntnrSize.height - dify;
                            controlRect.width = cntnrSize.width + difx;
                            selectRect.top = dify;
                            selectRect.height = cntnrSize.height - dify;
                            selectRect.width = cntnrSize.width + difx;
                            break;
                        case dragMode.bottomleft:
                            controlRect.height = cntnrSize.height + dify;
                            controlRect.left = cntnrPos.x + difx;
                            controlRect.width = cntnrSize.width - difx;
                            selectRect.height = cntnrSize.height + dify;
                            selectRect.left = difx;
                            selectRect.width = cntnrSize.width - difx;
                            break;
                        case dragMode.bottomright:
                            controlRect.height = cntnrSize.height + dify;
                            controlRect.width = cntnrSize.width + difx;
                            selectRect.height = cntnrSize.height + dify;
                            selectRect.width = cntnrSize.width + difx;
                            break;
                    }
                    if (drawRect) {
                        let styleText = `
                            left:${selectRect.left}px;
                            top:${selectRect.top}px;
                            width:${selectRect.width}px;
                            height:${selectRect.height}px;display:block;`;
                        // console.log(_this.resizer.rect);
                        _this.resizer.rect.style = styleText;

                    }
                };
            }
        }, false);
    }
}
module.exports = { dragUc }