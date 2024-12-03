import { Point, Size, Rect } from "ucbuilder/global/drawing/shapes";
import { ResizeMoveEvent } from "ucbuilder/global/draging/ResizeMoveEvent";
export class objectMover {
    dragmoveEvent: ResizeMoveEvent;
    constructor(dragmoveEvent: ResizeMoveEvent) {
        this.dragmoveEvent = dragmoveEvent;
    }
    finalRect = {
        left: 0,
        top: 0
    }
    private _containerHT: HTMLElement;
    public get containerHT(): HTMLElement {
        return this._containerHT;
    }
    public set containerHT(value: HTMLElement) {
        this._containerHT = value;
        this.containerStyle = window.getComputedStyle(value);
    }
    containerStyle: CSSStyleDeclaration;

    holderHT: HTMLElement[] = [];
     isActive = false;
    activate() {
        if (this.isActive) return;
        this.isActive = true;
        this.dragmoveEvent.push(...this.holderHT);
        this.dragmoveEvent.Events.mousedown.on(this.mousedown_event);
        this.dragmoveEvent.Events.mousemove.on(this.mousemove_event);
        this.dragmoveEvent.Events.mouseup.on(this.mouseup_event);
    }
    deactive() {
        this.dragmoveEvent.remove(...this.holderHT);
        this.dragmoveEvent.Events.mousedown.off(this.mousedown_event);
        this.dragmoveEvent.Events.mousemove.off(this.mousemove_event);
        this.dragmoveEvent.Events.mouseup.off(this.mouseup_event);
        this.isActive = false;
    }
    
    private pvtOpt = {
        controlRect :new Rect(),
        selectRect: new Rect(),
        conainerPt: new Point(),
        downPt: new Point(),
    }
    isMoveMode = false;
    mousedown_event = (evt: MouseEvent) => {
        let _this = this;
        let tarEle = evt.target as HTMLElement;
        this.isMoveMode = this.holderHT.indexOf(tarEle) != -1;
        if (!this.isMoveMode) return;
        let real = _this.containerStyle;
        let resOpt = _this.pvtOpt;
        resOpt.conainerPt = new Point(parseFloat(real.left), parseFloat(real.top));
        resOpt.downPt = new Point(evt.clientX, evt.clientY);
        resOpt.controlRect.setBy.style(real);
        resOpt.selectRect.setBy.rect(resOpt.controlRect);
        resOpt.selectRect.size.width -= 5;
        resOpt.selectRect.size.height -= 5;
        resOpt.selectRect.location.x = 0;
        resOpt.selectRect.location.y = 0;
    }
    mousemove_event = (evt: MouseEvent) => {
        if (!this.isMoveMode) return;
        let _this = this;
        let resOpt = _this.pvtOpt;
        let difx = evt.clientX - resOpt.downPt.x;
        let dify = evt.clientY - resOpt.downPt.y;
        let drawRect = true;
        _this.containerHT.style.left = resOpt.conainerPt.x + difx + 'px';
        _this.containerHT.style.top = resOpt.conainerPt.y + dify + 'px';
        _this.finalRect.left = resOpt.conainerPt.x + difx;
        _this.finalRect.top = resOpt.conainerPt.y + dify;
        drawRect = false;
    }
    mouseup_event = (evt: MouseEvent) => {
        if (!this.isMoveMode) return;
    }
}