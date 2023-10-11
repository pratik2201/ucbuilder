const { commonEvent } = require("@ucbuilder:/global/commonEvent");
const { listUiSearch } = require("@ucbuilder:/global/listUiSearch");
/**
 * @typedef {import ("@ucbuilder:/Template").TemplateNode} TemplateNode
 */
class listUiHandler {
    constructor() {
        this.search = new listUiSearch(this);
    }

    OPTIONS = {
        SESSION: {
            currentIndex: -1,
            scrollTop: 0,
        },

        /** @type {DOMRectReadOnly}  */
        listSize: undefined,
        /** @type {HTMLElement}  */
        currentItem: undefined,
    }
    source = {
        _rows: [],
        get rows() {
            return this._rows;
        },
        _this: () => this,
        set rows(value) {
            this._rows = value;

            this.update();
        },
        update() {
            //this._this().length = this._rows.length;
        }
    }

    /** @type {TemplateNode}  */
    itemTemplate = undefined;



    get length() {
        return this.source.rows.length;
    }


    nodes = {
        itemSize: {
            hasSet: false,
            /** @type {number}  */
            width: 0,
            /** @type {number}  */
            height: 0,
            /** @param {HTMLElement} htEle */
            update(htEle) {
                this.hasSet = true;
                setTimeout(() => {
                    this.width = htEle.offsetWidth;
                    this.height = htEle.offsetHeight;
                    console.log(this);
                });
            }
        },
        /**
        * @param {number} index 
        * @returns {HTMLElement}
        */
        getNode: (index) => {
            return this.itemTemplate.extended.generateNode(this.source.rows[index]);
        },
        /**
        * @param {number} index 
        * @returns {HTMLElement}
        */
        prepend: (index) => {
        },
        /**
        * @param {number} index 
        * @param {boolean} replaceNode 
        * @returns {HTMLElement}
        */
        append: (index, replaceNode = false) => {
        },
        /**
           * @param {number} index 
           * @returns {HTMLElement}
           */
        update: (index) => {
            let nodes = this.nodes;
            let ele = nodes.append(index, true);
            this.setCurrentIndex(this.currentIndex);
            return ele;
        },
        clear: () => {
            this.Records.lstVWEle.innerHTML = '';
            this.Events.onClearContainer.fire();
        },
        /** @param {HTMLElement} ele  @returns {number} */
        indexOf:(ele)=>{
           
        },
        fill: () => {
            console.log('ds');
        },
        callToFill: () => {

        },
        loopVisibleRows: (callback = (ele) => { return true; }) => {

        },
        onRendar: () => {
            this.nodes.loopVisibleRows((ele) => { return ele; });
        },
        /** @private  */
        __doactualRendar: () => {
            this.nodes.onRendar();
            this.nodes.refreshHiddenCount();
        },
        render() {
            this.__doactualRendar();
        },
        refreshHiddenCount: () => {
        }
    }


