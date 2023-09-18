const { Point } = require("@ucbuilder:/global/drawing/shapes");
const { newObjectOpt } = require("@ucbuilder:/global/objectOpt");
const options = {
    /**
    * @param {MouseEvent} evt 
    * @param {Point} downPoint 
    */
    onDown: (evt, downPoint) => {

    },
    /**
     * @param {MouseEvent} evt 
     * @param {Point} diff 
     */
    onMove: (evt, diff) => {

    },
    /**
     * @param {MouseEvent} evt 
     * @param {Point} diff 
     */
    onUp: (evt, diff) => {

    },
}
class mouseForMove {
    downPoint = new Point();
    diffPoint = new Point();
    constructor() {
    }
    /**
     * @param {HTMLElement} targetElement 
     * @param {options} pera 
     */
    bind(targetElement, pera) {
        let _this = this;
        let _options = newObjectOpt.copyProps(pera, options);
        
        targetElement.addEventListener("mousedown", (e) => {
            this.downPoint.setBy.value(e.pageX, e.pageY);
            _options.onDown(e, this.downPoint);
            /**  @param {MouseEvent} mouseEvt  */            
            function mousemoveEvent(mouseEvt) {
                _this.diffPoint.setBy.value(mouseEvt.pageX,mouseEvt.pageY);
                _this.diffPoint.Subtract(_this.downPoint);
                _options.onMove(mouseEvt,_this.diffPoint);                
            }
            /**  @param {MouseEvent} mouseEvt  */            
            function mouseupEvent(mouseEvt) {
                _options.onUp(mouseEvt,_this.diffPoint);
                document.body.off("mousemove", mousemoveEvent);
                document.body.off("mouseup mouseleave", mouseupEvent);
            }
            document.body.on("mousemove", mousemoveEvent);
            document.body.on("mouseup mouseleave", mouseupEvent);
        });
    }

}
module.exports = { mouseForMove };