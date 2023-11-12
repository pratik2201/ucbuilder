const {  propOpt, controlOpt, objectOpt, strOpt } = require("@ucbuilder:/build/common");
const { keyBoard } = require("@ucbuilder:/global/hardware/keyboard");

const tabIndexRow = {
    /** @type {HTMLElement}  */
    container: undefined,
    /** @type {HTMLElement}  */
    element: undefined,
    /** @type {number}  */
    tIndex: -1,
};
class tabIndexManager {
    constructor() {
    }
    /** @type {HTMLElement}  */
    mainHT = undefined;
    /**  @param {HTMLElement} mainHT */
    init(mainHT) {
        this.mainHT = mainHT;
        /** @type {HTMLElement}  */
        let htEle = undefined;
        /** @type {number}  */
        let tIndex = -1;
        //this.mainHT.setAttribute('x-tabindex', 0);
        document.addEventListener('keydown', (ev) => {

            switch (ev.keyCode) {
                case keyBoard.keys.tab:
                    if (!ev.shiftKey) this.keymoveNext(ev.target);
                    else this.keymovePrev(ev.target);
                    ev.preventDefault();
                    break;
                case keyBoard.keys.left:
                    /** @type {HTMLElement}  */
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
                case keyBoard.keys.right:
                    /** @type {HTMLElement}  */
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
            /** @type {HTMLElement}  */
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
    /**
    * 
    * @param {HTMLElement} target 
    */
    keymovePrev(target) {
        let _this = this;
        let tIndex = this.getTindex(target);
        if (tIndex == null) return;
        tIndex--;
        this.movePrev(target, tIndex);
    }

    /**
     * 
     * @param {HTMLElement} target 
     * @param {number} tIndex
     */
    movePrev(target, tIndex = -1) {
        let _this = this;
        if (tIndex == null) return;
        if (tIndex == -1) {   //  IF NEED TO BACK TO PREVIOUS CONTAINER
            let container = _this.getClosest(target);
            tIndex = this.getTindex(container);
            let pcontainer = _this.getClosest(container);
            return this.movePrev(pcontainer, tIndex - 1);
        } else {
            let container = target;// _this.getClosest(target);  
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
    /**
    * 
    * @param {HTMLElement} target 
    */
    keymoveNext(target) {
        let _this = this;
        let tIndex = this.getTindex(target);
        if (tIndex == null) return;
        tIndex++;
        this.moveNext(target, tIndex);
    }

    /**
     * 
     * @param {HTMLElement} target 
     * @param {number} tIndex
     */
    moveNext(target, tIndex = -1) {
        let _this = this;
        //debugger;
        if (tIndex == null) return;
        let row = this.getChildIfExist(target, 0);
        let container = undefined;


        if (row.element == null) {  //  if current has no child element with `x-tabindex`
            container = this.getClosest(target);
            if (container == null) return;
            let nextRow = this.getChildIfExist(container, tIndex);
            if (nextRow.element != undefined) {
                //console.log(this.isFocusableElement(nextRow.element));
                if (this.isFocusableElement(nextRow.element)) {

                    this.focusTo(nextRow.element);
                } else {
                    doProcessNext(nextRow.element, nextRow.tIndex);
                }
            }
            else {
                doProcessNext(nextRow.container, this.getTindex(nextRow.container));
            }
        } else {
            if (this.isFocusableElement(row.element)) {

                this.focusTo(row.element);
            } else doProcessNext(row.element, row.tindex);
        }
        function doProcessNext(ele, tIndex) {
            //let tIndex = _this.getTindex(ele);
            if (tIndex == null) return;
            tIndex++;
            let container = _this.getClosest(ele);

            if (container == null) {
                let index = _this.getTindex(ele);
                index = Math.max(0, index);
                _this.moveNext(ele, index);
                return;
            }
            //console.log(container);  
            //console.log(tIndex);  
            let nextRow = _this.getChildIfExist(container, tIndex);
            if (nextRow.element != undefined)
                _this.moveNext(nextRow.element, nextRow.tIndex); //nextRow.container
        }
    }




    /** @param {HTMLElement} htele */
    focusTo(htele) {
        htele.setAttribute('tabindex', '0');        
        console.log('focusTo');
        //if(htele.isFocusableElement){
            //debugger;
        htele.focus();
        controlOpt.selectAllText(htele);
        //F}
    }

    /**
     * @param {HTMLElement} target 
     * @returns {number|null}
     */
    getTindex(target) {
        if (target == undefined) return null;
        let tIndex = target.getAttribute('x-tabindex');
        return (tIndex == null) ? null : parseInt(tIndex);
    }




    /**
     * @param {HTMLElement} target 
     * @returns {HTMLElement}
     */
    getClosest(target) {
        return target.parentElement.closest("[x-tabindex]");
    }
    /** 
     * @param {HTMLElement} container 
     * @returns {tabIndexRow}
     */
    getChildIfExist(container, index, giveMeLastElement = false) {
        let _this = this;
        //index = Math.max(0,index);
        let rtrn = objectOpt.clone(tabIndexRow);
        rtrn.container = container;
        //console.log(container);
        if (container == null /*|| !strOpt.getBool(container.getAttribute('x-allowtabindex'), false)*/) return rtrn;

        /** @type {container[]}  */
        let elements = [];
        if (!giveMeLastElement) {
            elements = container.find(`[x-tabindex="${index}"]`, ' [x-tabindex] *');

            for (let i = 0; i < elements.length; i++) {
                let ele = elements[i];
                //if (this.isDirectClose(ele, container)) {
                let sub = this.getChildIfExist(ele, 0);
                if (sub.element == undefined) {
                    rtrn.element = ele;
                    //rtrn.element.setAttribute('tabindex', '0');
                    rtrn.tIndex = this.getTindex(ele);
                    break;
                }
                else return sub;
                //}
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
        /**
         * 
         * @param {HTMLElement} container 
         * @param {number} index 
         * @param {container[]} elements 
         * @param {number} calltime
         * @returns 
         */
        function getMaxTabIndexElement(container, index, elements, calltime = 0) {
            calltime++;
            let maxRtrn = {
                /** @type {HTMLElement}  */
                container: container,
                /** @type {HTMLElement}  */
                element: undefined,
                /** @type {number}  */
                tIndex: -1,
            };
            if (container == null /*|| !strOpt.getBool(container.getAttribute('x-allowtabindex'), false)*/) return maxRtrn;
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


    allowNodePattern = /INPUT|SELECT|BUTTON|TEXTAREA/i;
    /**x
    * @param {HTMLElement} htEle
    * @returns {boolean}
    */
    isEditableElement(htEle) {
        /* if (htEle == undefined) return false;//elementState.Undefined;
         let style = window.getComputedStyle(htEle);
         if (style.pointerEvents == "none") return false;//elementState.Disabled;
         if (htEle.nodeName.match(this.allowNodePattern) != null ||
             htEle.getAttribute("contenteditable") == "true" 
         )*/
    }
    /**
     * 
     * @param {HTMLElement} htEle
     * @returns {boolean}
     */
    isFocusableElement(htEle) {
        //if(!htEle.hasAttribute('tabindex'))
        if (htEle == undefined) return false;//elementState.Undefined;
        let style = window.getComputedStyle(htEle);
        if (style.pointerEvents == "none") return false;//elementState.Disabled;
        if (htEle.nodeName.match(this.allowNodePattern) != null
            || htEle.getAttribute("contenteditable") == "true"
            || htEle.getAttribute("disabled") !== true
         /* || htEle.hasAttribute("tabindex")*/) {
            return true;//elementState.Editable;
        } else {
            return false;
        }
    }

    /**
     * 
     * @param {HTMLElement} child 
     * @param {HTMLElement} container 
     */
    isDirectClose(child, container) {
        return child.parentElement.closest(`[x-tabindex]`).is(container);
    }
    /**
     * param {HTMLElement} ele 
    
    getUid(ele) { return ele.getAttribute(runtimeOpt.ATTR_OF.UC.UNIQUE_STAMP); } */
    // uidAsAttr(id) { return `[${runtimeOpt.ATTR_OF.UC.UNIQUE_STAMP}="${id}"]`; }
    // getUidAsAttr(ele) { return `[${runtimeOpt.ATTR_OF.UC.UNIQUE_STAMP}="${this.getUid(ele)}"]`; }
}
const elementState = Object.freeze({
    Undefined: 0,
    Editable: 1,
    Disabled: 2,
    Container: 3,
});
module.exports = { tabIndexManager }