    Records = {

        /**
         * @param {number} index 
         * @returns {HTMLElement}
         */
        itemAt(index) { return undefined; },
        /** @type {HTMLElement}  */
        lstVWEle: undefined,
        /** @type {HTMLElement}  */
        scrollerElement: undefined,
        /**
         * @param {HTMLElement} ele 
         * @returns {HTMLElement}
         */
        getItemFromChild(ele) {
            let _container = this.lstVWEle;
            while (true) {
                if (ele.parentElement == null) { return null; }
                else if (_container.is(ele.parentElement)) {
                    return ele;
                } else {
                    ele = ele.parentElement;
                }
            }
        },
        /**
         * @param {number} index 
         * @returns {HTMLElement}
         */
        getNode: (index) => {
            //console.log(this.itemTemplate);
            return this.itemTemplate.extended.generateNode(this.source.rows[index]);
        },


    }
    Events = {

        /**
         * @type {{on:(callback = (
         *          index:number,
         *          evt:MouseEvent
         * ) =>{})} & commonEvent}
         */
        itemDoubleClick: new commonEvent(),

        /**
         * @type {{on:(callback = (
         *          index:number,
         *          evt:MouseEvent
         * ) =>{})} & commonEvent}
         */
        itemMouseDown: new commonEvent(),

        /**
         * 
         * @type {{on:(callback = (
         *          index:number,
         *          evt:MouseEvent
         * ) =>{})} & commonEvent}
         */
        itemMouseUp: new commonEvent(),

        /**
         * 
         * @type {{on:(callback = (
         * 
         * ) =>{})} & commonEvent}
         */
        onClearContainer: new commonEvent(),



        /**
         * @type {{on:(callback = (
         *          oldIndex:number,
         *          newIndex:number,
         *          evt:MouseEvent|KeyboardEvent,
         *          eventType:"Other"|"Keyboard"|"Mouse" = "Other"
         * ) =>{})} & commonEvent}
         */
        currentItemIndexChange: new commonEvent(),

        /**
         * @type {{on:(callback = (
         *          itemnode:HTMLElement,
         *          index:number
         * ) =>{})} & commonEvent}
         */
        newItemGenerate: new commonEvent(),
        /**
         * @type {{on:(callback = (
         *          rect:DOMRectReadOnly
         * ) =>{})} & commonEvent}
         */
        onListUISizeChanged: new commonEvent(),


        /**
         * @type {{on:(callback = (
         *          htEle:HTMLElement
         * ) =>{})} & commonEvent}
         */
        beforeOldItemRemoved: new commonEvent(),



        /**
            * @param {(evt:KeyboardEvent,valToAddRemove:number)=>{}} callback mandetory to call
            * @param {KeyboardEvent} event 
            * @param {number} valToAddRemove 
            */
        onRowNavigationChanged: (callback = () => { }, event,valToAddRemove) => {
            callback(event,valToAddRemove);
        },

        /**
          * @returns `true` will moveto first record `false` will remain as it is
          */
        onReachLastRecord: () => { return false; },

        /**
         * @returns `true` will moveto last record `false` will remain as it is
         */
        onReachFirstRecord: () => { return false; },


        /** @param {KeyboardEvent} e */
        onkeydown: (e) => {

        }
    };

    get currentRecord() { return this.source.rows[this.currentIndex]; }
    get currentIndex() { return this.OPTIONS.SESSION.currentIndex; }
    set currentIndex(val) {
        this.setCurrentIndex(val);
    }

    set scrollerElement(val) {
        if (val == undefined) return;
        if (this.resizeObsrv != undefined)
            this.resizeObsrv.disconnect();
        this.resizeObsrv = new window.ResizeObserver((pera) => {
            setTimeout(() => {
                this.OPTIONS.listSize = pera[0].contentRect;
                this.Events.onListUISizeChanged.fire(pera[0].contentRect);
            });
        });
        this.Records.scrollerElement = val;
        this.resizeObsrv.observe(val);
    }
    /**
     * @param {HTMLElement} lstVw 
     * @param {HTMLElement} scrollContainer 
     */
    init(lstVw, scrollerElement) {
        this.Records.lstVWEle = lstVw;
        this.scrollerElement = scrollerElement;
        lstVw.addEventListener("dblclick", (e) => {
            let itm = this.Records.getItemFromChild(e.target);
            if (itm != null)
                this.Events.itemDoubleClick.fire(this.currentIndex, e);
        });

        scrollerElement.addEventListener("keydown", this.keydown_listner);
    }
    /**
    * @param {number} val 
    * @param {MouseEvent|KeyboardEvent} evt 
    * @param {"Other"|"Keyboard"|"Mouse"} eventType
    */
    setCurrentIndex(val, evt, eventType) { };
    /** @param {KeyboardEvent} evt */
    keydown_listner = (evt) => { this.Events.onkeydown(evt); };
}
module.exports = { listUiHandler }