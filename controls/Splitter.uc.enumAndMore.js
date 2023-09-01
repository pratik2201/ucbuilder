const { commonEvent } = require("@ucbuilder:/global/commonEvent");

class dragInfo {
    constructor() { }
    /** @private */
    dragData = undefined;
    /** @private */
    lastDroppedData = undefined;
    setDragData = (data) => { this.dragData = data; this.hasDropped = false; }
    hasDropped = true;
    getDragData = () => {
        //console.log('drag.getDragData');
        this.lastDroppedData = this.dragData;
        //this.dragData = undefined;
        this.hasDropped = true;
        return this.lastDroppedData;
    }

    getLastData = () => { return this.lastDroppedData; }
    onDragStart = new commonEvent();
    onDragEnd = new commonEvent();
}
const spliterType = Object.freeze({
    NOT_DEFINED: "NOT_DEFINED",
    ROW: "ROW",
    COLUMN: "COLUMN",
});
const spliterCellType = Object.freeze({
    LINK: "LINK",
    ANOTHER: "ANOTHER",
});
const tabChilds = {
    index : -1,
    stamp: "",
    filePath: "",
    fstamp: "",
    session: {},
};
const splitterCell = {
    /** @type {number}  */ 
    size : undefined,
    ucPath:"",
    attribList:"",
    /** @type {{}}  */ 
    session:{},
};
const splitterRow ={
    /** @type {splitterCell[]}  */ 
    measurement: [],
    attribList:"",
    //size : -1,
    type: spliterType.NOT_DEFINED,
}
const dropIndictors = {
    /** @type {HTMLElement}  */
    leftPoll: '<drop parent="dragassets" dir="left" ></drop>'.$(),
    /** @type {HTMLElement}  */
    rightPoll: '<drop parent="dragassets" dir="right" ></drop>'.$(),
    /** @type {HTMLElement}  */
    topPoll: '<drop parent="dragassets" dir="top" ></drop>'.$(),
    /** @type {HTMLElement}  */
    bottomPoll: '<drop parent="dragassets" dir="bottom" ></drop>'.$(),
    /** @type {HTMLElement}  */
    indictor: '<indicator parent="dragassets" dir="none" ></indicator>'.$(),

    /** @type {HTMLElement[]}  */
    get asArray() {
        return [dropIndictors.indictor,
            dropIndictors.leftPoll,
            dropIndictors.topPoll,
            dropIndictors.rightPoll,
            dropIndictors.bottomPoll];
    },
    possiblePlaces : Object.freeze({
        leftRect: "leftRect",
        centerRect: "centerRect",
        rightRect: "rightRect",
        topRect: "topRect",
        bottomRect: "bottomRect",
        none: "none",
    })
};

module.exports = {
    dragInfo,
    dropIndictors,
    spliterType,
    tabChilds,
    dragDataNode: {
        uc: undefined,
        tabBx: undefined
    },    
    tabBoxRow: {
        /** @type {tabChilds[]}  */ 
        children: [],
        nodeId: "",
        role: "",
    },
    splitterCell,
    splitterRow,
    spliterCellType,
    
};