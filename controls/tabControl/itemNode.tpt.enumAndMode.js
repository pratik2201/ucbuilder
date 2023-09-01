const dropIndictors = {
    /** @type {HTMLElement}  */
    leftPoll: '<drop  dir="left" ></drop>'.$(),
    /** @type {HTMLElement}  */
    rightPoll: '<drop  dir="right" ></drop>'.$(),

    /** @type {HTMLElement}  */
    indictor: '<indicator  dir="none" ></indicator>'.$(),

    /** @type {HTMLElement[]}  */
    get asArray() {
        return [dropIndictors.indictor,
        dropIndictors.leftPoll,
        dropIndictors.rightPoll];
    },
    possiblePlaces: Object.freeze({
        leftRect: "leftRect",
        rightRect: "rightRect",
        none: "none",
    })
}
module.exports = {
    dropIndictors
}