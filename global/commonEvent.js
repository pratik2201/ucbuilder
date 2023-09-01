const { arrayOpt, uniqOpt, objectOpt } = require("@ucbuilder:/build/common");
const eventRecord = {
    /** @type {Function}  */
    callback: undefined,
    /** @type {string}  */
    stamp: ""
}
class commonEvent {
    isSingleEvent = false;
    constructor(isSingleEvent = false) {
        this.isSingleEvent = isSingleEvent;
    }
    Events = {
        onChangeEventList:()=>{  }
    };
    /**
     * @private 
     * @type {eventRecord[]}
    */
    _eventList = [];
    onCounter = 0;
    on(callback = () => { }, stamp = uniqOpt.guid) {
        if (this.isSingleEvent) this._eventList = [];
        this.onCounter++;
        let row = objectOpt.clone(eventRecord);
        this._eventList.push({
            callback: callback,
            stamp: stamp
        });
        this.Events.onChangeEventList();
        return stamp;
    }
    removeByStamp(stamp) {
        let fIndex = this._eventList.findIndex(s => s.stamp === stamp);
        if (fIndex != -1){
            arrayOpt.removeAt(this._eventList, fIndex);        
            this.Events.onChangeEventList();
        }
    }
    off(callback) {
        let fIndex = this._eventList.findIndex(s => s.callback === callback);
        if (fIndex != -1){
            arrayOpt.removeAt(this._eventList, fIndex);        
            this.Events.onChangeEventList();
        }
    }
    get length() { return this._eventList.length; }
    fire() {
        this._eventList.forEach(s => {
            s.callback.apply(this, arguments);
        });
    }

    fireWithResult(resultCallback = /** @param {any} returnedValue */ (returnedValue) => { }) {
        let ar = Array.from(arguments);
        ar.shift();
        for (let i = 0; i < this._eventList.length; i++) {
            let s = this._eventList[i];
            if (resultCallback(s.callback(...ar)) === true) return true;
        }
        return false;
    }
    clear() {
        this._eventList = [];
        this.Events.onChangeEventList();
    }
}
module.exports = { commonEvent };