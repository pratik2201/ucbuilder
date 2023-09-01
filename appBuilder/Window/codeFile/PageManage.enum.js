class pageRowOption {
    constructor(){}
    /** @type {number} */
    index = 0;
    /** @type {boolean} */
    disabled = false;

    /** @type {boolean} */
    visible = true;
};
module.exports = {
    pageRowOption,
    PageMouseEvent: {
        index: -1,
        stamp: '',
        itemHT: undefined,
        /**
         * @type JQuery.MouseDownEvent
         */
        event: undefined,
        eventElementHT: undefined
    },
    PageNavigationResult: Object.freeze({
        DISPLAYED: 'DISPLAYED',
        OUTSIDE: 'OUTSIDE',
        LAST: 'LAST',
        FIRST: 'FIRST',
    }),
    ROW_DATA: "rowData",    
};