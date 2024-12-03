import { CommonEvent } from "ucbuilder/global/commonEvent";
import { Point, Rect, Size } from "ucbuilder/global/drawing/shapes";
import { Usercontrol } from "ucbuilder/Usercontrol";
import { ResizeMoveEvent } from "ucbuilder/global/draging/ResizeMoveEvent";
export enum ResizeMode {
    none = 0,
    left = 1,
    top = 2,
    right = 3,
    bottom = 4,
    topleft = 5,
    topright = 6,
    bottomleft = 7,
    bottomright = 8,
}
export class objectResizer {


    resizer = {
        left: document.createElement("resizer"),
        top: document.createElement("resizer"),
        right: document.createElement("resizer"),
        bottom: document.createElement("resizer"),
        topleft: document.createElement("corner"),
        topright: document.createElement("corner"),
        bottomleft: document.createElement("corner"),
        bottomright: document.createElement("corner"),
        rect: document.createElement("resizer"),
        cssDisplay: (val: "block" | "none") => {
            let res = this.resizer;
            res.top.style.display =
                res.right.style.display =
                res.bottom.style.display =
                res.left.style.display =
                res.topleft.style.display =
                res.topright.style.display =
                res.bottomleft.style.display =
                res.bottomright.style.display =
                res.rect.style.display = val;
        },
        setRoles: () => {
            let res = this.resizer;
            res.left.setAttribute("role", "left");
            res.top.setAttribute("role", "top");
            res.right.setAttribute("role", "right");
            res.bottom.setAttribute("role", "bottom");
            res.topleft.setAttribute("role", "topleft");
            res.topright.setAttribute("role", "topright");
            res.bottomleft.setAttribute("role", "bottomleft");
            res.bottomright.setAttribute("role", "bottomright");
            res.rect.setAttribute("role", "drawSelection");
        },
        getArray: () => {
            let res = this.resizer;
            return [res.left, res.top, res.right, res.bottom, res.topleft,
            res.topright, res.bottomright,
            res.bottomleft];
        },
        getMode: (ele: HTMLElement): ResizeMode => {
            let res = this.resizer;
            switch (ele.stamp()) {
                case res.top.stamp(): return ResizeMode.top;
                case res.left.stamp(): return ResizeMode.left;
                case res.right.stamp(): return ResizeMode.right;
                case res.bottom.stamp(): return ResizeMode.bottom;
                case res.topleft.stamp(): return ResizeMode.topleft;
                case res.topright.stamp(): return ResizeMode.topright;
                case res.bottomleft.stamp(): return ResizeMode.bottomleft;
                case res.bottomright.stamp(): return ResizeMode.bottomright;
                default: return ResizeMode.none;
            }
        }
    }

    private _containerHT: HTMLElement = undefined;
    public get containerHT(): HTMLElement {
        return this._containerHT;
    }
    public set containerHT(value: HTMLElement) {
        this._containerHT = value;
        this.containerStyle = window.getComputedStyle(value);
        let res = this.resizer;
        let ar = res.getArray();
        value.append(...ar, res.rect);
        this.rectStyles = this.resizer.rect.style;


    }
    rectStyles: CSSStyleDeclaration;
    containerStyle: CSSStyleDeclaration;

    passElement = (uc: Usercontrol = undefined) => {
        let res = this.resizer;
        uc.ucExtends.passElement(
            [res.left, res.top, res.right, res.bottom, res.topleft,
            res.topright, res.bottomright,
            res.bottomleft, res.rect]);
    }

    private isActive = false;
    activate() {
        if (this.isActive) return;
        this.isActive = true;
        let res = this.resizer;
        let ar = res.getArray();
        this.containerHT.append(...ar, res.rect);
        this.dragmoveEvent.push(...ar);
        this.dragmoveEvent.Events.mousedown.on(this.mousedown_event);
        this.dragmoveEvent.Events.mousemove.on(this.mousemove_event);
        this.dragmoveEvent.Events.mouseup.on(this.mouseup_event);
    }
    deactive() {
        let res = this.resizer;
        let ar = res.getArray();
        for (let i = 0; i < ar.length; i++) ar[i].remove();
        res.rect.remove();
        this.dragmoveEvent.remove(...ar);
        this.dragmoveEvent.Events.mousedown.off(this.mousedown_event);
        this.dragmoveEvent.Events.mousemove.off(this.mousemove_event);
        this.dragmoveEvent.Events.mouseup.off(this.mouseup_event);
        this.isActive = false;
    }
    Events = {
        onResizeStart: new CommonEvent<() => void>(),
        onResizeEnd: new CommonEvent<() => void>(),
    };

    resizerHTs: HTMLElement[] = [];
    getMode(ele: HTMLElement): ResizeMode {
        let index = this.resizerHTs.findIndex(s => s.contains(ele));
        //if (index != -1) return DragMode.move;
        return this.resizer.getMode(ele);
    }
    dragmoveEvent: ResizeMoveEvent;
    constructor(dragmoveEvent: ResizeMoveEvent) {
        this.dragmoveEvent = dragmoveEvent;
        this.resizer.setRoles();
        let ar = this.resizer.getArray();
        this.resizerHTs.push(...ar);

    }

