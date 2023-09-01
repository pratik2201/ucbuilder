const { dragHelper } = require("@ucbuilder:/global/drag/dragHelper");
const { boxHandler } = require("@ucbuilder:/controls/Splitter.uc.boxHandler");
const { dropIndictors } = require("@ucbuilder:/controls/Splitter.uc.enumAndMore");
const { splitersGrid } = require("@ucbuilder:/controls/Splitter.uc.splitersGrid");

class dragHandler {
    constructor() { }
    /** @type {boxHandler}  */
    main = undefined;
    /** @param {boxHandler} main  */

    draging = new dragHelper();
    get splGrid() { return this.main.main; }
    /** @param {boxHandler} main */
    init(main) {
        this.main = main;
        this.spl = this.splGrid.main;
        dragHelper.ON_START((ev) => {
            let dta = dragHelper.draggedData;
            switch (dta.type) {
                case 'uc':
                    this.spl.ucExtends.self.setAttribute("isInDragMode", "1");
                    this.draging.start();
                    break;
            }

        }, (ev) => {
            this.spl.ucExtends.self.setAttribute("isInDragMode", "0");
            dropIndictors.asArray.forEach(s => s.remove());
            this.draging.stop();
        });

        let nodeStamp = this.main.node.stamp();
        this.draging
            .dragOver((ev) => {
            }, [this.main.node])
            .dragLeave((ev) => {
                /*if (ev.target.is(ev.currentTarget))
                    this.dragVisibility(false);*/
            }, [this.main.node])
            .dragEnter((ev) => {
                if (ev.currentTarget.stamp() == nodeStamp) {
                    //console.log(ev.currentTarget.stamp()+" == "+nodeStamp);
                    let uq = ev.target.stamp();
                    let dir = dropIndictors.possiblePlaces.none;
                    switch (uq) {
                        case dropIndictors.leftPoll.stamp(): dir = "left"; break;
                        case dropIndictors.topPoll.stamp(): dir = "top"; break;
                        case dropIndictors.rightPoll.stamp(): dir = "right"; break;
                        case dropIndictors.bottomPoll.stamp(): dir = "bottom"; break;
                        case nodeStamp: dir = "bottom"; break;
                        default:
                            this.dragVisibility(true);

                            break;
                    }
                    dropIndictors.indictor.setAttribute("dir", dir);
                    ev.stopImmediatePropagation();
                }
            }, [this.main.node])
            .dragDrop((ev) => {
                ev.stopPropagation();
                let uq = ev.target.stamp();
                let dir = dropIndictors.possiblePlaces.none;
                switch (uq) {
                    case dropIndictors.leftPoll.stamp(): dir = dropIndictors.possiblePlaces.leftRect; break;
                    case dropIndictors.topPoll.stamp(): dir = dropIndictors.possiblePlaces.topRect; break;
                    case dropIndictors.rightPoll.stamp(): dir = dropIndictors.possiblePlaces.rightRect; break;
                    case dropIndictors.bottomPoll.stamp(): dir = dropIndictors.possiblePlaces.bottomRect; break;
                    default:
                        //this.dropHereFromDrag();
                        ev.stopPropagation();
                        //// this.splGrid.main.draging.node.end.fire();
                        return;
                }
                this.onDropNeeded(dir);
            }, [this.main.node]);
    }
    dragVisibility(isVisible) {
        if (isVisible) {
            let allowedSplitRow = this.main.splMain.allowSplitRow;
            let allowedSplitColumn = this.main.splMain.allowSplitColumn;
            let attrVal = "";
            dropIndictors.asArray.forEach(s => {
                if (!allowedSplitRow) {
                    attrVal = s.getAttribute("dir");
                    if (attrVal == "top" || attrVal == "bottom") return;
                } 
                if (!allowedSplitColumn) {
                    attrVal = s.getAttribute("dir");
                    if (attrVal == "left" || attrVal == "right") return;
                }
                this.main.node.appendChild(s);
                s.style.visibility = "visible";
            });
            this.splGrid.main.ucExtends.passElement(dropIndictors.asArray);
        } else {
            dropIndictors.asArray.forEach(s => s.style.visibility = "hidden");
        }
    }
    onDropNeeded = (dir) => {

    }
}
module.exports = { dragHandler };