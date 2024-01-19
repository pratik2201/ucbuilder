"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TabIndexManager = void 0;
const common_1 = require("ucbuilder/build/common");
const keyboard_1 = require("ucbuilder/global/hardware/keyboard");
class TabIndexManager {
    constructor() {
        this.allowNodePattern = /INPUT|SELECT|BUTTON|TEXTAREA/i;
    }
    init(mainHT) {
        this.mainHT = mainHT;
        let htEle;
        let tIndex;
        document.addEventListener('keydown', (ev) => {
            switch (ev.keyCode) {
                case keyboard_1.keyBoard.keys.tab:
                    if (!ev.shiftKey)
                        this.keymoveNext(ev.target);
                    else
                        this.keymovePrev(ev.target);
                    ev.preventDefault();
                    break;
                case keyboard_1.keyBoard.keys.left:
                    htEle = ev.target;
                    tIndex = this.getTindex(htEle);
                    if (tIndex != null) {
                        if (htEle.nodeName.match(this.allowNodePattern) == null &&
                            htEle.getAttribute("contenteditable") != "true") {
                            this.keymovePrev(htEle);
                            ev.preventDefault();
                        }
                    }
                    break;
                case keyboard_1.keyBoard.keys.right:
                    htEle = ev.target;
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
        document.addEventListener("mousedown", (ev) => {
            htEle = ev.target;
            tIndex = this.getTindex(htEle);
            if (tIndex != null) {
                if (htEle.nodeName.match(this.allowNodePattern) == null &&
                    htEle.getAttribute("contenteditable") != "true") {
                    this.moveNext(htEle, tIndex);
                    ev.preventDefault();
                }
            }
        });
    }
    keymovePrev(target) {
        let _this = this;
        let tIndex = this.getTindex(target);
        if (tIndex == null)
            return;
        tIndex--;
        this.movePrev(target, tIndex);
    }
    movePrev(target, tIndex = -1) {
        let _this = this;
        if (tIndex == null)
            return;
        if (tIndex == -1) {
            let container = _this.getClosest(target);
            tIndex = this.getTindex(container);
            let pcontainer = _this.getClosest(container);
            return this.movePrev(pcontainer, tIndex - 1);
        }
        else {
            let container = target;
            let prevRow = this.getChildIfExist(container, tIndex, true);
            if (prevRow.element != undefined) {
                if (this.isFocusableElement(prevRow.element))
                    this.focusTo(prevRow.element);
            }
            else {
                container = _this.getClosest(target);
                prevRow = this.getChildIfExist(container, tIndex, true);
                if (prevRow.element != undefined)
                    this.focusTo(prevRow.element);
            }
        }
    }
    keymoveNext(target) {
        let _this = this;
        let tIndex = this.getTindex(target);
        if (tIndex == null)
            return;
        tIndex++;
        this.moveNext(target, tIndex);
    }
    moveNext(target, tIndex = -1) {
        let _this = this;
        if (tIndex == null)
            return;
        let row = this.getChildIfExist(target, 0);
        let container;
        if (row.element == null) {
            container = this.getClosest(target);
            if (container == null)
                return;
            let nextRow = this.getChildIfExist(container, tIndex);
            if (nextRow.element != undefined) {
                if (this.isFocusableElement(nextRow.element)) {
                    this.focusTo(nextRow.element);
                }
                else {
                    doProcessNext(nextRow.element, nextRow.tIndex);
                }
            }
            else {
                doProcessNext(nextRow.container, this.getTindex(nextRow.container));
            }
        }
        else {
            if (this.isFocusableElement(row.element)) {
                this.focusTo(row.element);
            }
            else
                doProcessNext(row.element, row.tIndex);
        }
        function doProcessNext(ele, tIndex) {
            if (tIndex == null)
                return;
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
    focusTo(htele) {
        htele.setAttribute('tabindex', '0');
        console.log('focusTo');
        htele.focus();
        common_1.controlOpt.selectAllText(htele);
    }
    getTindex(target) {
        if (target == undefined)
            return null;
        let tIndex = target.getAttribute('x-tabindex');
        return (tIndex == null) ? null : parseInt(tIndex);
    }
    getClosest(target) {
        return target.parentElement.closest("[x-tabindex]");
    }
    getChildIfExist(container, index, giveMeLastElement = false) {
        let _this = this;
        let rtrn = {
            container: container,
            element: undefined,
            tIndex: -1,
        };
        if (container == null)
            return rtrn;
        let elements = [];
        if (!giveMeLastElement) {
            elements = Array.from(container.querySelectorAll(`[x-tabindex="${index}"], [x-tabindex] *`));
            for (let i = 0; i < elements.length; i++) {
                let ele = elements[i];
                let sub = this.getChildIfExist(ele, 0);
                if (sub.element == undefined) {
                    rtrn.element = ele;
                    rtrn.tIndex = this.getTindex(ele);
                    break;
                }
                else
                    return sub;
            }
            return rtrn;
        }
        else {
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
        function getMaxTabIndexElement(container, index, elements, calltime = 0) {
            calltime++;
            let maxRtrn = {
                container: container,
                element: undefined,
                tIndex: -1,
            };
            if (container == null)
                return maxRtrn;
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
            if (maxRtrn.element != undefined)
                return getMaxTabIndexElement(maxRtrn.element, maxRtrn.tIndex, elements, calltime);
            return maxRtrn;
        }
    }
    isFocusableElement(htEle) {
        if (htEle == undefined)
            return false;
        let style = window.getComputedStyle(htEle);
        if (style.pointerEvents == "none")
            return false;
        if (htEle.nodeName.match(this.allowNodePattern) != null
            || htEle.getAttribute("contenteditable") == "true"
            || htEle.getAttribute("disabled") !== 'true') {
            return true;
        }
        else {
            return false;
        }
    }
    isDirectClose(child, container) {
        return container.is(child.parentElement.closest(`[x-tabindex]`));
    }
}
exports.TabIndexManager = TabIndexManager;
const elementState = Object.freeze({
    Undefined: 0,
    Editable: 1,
    Disabled: 2,
    Container: 3,
});
