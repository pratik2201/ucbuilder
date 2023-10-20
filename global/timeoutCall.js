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
    oldnode = new tmoNode();
    newnode = new tmoNode();
    /** @type {'add'|''}  */ 
    static mode = '';
    static isOn = true;
    static start(callback){
        if(this.isOn){

        }else{            
            setTimeout(()=>{
                this.isOn = false;
            },0);
        }
    }
}
module.exports = { timeoutCall };
