/**
 * @param {{}} c 
 * @returns {string|undefined}
 */
const getC = (c) => {
    if (c === undefined || c === null || c === NaN) return "";
    return c.__proto__.constructor.name;
}
const newObjectOpt = {
    /**
     * @template {{}} T
     * @param {{}} from 
     * @param {T} to 
     * @returns {T}
     */
    copyProps(from, to) {
        let rtrn = this.clone(to);
        this.recursiveProp(from,rtrn);
        return rtrn;
    },
    /** @private */
    recursiveProp(from, to) {
        try {

            for (const key in from) {
                //   console.log(key);
                if (Object.hasOwnProperty.call(from, key)) {
                    const element = from[key];
                    if (getC(element) == "Object") {
                        this.recursiveProp(element, to[key]);
                    } else {
                        to[key] = element;
                    }
                }
            }
        } catch (ex) {
            if (from === undefined) to = from;
            return;
        }
    },
    /**
    * @template T 
    * 
    * @param {T} obj 
    * @returns {T}
    */
    clone(obj) {
        //console.log('here');
        return JSON.parse(JSON.stringify(obj));
    },
    /**
     * @param {container} from 
     * @param {container} to 
     */
    copyAttr(from, to) {
        Array.from(from.attributes).forEach(s =>
            to.setAttribute(s.name, s.value)
        );
    },

    /**
     * @param {any} obj class reference
     * @returns {string}
     */
    getClassName(obj) { return Object.getPrototypeOf(obj).constructor.name; },
    /**
     * @param {Object} obj 
     * @param {string} ar lowercase string to find
     */
    analysisObject(obj) {
        /** 
         * @type {{
         *    key:string,
         *    value:object,
         *    type:string
         * }[]}  
         **/
        let rtrn = [];
        do {
            for (const key in Object.getOwnPropertyDescriptors(obj)) {
                let val = undefined;
                try { val = obj[key]; } catch (excp) { }
                let type = val != undefined ? this.getClassName(obj[key]) : "undefined";
                rtrn.push({
                    key: key,
                    type: type,
                    value: val
                });
            }
            obj = obj.__proto__;
        } while ((obj.__proto__ != null || obj.__proto__ != undefined));

        return rtrn;
    },

}




module.exports = { newObjectOpt };