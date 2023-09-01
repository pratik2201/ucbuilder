const { uniqOpt, objectOpt, arrayOpt } = require('@ucbuilder:/build/common.js');
const {  Size } = require('@ucbuilder:/global/drawing/shapes.js');
const { Usercontrol } = require('@ucbuilder:/Usercontrol.js');
const { windowStates } = require('@ucbuilder:/controls/common.js');
const { spliterType, tabRow, tabChilds, tabBoxRow, dragDataNode, dropIndictors } = require('@ucbuilder:/controls/Splitter.uc.enumAndMore.js');
const { designer } = require('./tabBox.uc.designer.js');
const { intenseGenerator } = require('@ucbuilder:/intenseGenerator.js');

class tabRecord {
    /** @type {tabChilds}  */
    SESSION_DATA = objectOpt.clone(tabChilds);

    /** @type {HTMLElement}  */
    tabButton = undefined;
    /** @type {Usercontrol}  */
    uc = undefined;


    /** @type {HTMLElement}  */
    ucHT = undefined;


    /** @type {tabBox}  */
    tabBx = undefined;
    generateButton() {
        //console.log('generateButton');
        this.tabButton = `<tab active="1" draggable="true" >${this.ucHT.getAttribute("x-caption")}</tab>`.$();
        this.tabBx.tablist1.appendChild(this.tabButton);
        this.tabButton.on("mouseup", () => {
            Array.from(this.tabBx.tablist1.children).forEach(s => s.setAttribute('active', '0'));
            Array.from(this.tabBx.tabtarget1.children).forEach(s => s.setAttribute('active', '0'));
            this.tabButton.setAttribute('active', '1');
            this.ucHT.setAttribute('active', '1');
        });
        this.uc.ucExtends.Events.captionChanged.on((txt) => {
            this.tabButton.innerText = txt;
        });
        let drag = this.tabBx.splNode.main.draging;
        //console.log('new generated');
        //console.log(this.tabButton);
        drag.dragStartPoint(this.tabButton,
            (ev) => {
                /** @type {dragDataNode} */
                let dta = objectOpt.clone(dragDataNode);
                dta.uc = this.uc;
                dta.tabBx = this.tabBx;
                return dta;
            },
            (ev) => {
                if (ev.dataTransfer.dropEffect == 'move') {
                    if (drag.hasDropped) {
                        //console.log('old deleted');
                        this.tabButton.delete();
                        let stamp = this.uc.ucExtends.self.stamp();
                        arrayOpt.removeByCallback(this.tabBx.SESSION_DATA.children,
                            /** @param {tabChilds} s @returns */
                            s => s.stamp == stamp
                        );
                    }
                }
            }, false);
    }
}

class tabBox extends designer {
    /** @type {tabBoxRow}  */
    SESSION_DATA = objectOpt.clone(tabBoxRow);
    constructor() { eval(designer.giveMeHug);
        

        this.ucExtends.session.autoLoadSession = false;
        this.allItemsHt = this.tablist1.childNodes;
        this.ucExtends.Events.loadLastSession.on(() => {
            this.loadSession();
            if (this.SESSION_DATA.role)
                this.cmb_role.value = this.SESSION_DATA.role;
        });
        if (!this.ucExtends.session.options.loadBySession) {
            this.SESSION_DATA.nodeId = this.ucExtends.self.stamp();
        }
        this.ucExtends.Events.beforeClose.on(() => {

        });
    }
    loadSession() {
        this.SESSION_DATA.nodeId = this.ucExtends.self.stamp();
        this.SESSION_DATA.children.forEach(row => {
            /** @type {Usercontrol}  */
            let suc = intenseGenerator.generateUC(row.filePath, {
                parentUc: this,
                session:{ loadBySession:true }
            });
            let tabRec = this.dropHere(suc, false);
            tabRec.SESSION_DATA = row;
            tabRec.SESSION_DATA.stamp = suc.ucExtends.self.stamp();
            suc.ucExtends.session.setSession(tabRec.SESSION_DATA.session[suc.ucExtends.fileStamp]);
            suc.ucExtends.session.exchangeParentWith(tabRec.SESSION_DATA.session);
        });
        
    }

    /** @type {NodeListOf<ChildNode>}  */
    allItemsHt = undefined;

    get length() { return this.allItemsHt.length; }

    /**
     * @param {Usercontrol} uc 
     * @returns {boolean}
     */
    exist(uc) {
        let ele = uc.ucExtends.self;
        let found = false;
        this.allItemsHt.forEach((obj) => {
            if (!found) {
                found = (obj.data('tabrecord')).tabButton.is(ele);
            }
        });
        return found;
    }
    static possiblePlaces = Object.freeze({
        leftRect: "leftRect",
        centerRect: "centerRect",
        rightRect: "rightRect",
        topRect: "topRect",
        bottomRect: "bottomRect",
        none: "none",
    });


