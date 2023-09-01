const { objectOpt, controlOpt } = require("@ucbuilder:/build/common");
const { dragHelper } = require("@ucbuilder:/global/drag/dragHelper");
const { Usercontrol } = require("@ucbuilder:/Usercontrol");
const { windowStates } = require("@ucbuilder:/controls/common");
const Splitter = require("@ucbuilder:/controls/Splitter.uc");
const { dragHandler } = require("@ucbuilder:/controls/Splitter.uc.dragHandler");
const { dropIndictors, spliterType, splitterCell, spliterCellType } = require("@ucbuilder:/controls/Splitter.uc.enumAndMore");
const { splitersGrid } = require("@ucbuilder:/controls/Splitter.uc.splitersGrid");

class boxHandler {
    constructor() { }
    /** @type {splitersGrid}  */
    main = undefined;
    /** @type {Splitter}  */
    splMain = undefined;
    /** @type {Usercontrol}  */
    uc = undefined;
    /** @type {dragHandler}  */
    drag = new dragHandler();
    get index() { return this.node.index(); }
    /**
     * @param {splitersGrid} newMain 
     */
    changeGrid(newMain) {
        this.main = newMain;
    }
    /** 
    * @param {splitersGrid} main 
    * @param {HTMLElement} node 
    * @param {HTMLElement} view 
    */
    init(main, node, view) {
        this.main = main;
        this.splMain = main.main;

        this.node = node;
        //
        // console.log(this.node);
        this.view = (view == undefined) ? node.children.item(0) : view;
        this.drag.init(this);
        this.drag.onDropNeeded = (dir) => {
            switch (dir) {
                case dropIndictors.possiblePlaces.rightRect:
                case dropIndictors.possiblePlaces.leftRect: this.dropH(dir); break;
                case dropIndictors.possiblePlaces.topRect:
                case dropIndictors.possiblePlaces.bottomRect: this.dropV(dir); break;
            }
        }
    }

