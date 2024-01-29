"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.newObjectOpt = void 0;
//namespace ucbuilder.global.objectOptions {
const getC = (c) => {
    if (c === undefined || c === null || isNaN(c))
        return "";
    return Object.getPrototypeOf(c).constructor.name;
};
class newObjectOpt {
    static extractArguments(args) {
        let cargs = args[0];
        if (cargs.toString() === '[object Arguments]') {
            return this.extractArguments(cargs);
        }
        else
            return args;
    }
    static copyProps(from, to) {
        let rtrn = this.clone(to);
        this.recursiveProp(from, rtrn);
        return rtrn;
    }
    static recursiveProp(from, to) {
        try {
            for (const key in from) {
                if (Object.hasOwnProperty.call(from, key)) {
                    const element = from[key];
                    if (getC(element) == "Object") {
                        let sobj = to[key];
                        if (sobj != undefined)
                            this.recursiveProp(element, sobj);
                        else
                            to[key] = element;
                    }
                    else {
                        to[key] = element;
                    }
                }
            }
        }
        catch (ex) {
            if (from === undefined)
                to = from;
            return;
        }
    }
    static clone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }
    static copyAttr(from, to) {
        Array.from(from.attributes).forEach(s => to.setAttribute(s.name, s.value));
    }
    static getClassName(obj) {
        return Object.getPrototypeOf(obj).constructor.name;
    }
    static analysisObject(obj) {
        let rtrn = [];
        let npro;
        do {
            for (const key in Object.getOwnPropertyDescriptors(obj)) {
                let val = undefined;
                try {
                    val = obj[key];
                }
                catch (excp) { }
                let type = val != undefined ? this.getClassName(obj[key]) : "undefined";
                rtrn.push({
                    key: key,
                    type: type,
                    value: val
                });
            }
            obj = Object.getPrototypeOf(obj);
            npro = Object.getPrototypeOf(obj);
        } while ((npro != null || npro != undefined));
        return rtrn;
    }
}
exports.newObjectOpt = newObjectOpt;
//}
