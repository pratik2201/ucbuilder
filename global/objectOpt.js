//const { assignIn } = require("lodash");

/**
 * @param {{}} c 
 * @returns {string|undefined}
 */
const getC = (c) => {
    if (c === undefined || c === null || c === NaN) return "";
    return c.__proto__.constructor.name;
}
/**
 * @param {{}} from 
 * @param {{}} to 
 */
const copyProps = (from, to) => {
    //assignIn(to,from);
    //onsole.log(from);
    //if(getC(from) == 'Object'){

    try {

        for (const key in from) {
            //   console.log(key);
            if (Object.hasOwnProperty.call(from, key)) {
                const element = from[key];
                if (getC(element) == "Object") {
                    copyProps(element, to[key]);
                } else {
                    to[key] = element;
                }
            }
        }
    } catch (ex) {
        if (from === undefined) to = from;
        return;
    }
    //}
    //console.log(to);
}

/**
 * @param {HTMLElement} from 
 * @param {HTMLElement} to 
 */
const copyAttr = (from, to) => {
    Array.from(from.attributes).forEach(s =>
        to.setAttribute(s.name, s.value)
    );
}
/**
* @template T 
* 
* @param {T} obj 
* @returns {T}
*/
const clone = (obj) => {
    //console.log('here');
    return JSON.parse(JSON.stringify(obj));
}
module.exports = { copyProps, copyAttr, clone };