"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommonEvent = void 0;
const common_1 = require("ucbuilder/build/common");
const eventRecord = {
    callback: () => { },
    stamp: ''
};
const resultCallback = (returnedValue) => false;
class CommonEvent {
    constructor(isSingleEvent = false) {
        this.isSingleEvent = false;
        this.Events = {
            onChangeEventList: () => { }
        };
        this._eventList = [];
        this._onCounter = 0;
        this.isSingleEvent = isSingleEvent;
    }
    get onCounter() {
        return this._onCounter;
    }
    set onCounter(value) {
        this._onCounter = value;
    }
    on(callback, stamp = common_1.uniqOpt.guid) {
        if (this.isSingleEvent)
            this._eventList = [];
        this.onCounter++;
        //let row: EventRecord = objectOpt.clone(eventRecord);
        this._eventList.push({
            callback: callback,
            stamp: stamp
        });
        this.Events.onChangeEventList();
        return stamp;
    }
    removeByStamp(stamp) {
        let fIndex = this._eventList.findIndex(s => s.stamp === stamp);
        if (fIndex != -1) {
            common_1.arrayOpt.removeAt(this._eventList, fIndex);
            this.Events.onChangeEventList();
        }
    }
    off(callback) {
        let fIndex = this._eventList.findIndex(s => s.callback === callback);
        if (fIndex != -1) {
            common_1.arrayOpt.removeAt(this._eventList, fIndex);
            this.Events.onChangeEventList();
        }
    }
    get length() {
        return this._eventList.length;
    }
    fire(...args) {
        this._eventList.forEach(s => {
            s.callback.apply(this, args);
        });
    }
    fireWithResult(_resultCallback = resultCallback) {
        let ar = Array.from(arguments);
        ar.shift();
        for (let i = 0; i < this._eventList.length; i++) {
            let s = this._eventList[i];
            if (_resultCallback(s.callback(...ar)) === true)
                return true;
        }
        return false;
    }
    clear() {
        this._eventList = [];
        this.Events.onChangeEventList();
    }
}
exports.CommonEvent = CommonEvent;
