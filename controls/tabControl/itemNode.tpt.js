const { looping } = require('@ucbuilder:/build/common.js');
const { dragHelper } = require('@ucbuilder:/global/drag/dragHelper.js');
const tabControl = require('@ucbuilder:/controls/tabControl.uc.js');
const { dropIndictors } = require('@ucbuilder:/controls/tabControl/itemNode.tpt.enumAndMode.js');
const { designer } = require('./itemNode.tpt.designer.js');
const { ResourcesUC } = require('@ucbuilder:/ResourcesUC.js');
class itemNode extends designer {

    constructor() {
        super(arguments);
        
    }
    /** @type {tabControl}  */
    main = undefined;
    dragVisibility(isVisible, tarEle) {
        if (isVisible) {
            dropIndictors.asArray.forEach(s => {
                tarEle.appendChild(s);
                s.style.visibility = "visible";
            });
            this.extended.stampRow.passElement(dropIndictors.asArray);
        } else {
            dropIndictors.asArray.forEach(s => s.style.visibility = "hidden");
        }
    }
    draging = new dragHelper();
    /** @type {HTMLElement}  */
    static dragHereElement = "<ele></ele>".$();
    /** @param {tabControl} main */
    init(main) {
        this.main = main;

        this.draging.dragEnter((ev) => {
            /** @type {HTMLElement}  */
            let ht = ev.target;
            ht = ht.closest(`[role="tabbutton"]`);
            if (ht != undefined) {
                itemNode.dragHereElement.setAttribute('drag-here', 'no');
                itemNode.dragHereElement = ht;
                itemNode.dragHereElement.setAttribute('drag-here', 'ok');
            } else {
                itemNode.dragHereElement.setAttribute('drag-here', 'no');
            }
        }, [this.main.tabHeader]);
        this.draging.dragDrop((ev) => {
            let dta = dragHelper.draggedData;
            if (dta.type == "uc") {
                try {
                    let index = -1;
                    let ht = ev.target.closest(`[role="tabbutton"]`);
                    if (ht != undefined) index = ht.index();
                    /** @type {Usercontrol}  */
                    let uc = dta.data;
                    this.main.pushUc(uc, index);
                    this.main.refreshTabHeader();
                    this.main.tpt_itemnode.setActive(uc.ucExtends.self.index());
                    dragHelper.dragResult = this.dragButtonIndex == -1;
                } catch (exc) {
                    //console.log(esc);
                    dragHelper.dragResult = false;
                }
            }
        }, [this.main.tabHeader]);


        this.primary.Events.onGenerateNode = (mainnode, json) => {
            mainnode.addEventListener("mouseup", this.mouseup_listner);
            mainnode.addEventListener("dblclick", this.dblclick_listner);
            mainnode.setAttribute("role", "tabbutton");
           
            let ctrls = this.primary.getAllControls(mainnode);
           
            ctrls.btn_close.addEventListener("mousedown", (e) => {
                let index = mainnode.index();
                let uc = ResourcesUC.getBaseObject(this.main.tabView.children.item(index));
                /*uc.ucExtends.Events.afterClose.on(()=>{
                    mainnode.remove();
                });*/
                uc.ucExtends.destruct();
            });
            dragHelper.DRAG_ME(mainnode,
                (evt) => {
                    this.dragButtonIndex = mainnode.index();
                    let uc = ResourcesUC.getBaseObject(this.main.tabView.children.item(this.dragButtonIndex));
                    ///document.body.appendChild(mainnode);
                    //this.removeAt(index);
                    return {
                        type: "uc",
                        data: uc,
                    };
                },
                (evt) => {
                    let idx = this.dragButtonIndex;
                    this.dragButtonIndex = -1;
                    if (dragHelper.dragResult === true) {
                        this.removeAt(idx, false);
                    }

                });
        };
    }
    dragButtonIndex = -1;
    removeAt(index, removeView = true) {
        if (removeView) this.main.tabView.children.item(index).remove();
        this.main.SESSION_DATA.tabChild.splice(index, 1);
        this.main.refreshTabHeader();
        let ni = Math.max(--index, 0);
        this.setActive(ni);
    }
    /** @param {MouseEvent} ev */
    dblclick_listner = (ev) => {
        let index = ev.currentTarget.index();
        let uc = ResourcesUC.getBaseObject(this.main.tabView.children.item(index));
       
        if(this.extended.Events.onDataExport({
            type:'uc',
            data:uc,
        })===true){
            this.removeAt(index,false);
        }
    }
    /** @param {MouseEvent} ev */
    mouseup_listner = (ev) => {
        let index = ev.currentTarget.index();
        this.setActive(index);
        this.main.tabView.children.item(index).focus();
    }

    setActive(index) {
        try {
            looping.htmlChildren(this.main.tabView, s => {
                s.style.visibility = "collapse";
                s.style.height = "0px";
                s.style.width = "0px";
            });
            looping.htmlChildren(this.main.tabHeader, s => {
                s.setAttribute("active", "0");
            });
            if (index < this.main.length) {
                let ele = this.main.tabView.children.item(index);
                ele.style.visibility = "visible";
                ele.style.height = "100%";
                ele.style.width = "100%";
                ele.setAttribute("active", "1");
                this.main.tabHeader.children.item(index).setAttribute("active", "1");
                this.main.SESSION_DATA.activeIndex = index;
                this.main.ucExtends.session.onModify();
            }
        } catch (e) {
            console.log(e);
        }
    }
}
module.exports = itemNode;