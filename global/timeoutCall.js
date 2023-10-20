class tmoNode {
    constructor() { }
    /** @type {(()=>{})[]}  */
    callbacklist = [];
    /** @param {()=>{}} callback */
    push(callback) {
        this.callbacklist.push(callback);
    }
    fire(){
        this.callbacklist.forEach(c=>c());
        this.callbacklist = [];
    }
}
class timeoutCall {
    /**
     * @param {()=>{}} callback 
     */
    static doProcess(callback){

    }
    static oldnode = new tmoNode();
    static newnode = new tmoNode();
    /** @type {'add'|''}  */ 
    static mode = '';
    static isOn = true;
    static start(callback){
        this.newnode.push(callback);
        if(!this.isOn){          
            this.isOn = true;
            setTimeout(()=>{
                this.newnode.fire();
                this.isOn = false;
            },0);
        }
    }
}
module.exports = { timeoutCall };
