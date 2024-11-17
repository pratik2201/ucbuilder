import { propOpt, controlOpt, objectOpt, strOpt } from "ucbuilder/build/common";
import { keyBoard } from "ucbuilder/global/hardware/keyboard";
import { CommonEvent } from "ucbuilder/global/commonEvent";

interface TabIndexRow {
    container: HTMLElement;
    element: HTMLElement;
    tIndex: number;
}
export interface TabContainerClearNode { target: HTMLElement, callback: () => boolean | void }
class TabIndexManager {
    mainHT: HTMLElement | undefined;

    constructor() { }
    Events = {

        onContainerTopLeave: [] as TabContainerClearNode[],
        onContainerTopEnter: [] as TabContainerClearNode[],
        onContainerBottomLeave: [] as TabContainerClearNode[],
        onContainerBottomEnter: [] as TabContainerClearNode[],

        //onContainerClear:new CommonEvent<(element:HTMLElement)=>{}>()

    }
    continueusMove(container: HTMLElement, { startAt = undefined, stopAt = undefined }: { startAt?: HTMLElement, stopAt?: HTMLElement }) {
        let breakTheLoop = false;
        let callback: TabContainerClearNode = {
            target: container, callback: () => { breakTheLoop = true; return true; }
        };
        this.Events.onContainerBottomLeave.push(callback);
        let activeElement = startAt==undefined?container:startAt;
        do {
            this.moveNext(activeElement);
            activeElement = document.activeElement as HTMLElement;
            if (activeElement === stopAt) breakTheLoop = true;
        } while (!breakTheLoop);
        this.Events.onContainerBottomLeave.RemoveMultiple(callback);
    }
    init(mainHT: HTMLElement) {
        this.mainHT = mainHT;
        let htEle: HTMLElement | undefined;
        let tIndex: number;

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
                            if (!_val.endsWith('\n')) return;
                            else ele.value = _val.slice(0, -1);
                        }
                    }
                case keyBoard.keys.tab:
                    if (!ev.shiftKey) this.keymoveNext(ev.target as HTMLElement);
                    else
                        this.keymovePrev(ev.target as HTMLElement);
                    ev.preventDefault();
                    break;
                case keyBoard.keys.left:
                    htEle = ev.target as HTMLElement;
                    tIndex = this.getTindex(htEle);
                    if (tIndex != null) {
                        if (htEle.nodeName.match(this.allowNodePattern) == null &&
                            htEle.getAttribute("contenteditable") != "true") {
                            this.keymovePrev(htEle);
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
                            this.keymoveNext(htEle);
                            ev.preventDefault();
                        }
                    }
                    break;
            }
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

    keymovePrev(target: HTMLElement) {
        let _this = this;
        let tIndex = this.getTindex(target);
        if (tIndex == null) return;
        tIndex--;
        this.movePrev(target/*, tIndex*/);
    }

    movePrev(target: HTMLElement, goAhead: boolean = false) {
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
    getLastElement(container: HTMLElement): HTMLElement {
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
    keymoveNext(target: HTMLElement) {
        let _this = this;
        let tIndex = this.getTindex(target);
        if (tIndex == null) return;
        tIndex++;
        this.moveNext(target/*, tIndex*/);
    }

    moveNext(target: HTMLElement, goAhead: boolean = false) {
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

    getDirectParent(element) { return this.getClosest(element); }
    getDirectElement(container: HTMLElement, index: number): HTMLElement {
        return (Array.from(container.querySelectorAll(`[x-tabindex="${index}"]`)).filter(s => container.is(this.getClosest(s))) as HTMLElement[])[0];
    }

    focusTo(htele: HTMLElement) {
        //htele.setAttribute('tabindex', '0');
        // console.log('focusTo');
        htele.focus();
        controlOpt.selectAllText(htele);
    }

    getTindex(target: HTMLElement): number | null {
        if (target == undefined) return null;
        let tIndex = target.getAttribute('x-tabindex');
        return (tIndex == null) ? null : parseInt(tIndex);
    }

    getClosest(target: HTMLElement | Element): HTMLElement | null {
        //if (target.parentElement == undefined) debugger;
        return target.parentElement?.closest("[x-tabindex]");
    }

    allowNodePattern: RegExp = /INPUT|SELECT|BUTTON|TEXTAREA/i;

    isFocusableElement(htEle: HTMLElement): boolean {
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

    isDirectClose(child: HTMLElement, container: HTMLElement): boolean {
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