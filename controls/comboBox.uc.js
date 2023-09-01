const {  objectOpt } = require('@ucbuilder:/build/common.js');
const { Rect } = require('@ucbuilder:/global/drawing/shapes.js');
const { TempleteNode } = require('@ucbuilder:/Template.js');
const comboboxItem = require('@ucbuilder:/controls/combobox/comboboxitem.tpt.js');
const { keyBoard } = require('@ucbuilder:/global/hardware/keyboard.js');
const { intenseGenerator } = require('@ucbuilder:/intenseGenerator.js');
const { designer } = require('./combobox.uc.designer.js');
class combobox extends designer {
    set source(val) { this.binder.source = val; }
    set itemTemplete(val) { this.binder.template = val; }
    /** @type {TempleteNode}  */ 
    seletectedItemTemplete = undefined;
    set selectedIndex(val) {
        this.binder.selectedIndex = val;
        //this.ll_view.lv_items.lvUI.currentIndex = val;
        //this.binder.template.extended.generateNode(val);
        //this.binder.selectedIndex
    }
    /** @type {"click"|"dblclick"|"focus"|"enterKey"|"spacebarKey"}  */
    static openOptions = "click"
    /** @type {combobox.openOptions[]}  */
    openOn = [];

    isOpeinig = false;
    openList() {
        let txtboxRect = new Rect();
        txtboxRect.setBy.domRect(this.ucExtends.self.getClientRects()[0]);
        this.binder.showAt(txtboxRect);
    }
    get hasfocused(){
        return this.ucExtends.self.contains(document.activeElement)  || 
            this.ll_view.ucExtends.self.contains(document.activeElement);
    }
    constructor() {
        eval(designer.giveMeHug);
        
        /** @type {comboboxItem}  */ 
        let tpt = intenseGenerator.generateTPT('@ucbuilder:/controls/comboBox/comboboxItem.tpt',{
            parentUc:this
        });
        
        //console.log(tpt.primary);
        //this.openOn.push('click','dblclick')
        this.binder = this.ll_view.bindNew();
        this.binder.direction = 'bottom';
        this.itemTemplete = tpt.primary;
        
        // this.binder.source = rootPathHandler.source;
        //this.binder.allowedElementList.push(this.ucExtends.self);
        //this.binder.template = this.tpt_rootitemNode;
        this.binder.bindInputBox(
            {
                elementHT: this.ucExtends.self,
                bindFocusEvents: false
            }
        );
        this.binder.Events.onShow.on(() => {
            this.cmd_drop.setAttribute('isopened', true);
        });
        this.binder.Events.onHide.on(() => {
            this.cmd_drop.setAttribute('isopened', false);
        });

        this.txt_editor.addEventListener("dblclick", (e) => {
            if (this.binder.hasBound) { this.binder.hide(); return; }
            this.openList();
        });
        /*this.cmd_drop.addEventListener("mousedown", (e) => {
            if (this.binder.hasBound) { this.binder.hide(); return; }
            this.openList();
            e.stopImmediatePropagation();
        });*/
        this.ucExtends.self.on("keyup mouseup", (e) => {            
            switch (objectOpt.getClassName(e)) {
                case KeyboardEvent.name:
                    this.ucExtends.self.focus();
                    break;
            }           
            if (!this.binder.hasBound) {               
                this.openList();
                
                e.stopImmediatePropagation();
            }
        });
        this.ucExtends.self.addEventListener("keyup", (e) => {
            if (e.keyCode == keyBoard.keys.space) {
                if (this.binder.hasBound) { this.binder.hide(); return; }
                this.openList();
                e.preventDefault();
            }
        });
        this.binder.Events.selectedIndexChange.on((ninex, oindex) => {
            let selRec = this.binder.selectedRecord;
            this.txt_editor.innerHTML = "";
            //console.log(this.binder.template);
            if(this.seletectedItemTemplete==undefined)
                this.txt_editor.appendChild(this.binder.template.generateNode(this.binder.selectedRecord));
            else this.txt_editor.appendChild(this.seletectedItemTemplete.generateNode(this.binder.selectedRecord));
                    
                
        });
        /* this.cmd_drop.addEventListener("mouseup",()=>{
             this.txt_editor.focus();
         })*/
    }
}
module.exports = combobox;