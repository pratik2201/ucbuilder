import { CommonEvent } from "ucbuilder/global/commonEvent";

export class ResizeMoveEvent {
   
    Events = {
        mousemoveHandled: (evt: MouseEvent) => false,
        mousedownHandled: (evt: MouseEvent) => false,
        mouseupHandled: (evt: MouseEvent) => false,
        mousemove: new CommonEvent<(e: MouseEvent) => void>(),
        mousedown: new CommonEvent<(e: MouseEvent) => void>(),
        mouseup: new CommonEvent<(e: MouseEvent) => void>(),
    }
    private bindedList: HTMLElement[] = [];
    push(...htEle: HTMLElement[]) {
        this.unbind();
        this.bindedList.push(...htEle);
        this.bindedList = this.bindedList.distinct();
        this.bind();
    }
    remove(...htEle: HTMLElement[]) {
        this.unbind(); 
        console.log(this.bindedList.RemoveMultiple(...htEle));
        this.bind();
    }
    private bind() {
        let _this = this;
        this.bindedList.forEach(s => s.addEventListener('mousedown', _this.mousedown_listner));
    }
    private unbind() {
        let _this = this;
        this.bindedList.forEach(s => s.removeEventListener('mousedown', _this.mousedown_listner));
    }
    mousedown_listner = (downEvt: MouseEvent) => {
        document.body = document.body;
        let _this = this;
        let _event = _this.Events;
        if (_event.mousedownHandled(downEvt) === true) return;
        _event.mousedown.fire([downEvt]);
        function drag(moveEvt: MouseEvent) {
            if (_event.mousemoveHandled(moveEvt) === true) return;
            _event.mousemove.fire([moveEvt]);
        }
        document.body.addEventListener('mousemove', drag, false);
        function mouseup_mouseleave_event(upEvt: MouseEvent) {
            if (_event.mousemoveHandled(upEvt) === true) return;
            document.body.removeEventListener('mousemove', drag, false);
            _event.mouseup.fire([upEvt]);
        }
        document.body.on('mouseup', mouseup_mouseleave_event);
        document.body.on('mouseleave', mouseup_mouseleave_event);
    }
}