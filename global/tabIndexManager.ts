import { propOpt, controlOpt, objectOpt, strOpt } from "ucbuilder/build/common";
import { keyBoard } from "ucbuilder/global/hardware/keyboard";

interface TabIndexRow {
    container: HTMLElement;
    element: HTMLElement;
    tIndex: number;
}

class TabIndexManager {
    mainHT: HTMLElement | undefined;

    constructor() { }

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
        this.movePrev(target, tIndex);
    }

    movePrev(target: HTMLElement, tIndex: number = -1) {
        let _this = this;
        if (tIndex == null) return;
        if (tIndex == -1) {
            let container = _this.getClosest(target);
            tIndex = this.getTindex(container);
            let pcontainer = _this.getClosest(container);
            return this.movePrev(pcontainer, tIndex - 1);
        } else {
            let container = target;
            let prevRow = this.getChildIfExist(container, tIndex, true);
            if (prevRow.element != undefined) {
                if (this.isFocusableElement(prevRow.element))
                    this.focusTo(prevRow.element);
            }
            else {
                container = _this.getClosest(target);
                prevRow = this.getChildIfExist(container, tIndex, true);
                if (_this.isFocusableElement(prevRow.element))
                    this.focusTo(prevRow.element);
                else {

                    tIndex = _this.getTindex(prevRow.element)-1;
                    _this.movePrev(prevRow.element, tIndex);

                    // _this.movePrev(prevRow.element,tIndex);
                }
            }
        }

        function doProcessPrev(ele: HTMLElement, tIndex: number) {
            if (tIndex == null) return;
            tIndex++;
            let container = _this.getClosest(ele);

            if (container == null) {
                let index = _this.getTindex(ele);
                index = Math.max(0, index);
                _this.moveNext(ele, index);
                return;
            }

            let nextRow = _this.getChildIfExist(container, tIndex);
            if (nextRow.element != undefined)
                _this.moveNext(nextRow.element, nextRow.tIndex);
        }


    }

    keymoveNext(target: HTMLElement) {
        let _this = this;
        let tIndex = this.getTindex(target);
        if (tIndex == null) return;
        tIndex++;
        this.moveNext(target, tIndex);
    }

    moveNext(target: HTMLElement, tIndex: number = -1) {
        let _this = this; 
        if (tIndex == null) return;
        let row = this.getChildIfExist(target, 0);  //  CHECK IF `target` IS CONTAINER ELEMENT
        let container: HTMLElement | undefined;

        if (row.element == null) {   //  IF `target` IS NOT CONTAINER ELEMENT
            container = this.getClosest(target);
            if (container == null) return;
            let nextRow = this.getChildIfExist(container, tIndex);
            if (nextRow.element != undefined) {
                if (this.isFocusableElement(nextRow.element)) {
                    this.focusTo(nextRow.element);
                } else {
                    doProcessNext(nextRow.element, nextRow.tIndex);
                }
            }
            else {
                //this.moveNext(nextRow.container, this.getTindex(nextRow.container)+1);
                doProcessNext(nextRow.container, this.getTindex(nextRow.container));
            }
        } else { //  IF `target` IS CONTAINER ELEMENT
            if (this.isFocusableElement(row.element)) {
                this.focusTo(row.element);
            } else {
                this.moveNext(row.element, row.tIndex+1);
                //doProcessNext(row.element, row.tIndex);
            }
        }

        function doProcessNext(ele: HTMLElement, tIndex: number) {
            if (tIndex == null) return;
            tIndex++;
            let container = _this.getClosest(ele);

            if (container == null) {
                let index = _this.getTindex(ele);
                index = Math.max(0, index);
                _this.moveNext(ele, index);
                return;
            }

            let nextRow = _this.getChildIfExist(container, tIndex);
            if (nextRow.element != undefined) {
                _this.moveNext(nextRow.element,nextRow.tIndex);
            } else 
                _this.moveNext(container,_this.getTindex(container)+1);
        }
    }

    focusTo(htele: HTMLElement) {
        htele.setAttribute('tabindex', '0');
        console.log('focusTo');
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

    getChildIfExist(container: HTMLElement, index: number, giveMeLastElement: boolean = false): TabIndexRow {
        let _this = this;
        let rtrn: TabIndexRow = {
            container: container,
            element: undefined,
            tIndex: -1,
        };

        if (container == null) return rtrn;

        let elements: HTMLElement[] = [];
        if (!giveMeLastElement) {
            elements = Array.from(container.querySelectorAll(`[x-tabindex="${index}"]`)).filter(s => container.is(_this.getClosest(s))) as HTMLElement[]; /*   , [x-tabindex] *     */
            for (let i = 0; i < elements.length; i++) {
                let ele = elements[i];
                let sub = this.getChildIfExist(ele, 0);
                if (sub.element == undefined) {
                    //let closest = ele.parentElement.closest('[x-tabindex]');
                    //if (closest.is(container)) {
                    rtrn.element = ele;
                    rtrn.tIndex = this.getTindex(ele);
                    break;
                    //} 
                }
                else return sub;
            }
            return rtrn;
        } else {
            rtrn = getMaxTabIndexElement(container, index);
            if (rtrn.container != null) {
                if (!rtrn.container.is(container)) {
                    rtrn.element = rtrn.container;
                    rtrn.container = this.getClosest(rtrn.container);
                    rtrn.tIndex = this.getTindex(rtrn.container);
                }
            }
            return rtrn;
        }

        function getMaxTabIndexElement(container: HTMLElement, index: number, elements?: HTMLElement[], calltime: number = 0): TabIndexRow {
            calltime++;
            let maxRtrn: TabIndexRow = {
                container: container,
                element: undefined,
                tIndex: -1,
            };

            if (container == null) return maxRtrn;
            if (elements == undefined)
                elements = Array.from(container.querySelectorAll(`[x-tabindex="${index}"]`));
            else if (calltime == 2)
                elements = Array.from(container.querySelectorAll(`[x-tabindex]`));

            for (let i = 0; i < elements.length; i++) {
                let ele = elements[i];
                if (_this.isDirectClose(ele, container)) {
                    elements.splice(index, 1);
                    let tIndex = _this.getTindex(ele);
                    if (tIndex >= maxRtrn.tIndex) {
                        maxRtrn.tIndex = tIndex;
                        maxRtrn.element = ele;
                        maxRtrn.container = container;
                    }
                }
            }

            if (maxRtrn.element != undefined) return getMaxTabIndexElement(maxRtrn.element, maxRtrn.tIndex, elements, calltime);
            return maxRtrn;
        }
    }

    allowNodePattern: RegExp = /INPUT|SELECT|BUTTON|TEXTAREA/i;

    isFocusableElement(htEle: HTMLElement): boolean {
        return isElementFocusable(htEle);
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
        function isElementFocusable(element) {
            return element != undefined && (!element.disabled && element.offsetWidth > 0 && element.offsetHeight > 0 || element.hasAttribute('tabindex') as boolean);
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