    dropHereFromDrag() {
        let drag = this.splNode.main.draging;
        /** @type {dragDataNode} */
        let dNode = drag.draggedData;

        /** @type {tabBox}  */
        let tbx = dNode.tabBx;

        if (tbx == undefined || !tbx.ucExtends.self.is(this.ucExtends.self)) {
            this.dropHere(dNode.uc, true);
        } else {
            if (this.tablist1.contains(drag.lastDragEvent.target)) {
                this.splNode.main.splitterEvents.extended.onExitFromSplitter.fire(dNode.uc)
            } else this.dropHere(dNode.uc, true);
        }
        //this.splNode.main.drag.onDragEnd.fire();
    }
    /**
     * @param {Usercontrol} suc
     * @param {boolean} touchSession 
     */
    dropHere(suc, touchSession = true) {
        let tabRec = new tabRecord();
        tabRec.uc = suc;
        tabRec.ucHT = tabRec.uc.ucExtends.self;
        tabRec.tabBx = this;
        tabRec.generateButton();
        this.ucExtends.passElement(tabRec.tabButton);
        this.splNode.main.splitterEvents.extended.onPushedUc.fire(suc);
        tabRec.tabButton.data('tabrecord', tabRec);
        suc.ucExtends.windowstate = windowStates.dock;
        this.tabtarget1.appendChild(tabRec.ucHT);
        if (touchSession) {
            tabRec.SESSION_DATA.filePath = suc.ucExtends.fileInfo.code.rootPath;
            tabRec.SESSION_DATA.fstamp = suc.ucExtends.fileStamp;
            suc.ucExtends.session.exchangeParentWith(tabRec.SESSION_DATA.session);
            tabRec.SESSION_DATA.stamp = suc.ucExtends.self.stamp();
            this.SESSION_DATA.children.push(tabRec.SESSION_DATA);
            this.ucExtends.session.onModify();
        }
        return tabRec;
    }
    /** @private */
    isInit = false;
    init() {
        if (this.isInit) return;
        this.isInit = true;
        let splMain = this.splNode.main;

        let allPoll = [this.ucExtends.self, ...dropIndictors.asArray];
        splMain.draging
            .dragOver((ev) => {

            }, [this.ucExtends.self], "", false)
            .dragLeave((ev) => {
                if (ev.target.is(ev.currentTarget))
                    this.dragVisibility(false);
            }, [this.ucExtends.self], "", false)
            .dragEnter((ev) => {
                let uq = ev.target.stamp();
                let dir = tabBox.possiblePlaces.none;
                switch (uq) {
                    case dropIndictors.leftPoll.stamp(): dir = "left"; break;
                    case dropIndictors.topPoll.stamp(): dir = "top"; break;
                    case dropIndictors.rightPoll.stamp(): dir = "right"; break;
                    case dropIndictors.bottomPoll.stamp(): dir = "bottom"; break;
                    default:
                        this.dragVisibility(true);
                        break;
                }
                dropIndictors.indictor.setAttribute("dir", dir);
                ev.preventDefault();
            }, [this.ucExtends.self], "", false)
            .dragDrop((ev) => {
                ev.stopPropagation();
                let uq = ev.target.stamp();
                let dir = tabBox.possiblePlaces.none;
                switch (uq) {
                    case dropIndictors.leftPoll.stamp(): dir = tabBox.possiblePlaces.leftRect; break;
                    case dropIndictors.topPoll.stamp(): dir = tabBox.possiblePlaces.topRect; break;
                    case dropIndictors.rightPoll.stamp(): dir = tabBox.possiblePlaces.rightRect; break;
                    case dropIndictors.bottomPoll.stamp(): dir = tabBox.possiblePlaces.bottomRect; break;
                    default:
                        this.dropHereFromDrag();
                        ev.stopPropagation();
                        splMain.draging.node.end.fire();
                        return;
                }
                this.onDropNeeded(dir);
            }, [this.ucExtends.self], "", false);


        splMain.draging
            .dragStart((ev) => {

            })
            .dragEnd((ev) => {
                //this.dragVisibility(false);
            });

    }
    lastVisisble = undefined;
    /** @param {boolean} isVisible */
    dragVisibility(isVisible) {
        if (isVisible) {
            dropIndictors.asArray.forEach(s => {
                this.container1.appendChild(s);
                s.style.visibility = "visible";
            });
            this.ucExtends.passElement(dropIndictors.asArray);
        } else {
            dropIndictors.asArray.forEach(s => s.style.visibility = "hidden");
        }

    }
    //onDropNeeded =  /** @param {tabBox.possiblePlaces} dir */ (dir) => { }

    onDropNeeded = (dir) => {
        let curEleHT = this.ucExtends.self;
        let curMainSize = new Size(curEleHT.offsetWidth, curEleHT.offsetHeight);
        // let pNode = this.splNode;
        //console.log(pNode.gridHT);
        let _type = this.splNode.type;

        switch (dir) {
            case tabBox.possiblePlaces.rightRect:
            case tabBox.possiblePlaces.leftRect:

                if (_type == spliterType.NOT_DEFINED) this.splNode.type = spliterType.COLUMN; break;
            case tabBox.possiblePlaces.topRect:
            case tabBox.possiblePlaces.bottomRect:
                if (_type == spliterType.NOT_DEFINED) this.splNode.type = spliterType.ROW; break;
        }
        switch (dir) {
            case tabBox.possiblePlaces.rightRect:
            case tabBox.possiblePlaces.bottomRect: this.splNode.switchDrop(true, dir); break;
            case tabBox.possiblePlaces.leftRect:
            case tabBox.possiblePlaces.topRect: this.splNode.switchDrop(false, dir); break;
        }

    }

    lastDrop = tabBox.possiblePlaces.none;

    /** @type {splitersNode}  */
    _splNode = undefined;
    /** @type {splitersNode}  */
    get splNode() { return this._splNode; }
    /** @type {splitersNode}  */
    set splNode(val) {
        this._splNode = val; this.init();
    }

}
module.exports = tabBox;