    finalRect = {
        left: 0,
        top: 0,
        width: 0,
        height: 0,
    }
    private pvtOpt = {
        selectRect: new Rect(),
        controlRect: new Rect(),
        conainerPt: new Point(),
        conainerSz: new Size(),
        downPt: new Point(),
        mode: ResizeMode.none as ResizeMode,
    }
    mousedown_event = (evt: MouseEvent) => {
        let _this = this;
        let rsOpt = this.pvtOpt;
        rsOpt.mode = _this.getMode(evt.target as HTMLElement);
        if (rsOpt.mode != ResizeMode.none) {
            let real = _this.containerStyle;
            rsOpt.conainerPt = new Point(parseFloat(real.left), parseFloat(real.top));
            rsOpt.conainerSz = new Size(parseFloat(real.width), parseFloat(real.height));
            rsOpt.downPt = new Point(evt.clientX, evt.clientY);
            rsOpt.controlRect.setBy.style(real);
            rsOpt.selectRect.setBy.rect(rsOpt.controlRect);
            rsOpt.selectRect.size.width -= 5;
            rsOpt.selectRect.size.height -= 5;
            rsOpt.selectRect.location.x = 0;
            rsOpt.selectRect.location.y = 0;
            this.Events.onResizeStart.fire();
        }
    }
    mousemove_event = (evt: MouseEvent) => {
        let pvtOpt = this.pvtOpt;
        let downPos = pvtOpt.downPt;
        let cntnrPos = pvtOpt.conainerPt;
        let cntnrSize = pvtOpt.conainerSz;
        let selectRect = pvtOpt.selectRect;
        let controlRect = pvtOpt.controlRect;
        let difx = evt.clientX - downPos.x;
        let dify = evt.clientY - downPos.y;

        let drawRect = true;
        switch (this.pvtOpt.mode) {
            /*case DragMode.move:
                _this.containerHT.style.left = cntnrPos.x + difx + 'px';
                _this.containerHT.style.top = cntnrPos.y + dify + 'px';

                _this.finalRect.left = cntnrPos.x + difx;
                _this.finalRect.top = cntnrPos.y + dify;
                drawRect = false;
                break;*/
            case ResizeMode.left:
                controlRect.left = cntnrPos.x + difx;
                controlRect.width = cntnrSize.width - difx;
                selectRect.left = difx;
                selectRect.width = cntnrSize.width - difx;
                break;
            case ResizeMode.top:
                controlRect.top = cntnrPos.y + dify;
                controlRect.height = cntnrSize.height - dify;
                selectRect.top = dify;
                selectRect.height = cntnrSize.height - dify;
                break;
            case ResizeMode.bottom:
                controlRect.height = cntnrSize.height + dify;
                selectRect.height = cntnrSize.height + dify;
                break;
            case ResizeMode.right:
                controlRect.width = cntnrSize.width + difx;
                selectRect.width = cntnrSize.width + difx;
                break;
            case ResizeMode.topleft:
                controlRect.top = cntnrPos.y + dify;
                controlRect.left = cntnrPos.x + difx;
                controlRect.width = cntnrSize.width - difx;
                controlRect.height = cntnrSize.height - dify;
                selectRect.top = dify;
                selectRect.left = difx;
                selectRect.width = cntnrSize.width - difx;
                selectRect.height = cntnrSize.height - dify;
                break;
            case ResizeMode.topright:
                controlRect.top = cntnrPos.y + dify;
                controlRect.height = cntnrSize.height - dify;
                controlRect.width = cntnrSize.width + difx;
                selectRect.top = dify;
                selectRect.height = cntnrSize.height - dify;
                selectRect.width = cntnrSize.width + difx;
                break;
            case ResizeMode.bottomleft:
                controlRect.height = cntnrSize.height + dify;
                controlRect.left = cntnrPos.x + difx;
                controlRect.width = cntnrSize.width - difx;
                selectRect.height = cntnrSize.height + dify;
                selectRect.left = difx;
                selectRect.width = cntnrSize.width - difx;
                break;
            case ResizeMode.bottomright:
                controlRect.height = cntnrSize.height + dify;
                controlRect.width = cntnrSize.width + difx;

                selectRect.height = cntnrSize.height + dify;
                selectRect.width = cntnrSize.width + difx;
                break;
            default: drawRect = false; break;
        }
        if (drawRect) {
            let styleText = `
                left:${selectRect.left}px;
                top:${selectRect.top}px;
                width:${selectRect.width}px;
                height:${selectRect.height}px; display:block;`;

            this.resizer.rect.setAttribute('style', styleText);
        }
    }
    mouseup_event = (evt: MouseEvent) => {
        let controlRect = this.pvtOpt.controlRect;
        switch (this.pvtOpt.mode) {
            // case DragMode.move: _this.Events.onmouseup(evt); _this.Events.onMoveEnd.fire(); break;
            case ResizeMode.none: break;
            default:
                this.finalRect.left = controlRect.left;
                this.finalRect.top = controlRect.top;
                this.finalRect.width = controlRect.width;
                this.finalRect.height = controlRect.height;
                this.containerHT.style.left = controlRect.left + "px";
                this.containerHT.style.top = controlRect.top + "px";
                this.containerHT.style.width = controlRect.width + "px";
                this.containerHT.style.height = controlRect.height + "px";
                this.Events.onResizeEnd.fire();
                break;
        }
        this.resizer.rect.style.display = "none";
        this.pvtOpt.mode = ResizeMode.none;
    };
}