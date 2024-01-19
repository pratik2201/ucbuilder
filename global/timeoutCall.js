"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.timeoutCall = void 0;
class tmoNode {
    constructor() {
        this.callbacklist = [];
    }
    push(callback) {
        this.callbacklist.push(callback);
    }
    fire() {
        this.callbacklist.forEach(c => c());
        this.callbacklist = [];
    }
}
class timeoutCall {
    static start(callback) {
        callback();
        return;
        this.counter++;
        this.newnode.push(callback);
        if (!this.isOn) {
            this.isOn = true;
            setTimeout(() => {
                this.newnode.fire();
                this.isOn = false;
            });
        }
    }
}
exports.timeoutCall = timeoutCall;
timeoutCall.oldnode = new tmoNode();
timeoutCall.newnode = new tmoNode();
timeoutCall.mode = '';
timeoutCall.isOn = false;
timeoutCall.counter = 0;
