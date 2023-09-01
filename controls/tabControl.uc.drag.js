const { dragHelper } = require("@ucbuilder:/global/drag/dragHelper");
const { Usercontrol } = require("@ucbuilder:/Usercontrol");
const tabControl = require("@ucbuilder:/controls/tabControl.uc");

class dragHandler {
    constructor() { }
    /**  @type {tabControl}  */
    main = undefined;
    draging = new dragHelper();
    /**  @param {tabControl} main  */
    init(main) {
        this.main = main;
        this.draging.dragDrop((ev) => {
            let dta = dragHelper.draggedData;
            if (dta.type == "uc") {
                try {
                    /** @type {Usercontrol}  */
                    let uc = dta.data;
                    this.main.pushUc(uc);
                    this.main.refreshTabHeader();
                    this.main.tpt_itemnode.setActive(uc.ucExtends.self.index());
                    dragHelper.dragResult = true;

                } catch (exc) {
                    //console.log(esc);
                    dragHelper.dragResult = false;
                }
            }
        }, [this.main.tabView]);
        

        dragHelper.ON_START((ev) => {
            let dragdata = dragHelper.draggedData;
            if (dragdata.type == "uc") {
                this.draging.start();
                this.main.tpt_itemnode.draging.start();
            }
        }, (ev) => {
            this.draging.stop();
            this.main.tpt_itemnode.draging.stop();
        });
    }
}
module.exports = { dragHandler };