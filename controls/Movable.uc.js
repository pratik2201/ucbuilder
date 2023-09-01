const { designer } = require('./Movable.uc.designer.js');
const { dragUc } = require('@ucbuilder:/controls/common/draguc.js');
const { windowStates } = require('@ucbuilder:/controls/common.js');
const { commonEvent } = require('@ucbuilder:/global/commonEvent.js');
const { Usercontrol } = require('@ucbuilder:/Usercontrol.js');
const { dragHelper } = require('@ucbuilder:/global/drag/dragHelper.js');
const { ResourcesUC } = require('@ucbuilder:/ResourcesUC.js');

class Movable extends designer {

    /** @type {number} @private */
    _backgroundOpacity = 0.500;
    set backgroundOpacity(val) { this._backgroundOpacity = val > 1 ? val / 1000 : val }
    get backgroundOpacity() { return this._backgroundOpacity; }



    /** @type {Boolean} */
    allowResize = true;

    get allowMove() { return this.drag.allowMove; }
    set allowMove(val) { this.drag.allowMove = val; }

    designAll() {
        let titleHT = this.ucExtends.wrapperHT;
        let ctrls = [];
        for (let index = 0; index < this.ucExtends.garbageElementsHT.length; index++) {
            const node = this.ucExtends.garbageElementsHT[index];
            if (!node.is(titleHT)) {
                ctrls.push(node);
            }
        }
        ctrls.forEach(ctr => {
            this.container1.append(ctr);
        });
        this.ucExtends.stageHT = this.container1;

    }

    //#endregion

    drag = new dragUc();
    SESSION_DATA = {
      
        winState: "",
        oldstyleText: "",
        rect: {
            left: 0,
            top: 0,
            width: 0,
            height: 0,
        }
    }
    constructor() {
        eval(designer.giveMeHug);

        this.ucExtends.session.autoLoadSession = true;

        this.parentUCExt = this.ucExtends.PARENT.ucExtends;
        /** @type {HTMLElement}  */ 
        this.parentElementHT = this.parentUCExt.wrapperHT;

        this.drag.finalRect = this.SESSION_DATA.rect;
        this.SESSION_DATA.rect.width = parseFloat(this.parentElementHT.style.width);
        this.SESSION_DATA.rect.height = parseFloat(this.parentElementHT.style.height);
        
        this.init();
        this.ucExtends.Events.loadLastSession.on(() => {
            this.drag.finalRect = this.SESSION_DATA.rect;
            this.loadSession();
        });

        /*this.ucSession.onModify = () => {
           // this.ucSession.writeFile();
            this.parentUCExt.session.onModify();
        }*/
    }
    loadSession() {
        let selectRect = this.SESSION_DATA.rect;
        let containerHT = this.drag.containerHT;
        this.ucExtends.windowstate = this.SESSION_DATA.winState;
        this.checkState(this.SESSION_DATA.winState);
    }
    init() {

        this.initEvent();
        this.lbl_title.innerText = this.parentUCExt.wrapperHT.getAttribute("x-caption");
        this.drag.Events.onmouseup = (evt) => {
            this.ucExtends.session.onModify();
        }
        this.dragme.addEventListener("dragstart", (e) => {
            e.dataTransfer.setDragImage(this.parentElementHT, 0, 0);
        })
        this.cmd_close.addEventListener("mouseup", (e) => {
            this.parentUCExt.destruct();
        });
    }
    movableEvents = {
        /** @private */
        extended: {

            onActivateWindow: new commonEvent(),
        },
        onActivateWindow(callback =
            /** @param {Usercontrol} uc */ (uc) => { }) {
            this.extended.onActivateWindow.on(callback);
        },
        onResizeStart: (callback = () => { }) => {
            this.drag.Events.onResizeStart.on(callback);
        },
        onResizeEnd: (callback = (uc) => { }) => {
            this.drag.Events.onResizeEnd.on(callback);
        },
        onMoveStart: (callback = (uc) => { }) => {
            this.drag.Events.onMoveStart.on(callback);
        },
        onMoveEnd: (callback = (uc) => { }) => {
            this.drag.Events.onMoveEnd.on(callback);
        },
    }
    initEvent() {
        this.parentUCExt.Events.captionChanged.on((nval) => {
            this.lbl_title.innerText = nval;
        });
        this.parentUCExt.Events.winStateChanged.on((state) => {
            this.checkState(state);
        });
        this.checkState(this.parentUCExt.windowstate);

        this.container = ResourcesUC.contentHT;

        //this.ucExtends.._..updateLayout();
        this.designAll();

        this.drag.init(this.parentElementHT, this.title_panel);
        this.drag.resizer.connect(this);


        dragHelper.DRAG_ME(this.dragme,
            (evt) => {
                return {
                    type: "uc",
                    data: this.ucExtends.PARENT,
                };
            },
            (evt) => {

            });

        this.cmd_close.on('mousedown', (event) => {
            console.log('window is closing...');
            this.parentUCExt.destruct();
        });
        this.ucExtends.self.addEventListener("mousedown", (evt) => {
            if(this.parentUCExt.windowstate == 'dock')return;
            let pucHT = this.parentElementHT;
            if (pucHT.nextSibling != null)
                pucHT.parentElement.appendChild(pucHT);
            this.movableEvents.extended.onActivateWindow.fire(this.ucExtends.PARENT);
        });
    }
    /** @param {windowStates} state */
    checkState(state) {
        this.SESSION_DATA.winState = state;
        switch (state) {
            case windowStates.dock:
                this.ucExtends.self.setAttribute("win-state", "dock");
                this.SESSION_DATA.oldstyleText = this.parentElementHT.style.cssText;
                Object.assign(this.parentElementHT.style,{
                    position:"static",
                    width:"100%",
                    height:"100%",
                    display:"block",
                });
                this.drag.resizer.cssDisplay("none");
                break;
            case windowStates.normal:
                this.ucExtends.self.setAttribute("win-state", "normal");
               
                Object.assign(this.parentElementHT.style,{
                    position:"absolute",
                    left:this.SESSION_DATA.rect.left+"px",
                    top:this.SESSION_DATA.rect.top+"px",
                    width:this.SESSION_DATA.rect.width+"px",
                    height:this.SESSION_DATA.rect.height+"px",
                });
                

                /* this.parentElementHT.style.left = `${this.SESSION_DATA.rect.left}px`;
                 this.parentElementHT.style.top = `${this.SESSION_DATA.rect.top}px`;
                 this.parentElementHT.style.width = `${this.SESSION_DATA.rect.width}px`;
                 this.parentElementHT.style.height = `${this.SESSION_DATA.rect.height}px`;*/
                this.drag.resizer.cssDisplay("block");
                break;
        }
    }
}
module.exports = Movable;          