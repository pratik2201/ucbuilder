import { propOpt, controlOpt, objectOpt, strOpt } from "ucbuilder/build/common";
import { keyBoard } from "ucbuilder/global/hardware/keyboard";
import { CommonEvent } from "ucbuilder/global/commonEvent";

interface TabIndexRow {
    container: HTMLElement;
    element: HTMLElement;
    tIndex: number;
}
type TabStatus = 'backword' | 'forward' | 'none';
export interface TabContainerClearNode { target: HTMLElement, callback: () => boolean | void }
class TabIndexManager {
    static audioCtx = new (window.AudioContext)();
    static gainNode = this.audioCtx.createGain();
    static stopFurther(e: Event) {
        if (e == undefined) return;
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
    }

    static beep() {
        console.log('music please');


        this.gainNode.gain.value = 0.35;
        let oscillator = this.audioCtx.createOscillator();
        oscillator.connect(this.gainNode);
        oscillator.frequency.value = 147;
        oscillator.type = 'sawtooth';

        oscillator.start();
        let _this = this;
        setTimeout(
            function () {
                oscillator.stop();
            },
            31
        );
    }
    /*static beep() {
        console.log('music please');
        var snd = new Audio("data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");  
        snd.play();
    }*/
    mainHT: HTMLElement | undefined;
    private static _music = false;
    public static get music() {
        return TabIndexManager._music;
    }
    public static set music(value) {
        TabIndexManager._music = value;
    }
    private static _breakTheLoop = false;
    public static get breakTheLoop() {
        return this._breakTheLoop;
    }
    public static set breakTheLoop(value) {
        this._breakTheLoop = value;
    }
    static continueusMove(container: HTMLElement, { startAt = undefined, stopAt = undefined }: { startAt?: HTMLElement, stopAt?: HTMLElement }) {
        TabIndexManager.breakTheLoop = false;
        let callback: TabContainerClearNode = {
            target: container, callback: () => { TabIndexManager.breakTheLoop = true; return true; }
        };
        this.Events.onContainerBottomLeave.push(callback);
        let activeElement = startAt == undefined ? container : startAt;
        do {
            this.moveNext(activeElement);
            if (TabIndexManager.breakTheLoop) { this.beep(); break; }
            if (activeElement === document.activeElement) TabIndexManager.breakTheLoop = true;
            activeElement = document.activeElement as HTMLElement;
            if (activeElement === stopAt) TabIndexManager.breakTheLoop = true;
        } while (!TabIndexManager.breakTheLoop);
        TabIndexManager.breakTheLoop = false;
        this.Events.onContainerBottomLeave.RemoveMultiple(callback);
    }

