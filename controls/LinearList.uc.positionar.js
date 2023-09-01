const { Rect } = require("@ucbuilder:/global/drawing/shapes");
class positionar {
    /** @type {"left"|"top"|"right"|"bottom"}  */
    direction = "bottom";
    constructor() {
        this.bodyRect.setBy.domRect(document.body.getClientRects()[0]);
    }
    bodyRect = new Rect();
    dockRect = new Rect();
    /** @param {HTMLElement} dockHT */
    init(dockHT){
        this.dockHT = dockHT;
    }
    minSizeDifference = 100;
    
    /**
     * @param {HTMLElement} dockHT 
     * @param {Rect} txtboxRect 
     */
    show(txtboxRect) {
        this.styles = {
            'left': `${txtboxRect.left}px`,
            'top': `${txtboxRect.top}px`,
            'width': `${txtboxRect.width}px`,
            'height': `${txtboxRect.height}px`,
            'visibility': 'visible',
        };
        this.dockHT.style.height = 'auto';
        this.dockRect.setBy.domRect(this.dockHT.getClientRects()[0]);
        this.txtboxRect = txtboxRect;
        this.txtBoxOverFlow = txtboxRect.getOverFlowDetail(this.bodyRect);
        
        this.doprocess(this.direction);
    }
    /**
     * 
     * @param {HTMLElement} this.txtboxRect 
     * @param {"left"|"top"|"right"|"bottom"} direction 
     */
    doprocess(direction = 'bottom'){
        this.dockHT.setAttribute("dir",direction);
        switch (direction) {
            case 'bottom':
                if(this.txtBoxOverFlow.bottom<this.minSizeDifference){
                    //this.dockRect.location.initPointByVal(this.txtboxRect.left, this.txtboxRect.top-this.dockRect.height);
                    this.doprocess('top');
                    return;
                }else{
                    
                    this.dockRect.location.setBy.value(this.txtboxRect.left, this.txtboxRect.bottom);
                }
                break;
            case 'right':
                //console.log(tbFlowDetail);
                this.dockRect.location.setBy.value(this.txtboxRect.right, this.txtboxRect.top);
                break;
            case 'left':
                this.dockRect.location.setBy.value(this.txtboxRect.left - this.dockRect.width, this.txtboxRect.top);
                break;
            case 'top':
                this.dockRect.location.setBy.value(this.txtboxRect.left, this.txtboxRect.top - this.dockRect.height);
                break;
        }

        let overFlowDetail = this.dockRect.getOverFlowDetail(this.bodyRect);
        document.body.appendChild(this.dockHT);
        switch (direction) {
            case 'top':
                this.styles.top = Math.max(0,this.dockRect.location.y)-1 + "px";
                //console.log(overFlowDetail.top+'  =>  '+overFlowDetail.topSize);
                if (overFlowDetail.top > 0)
                    delete this.styles.height;
                else
                    this.styles.height = overFlowDetail.topSize + "px";
                break;
            case 'bottom':
                this.styles.top = (this.txtboxRect.bottom) + "px";
                if (overFlowDetail.bottom > 0)
                    delete this.styles.height;
                else
                    this.styles.height = overFlowDetail.bottomSize + "px";
                break;
            case 'right':
                this.styles.left = (this.txtboxRect.right) + "px";
                if (overFlowDetail.right > 0)
                    delete this.styles.width;
                else
                    this.styles.width = overFlowDetail.rightSize + "px";
                break;
        }
        console.log(overFlowDetail.right);


        Object.assign(this.dockHT.style, this.styles);
    }
}
module.exports = { positionar };