    pushData(index, halfSize, appendAfter) {
        let nnode = this.splMain.navoNodeMoklo(this.main);
        let atIndex = appendAfter ? index : index - 1;
        /** @type {splitterCell}  */
        let ns = objectOpt.clone(splitterCell);
        ns.size = halfSize;
        //console.log(nnode.box.uc.ucExtends.fileInfo.html.rootPath);
        ns.ucPath = nnode.box.uc.ucExtends.fileInfo.html.rootPath;
        ns.attribList = controlOpt.xPropToAttr(nnode.box.uc.ucExtends.self);
        nnode.box.uc.ucExtends.session.exchangeParentWith(ns.session);
        if(appendAfter){
            this.main.measurement.splice(index + 1, 0, ns);
            this.main.measurement[index].size = halfSize;
        }else{
            this.main.measurement.splice(index, 0, ns);
            this.main.measurement[index+1].size = halfSize;
        }
        this.main.pushBox(nnode.box, atIndex);
        dragHelper.dragResult = nnode.box.uc.ucExtends.Events.onDataImport(dragHelper.draggedData);
        this.main.resizer.giveResizer();
    }
    dropH(dir) {
        switch (this.main.info.type) {
            case spliterType.NOT_DEFINED:
            case spliterType.COLUMN:
                let index = this.index;
                let len = this.main.length;
                this.main.type = spliterType.COLUMN;
                switch (dir) {
                    case dropIndictors.possiblePlaces.rightRect:
                        if (len == 0 || index == this.main.lastIndex) { // if last
                            this.pushData(index, this.node.offsetWidth / 2, true);
                        } else {  // if between

                            let size = this.main.measurement[index].size;
                            this.pushData(index, size / 2, true);
                        }
                        break;
                    case dropIndictors.possiblePlaces.leftRect:
                        if (len == 0 || index == this.main.lastIndex) { // if last
                            this.pushData(index, this.node.offsetWidth / 2, false);
                        } else {  // if between
                            let size = this.main.measurement[index].size;
                            this.pushData(index, size / 2, false);
                        }
                        break;
                }

                break;
            default:
                let ngrid = this.splMain.navuGridMoklo(spliterType.COLUMN);                                
                let topMeasurement = this.splMain.tree.measurement[this.node.index()];
                let ndm1 = ngrid.navoNodeMoklo(ngrid.tree);
                let ndm2 = ngrid.navoNodeMoklo(ngrid.tree);
                ngrid.tree.pushBox(ndm2);
                ngrid.tree.pushBox(ndm1);
                this.view.appendChild(ngrid.ucExtends.self);
                //ngrid..attribList = controlOpt.xPropToAttr(nnode.box.uc.ucExtends.self);
                ngrid.tree.refresh();
                topMeasurement.ucPath = ngrid.ucExtends.fileInfo.html.rootPath;
                topMeasurement.attribList = controlOpt.xPropToAttr(ngrid.ucExtends.self);
                 //console.log(ngrid.tree.measurement.length);
                if (this.view.children.length != 0) {
                    switch (dir) {
                        case dropIndictors.possiblePlaces.rightRect:
                            ndm1.view.innerHTML = "";
                            ndm1.view.appendChild(this.uc.ucExtends.self);                            
                            dragHelper.dragResult = ndm2.box.uc.ucExtends.Events.onDataImport(dragHelper.draggedData);
                            this.uc.ucExtends.session.exchangeParentWith(ngrid.tree.measurement[0].session);
                            break;
                        case dropIndictors.possiblePlaces.leftRect:
                            ndm2.view.innerHTML = "";
                            ndm2.view.appendChild(this.uc.ucExtends.self);                            
                            dragHelper.dragResult = ndm1.box.uc.ucExtends.Events.onDataImport(dragHelper.draggedData);
                            this.uc.ucExtends.session.exchangeParentWith(ngrid.tree.measurement[1].session);
                            break;
                    }
                }
                ngrid.ucExtends.session.exchangeParentWith(topMeasurement.session);
                
                break;
        }

    }
    dropV(dir) {
        switch (this.main.info.type) {
            case spliterType.NOT_DEFINED:
            case spliterType.ROW:
                let index = this.index;
                let len = this.main.length;
                this.main.type = spliterType.ROW;

                switch (dir) {
                    case dropIndictors.possiblePlaces.bottomRect:
                        if (len == 0 || index == this.main.lastIndex) { // if last
                            this.pushData(index, this.node.offsetHeight / 2, true);
                        } else {  // if between
                            let size = this.main.measurement[index].size;
                            this.pushData(index, size / 2, true);
                        }
                        break;
                    case dropIndictors.possiblePlaces.topRect:
                        if (len == 0 || index == this.main.lastIndex) { // if last
                            this.pushData(index, this.node.offsetHeight / 2, false);
                        } else {  // if between
                            let size = this.main.measurement[index].size;
                            this.pushData(index, size / 2, false);
                        }
                        break;
                }
                break;
            default:
                let ngrid = this.splMain.navuGridMoklo(spliterType.ROW);                                
                let topMeasurement = this.splMain.tree.measurement[this.node.index()];
                let ndm1 = ngrid.navoNodeMoklo(ngrid.tree);
                let ndm2 = ngrid.navoNodeMoklo(ngrid.tree);
                ngrid.tree.pushBox(ndm2);
                ngrid.tree.pushBox(ndm1);
                this.view.appendChild(ngrid.ucExtends.self);
                ngrid.tree.refresh();
                topMeasurement.ucPath = ngrid.ucExtends.fileInfo.html.rootPath;
                topMeasurement.attribList = controlOpt.xPropToAttr(ngrid.ucExtends.self);
                if (this.view.children.length != 0) {
                    switch (dir) {
                        case dropIndictors.possiblePlaces.bottomRect:
                            ndm1.view.innerHTML = "";
                            ndm1.view.appendChild(this.uc.ucExtends.self);                            
                            dragHelper.dragResult =ndm2.box.uc.ucExtends.Events.onDataImport(dragHelper.draggedData);
                            this.uc.ucExtends.session.exchangeParentWith(ngrid.tree.measurement[0].session);
                            break;
                        case dropIndictors.possiblePlaces.topRect:
                            ndm2.view.innerHTML = "";
                            ndm2.view.appendChild(this.uc.ucExtends.self);                            
                            dragHelper.dragResult = ndm1.box.uc.ucExtends.Events.onDataImport(dragHelper.draggedData);
                            this.uc.ucExtends.session.exchangeParentWith(ngrid.tree.measurement[1].session);
                            break;
                    }
                }
                ngrid.ucExtends.session.exchangeParentWith(topMeasurement.session);
                break;
        }
    }
}
module.exports = { boxHandler };