    constructor() { }
    static Events = {

        onContainerTopLeave: [] as TabContainerClearNode[],
        onContainerTopEnter: [] as TabContainerClearNode[],
        onContainerBottomLeave: [] as TabContainerClearNode[],
        onContainerBottomEnter: [] as TabContainerClearNode[],

        //onContainerClear:new CommonEvent<(element:HTMLElement)=>{}>()

    }
    static status: TabStatus = 'none';
    private static isInited = false;
    static init(/*mainHT: HTMLElement*/) {
        /*this.mainHT = mainHT;*/
        if (this.isInited) return;
        this.isInited = true;
        let htEle: HTMLElement | undefined;
        let tIndex: number;
        this.gainNode.connect(this.audioCtx.destination);


        document.addEventListener('keydown', (ev: KeyboardEvent) => {
            let code = ev.keyCode;
            switch (code) {
                case keyBoard.keys.enter:
                    //console.log(Object.getPrototypeOf(ev.target).constructor.name);
                    if (Object.getPrototypeOf(ev.target).constructor.name == 'HTMLTextAreaElement') {
                        let ele = ev.target as HTMLTextAreaElement;
                        let _val = ele.value;
                        if (_val != '' && _val == ele.getSelectedValue()) {
                        } else {
                            if (!_val.endsWith('\n')) break;
                            else ele.value = _val.slice(0, -1);
                        }
                    }
                case keyBoard.keys.tab:
                    // console.log(['before', this.breakTheLoop]);                    
                    if (!ev.shiftKey) {
                        this.status = 'forward';
                        this.moveNext(ev.target as HTMLElement);
                    } else {
                        this.status = 'backword';
                        this.movePrev(ev.target as HTMLElement);
                    }                    
                    this.status = 'none';
                    ev.preventDefault();
                    break;
                case keyBoard.keys.left:
                    htEle = ev.target as HTMLElement;
                    tIndex = this.getTindex(htEle);
                    if (tIndex != null) {
                        if (htEle.nodeName.match(this.allowNodePattern) == null &&
                            htEle.getAttribute("contenteditable") != "true") {
                            this.movePrev(htEle);
                            ev.preventDefault();
                        }
                    }
                    break;
                case keyBoard.keys.right:
                    htEle = ev.target as HTMLElement;
                    tIndex = this.getTindex(htEle);
                    if (tIndex != null) {
                        if (htEle.nodeName.match(this.allowNodePattern) == null &&
                            htEle.getAttribute("contenteditable") != "true") {
                            this.moveNext(htEle);
                            ev.preventDefault();
                        }
                    }
                    break;
            }
            this.breakTheLoop = false;
        });

        /* document.addEventListener("mousedown", (ev: MouseEvent) => {
             htEle = ev.target as HTMLElement;
             tIndex = this.getTindex(htEle);
             if (tIndex != null) {
                 if (htEle.nodeName.match(this.allowNodePattern) == null &&
                     htEle.getAttribute("contenteditable") != "true") {
                     this.moveNext(htEle, tIndex);
                     ev.preventDefault();
                 }
             }
         });*/
    }


    static movePrev(target: HTMLElement, goAhead: boolean = false) {
        let _this = this;
        let tIndex = parseInt(target.getAttribute('x-tabindex'));
        if (tIndex == null) return;
        if (goAhead) {
            tIndex--;
            if (tIndex == -1) { //  IF REACHED TO 0 TAB INDEX;
                let parent = this.getDirectParent(target);
                let evt = this.Events.onContainerTopLeave;
                let _obj = evt.find(s => s.target == parent);
                if (_obj != undefined) if (_obj.callback() === true) return;
                this.movePrev(parent, true);
            } else if (tIndex < -1) {  //  IF IN THE AIR    ,-)
            } else {
                let parent = this.getDirectParent(target);
                let ele = this.getDirectElement(parent, tIndex);
                if (this.isFocusableElement(ele)) {   // IF PREVIOUS ELEMENT IS TEXTBOX
                    this.focusTo(ele);
                } else {
                    if (ele !== undefined)
                        this.movePrev(ele);
                    else {
                        //let ele = this.getDirectParent(parent);
                        let evt = this.Events.onContainerTopLeave;
                        let _obj = evt.find(s => s.target == parent);
                        if (_obj != undefined) if (_obj.callback() === true) return;
                        this.movePrev(parent, true);
                    }
                }
            }
        } else {
            let childLastElement = this.getLastElement(target);
            if (childLastElement == undefined) {  //  IF NO CHILD TAB INDEX AVALABLE
                this.movePrev(target, true);
            } else { //  IF CHILD TAB INDEX EXIST
                let evt = this.Events.onContainerBottomEnter;
                let _obj = evt.find(s => s.target == target);
                if (_obj != undefined) if (_obj.callback() === true) return;
                if (this.isFocusableElement(childLastElement)) {  //  IF LAST ELEMENT IS TEXTBOX
                    this.focusTo(childLastElement);
                } else {     //  MOVE TO PREVIOUS WITH CHECK
                    this.movePrev(childLastElement);
                }
            }
        }
    }
    static getLastElement(container: HTMLElement): HTMLElement {
        let i = 0;
        let lastEle: HTMLElement;
        do {
            let ele = this.getDirectElement(container, i);
            if (ele == undefined) break;
            lastEle = ele;
            i++;
        } while (true);
        return lastEle;
    }

