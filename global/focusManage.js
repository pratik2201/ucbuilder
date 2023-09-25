class focusManage{
    constructor(){

    }    
    /** @type {container}  */ 
    currentElement = undefined;
    fatch(){
        this.currentElement = undefined;
        this.currentElement = document.activeElement;
        //this.currentElement.fireEvent('blur');
    }
    focus(){
        if(this.currentElement!=undefined && this.currentElement!=null && this.currentElement.isConnected){
            this.currentElement.focus();
        }
    }
}
module.exports = {focusManage}