    static moveNext(target: HTMLElement, goAhead: boolean = false) {
        let _this = this;
        let tIndex = parseInt(target.getAttribute('x-tabindex'));
        if (tIndex == null) return;
        let childFirstElement = goAhead ? undefined : this.getDirectElement(target, 0);
        if (childFirstElement != undefined) { // IF FIRST CHILD TAB-INDEX EXIST
            let evt = this.Events.onContainerTopEnter;
            let _obj = evt.find(s => s.target == childFirstElement);
            if (_obj != undefined) if (_obj.callback() === true) return;

            if (this.isFocusableElement(childFirstElement)) { // IF FIRST CHILD IS TEXTBOX
                this.focusTo(childFirstElement);
            } else {   // GO TO NEXT TAB-INDEX
                this.moveNext(childFirstElement);
            }
        } else {       // GO TO NEXT TAB-INDEX
            tIndex++;
            let parent = this.getDirectParent(target);
            if (parent == null) return;
            let ele = this.getDirectElement(parent, tIndex);
            if (this.isFocusableElement(ele)) {   // IF NEXT ELEMENT IS TEXTBOX
                this.focusTo(ele);
            } else {    // IF NEXT ELEMENT HAS CHILD ELEMENT
                if (ele != undefined) // IF NEXT ELEMENT EXIST      
                    this.moveNext(ele);
                else { // ELSE
                    let evt = this.Events.onContainerBottomLeave;
                    let _obj = evt.find(s => s.target == parent);
                    if (_obj != undefined) if (_obj.callback() === true) return;
                    this.moveNext(parent, true);   // GO TO PARENT CONTAINER AND MOVE NEXT TAB-INDEX
                }
            }
        }
    }

    static getDirectParent(element) { return this.getClosest(element); }
    static getDirectElement(container: HTMLElement, index: number): HTMLElement {
        return (Array.from(container.querySelectorAll(`[x-tabindex="${index}"]`)).filter(s => container.is(this.getClosest(s))) as HTMLElement[])[0];
    }

    static focusTo(htele: HTMLElement) {
        if (this.breakTheLoop) {
            if (this.music)
                this.beep();
            this.music = this.breakTheLoop = false;
            return;
        }
        htele.focus();
        controlOpt.selectAllText(htele);
    }

    static getTindex(target: HTMLElement): number | null {
        if (target == undefined) return null;
        let tIndex = target.getAttribute('x-tabindex');
        return (tIndex == null) ? null : parseInt(tIndex);
    }

    static getClosest(target: HTMLElement | Element): HTMLElement | null {
        //if (target.parentElement == undefined) debugger;
        return target.parentElement?.closest("[x-tabindex]");
    }

    static allowNodePattern: RegExp = /INPUT|SELECT|BUTTON|TEXTAREA/i;

    static isFocusableElement(htEle: HTMLElement): boolean {
        let _this = this;
        return isElementFocusable(htEle as HTMLInputElement);
        /*if (htEle == undefined) return false;
        let style = window.getComputedStyle(htEle);
        if (style.pointerEvents == "none") return false;
        if (htEle.nodeName.match(this.allowNodePattern) != null
            || htEle.getAttribute("contenteditable") == "true"
            || (!htEle.hasAttribute("disabled") && !htEle.hasAttribute("inert"))) {
            return true;
        } else {
            return false;
        }*/
        function isElementFocusable(element: HTMLInputElement) {
            if (element == undefined) return false;
            let andCondition = (!element.disabled && element.offsetWidth > 0 && element.offsetHeight > 0);
            let orCondition = (element.nodeName.match(_this.allowNodePattern) != null || element.getAttribute('contenteditable') == 'true');
            return andCondition && orCondition;
            /*element.tabIndex !== -1 && */
        }
    }

    static isDirectClose(child: HTMLElement, container: HTMLElement): boolean {
        return container.is(child.parentElement.closest(`[x-tabindex]`));
    }
}

const elementState = Object.freeze({
    Undefined: 0,
    Editable: 1,
    Disabled: 2,
    Container: 3,
});

export { TabIndexManager };