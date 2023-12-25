const { Point, Size } = require("@ucbuilder:/global/drawing/shapes");
const { unitType } = require("@ucreport:/enumAndMore");
class measureManage {
  /** @type {number}  */
  static DPI = undefined;
  constructor() {}
  /** @type {string}  */ 
  static pxFromParse(val){
    return val.replace(/(\d+)([a-z]+)/gim, (m, val, unit) => {
      return measureManage.pxFrom(val, unit);
    });
  }
  /**
   * @param {number} val
   * @param {unitType} from    // |'em'|'ex'|'pt'|'rem'
   * @return {number} return `pixel` from any measurement
   */
  static pxFrom(val, from = "cm") {
    let cm = undefined;
    val = val || 1;
    switch (from) {
      case "cm":
        return this.cmToPixel(val);
      case "mm":
        return this.cmToPixel(val * 0.1);
      case "pc":
        return this.cmToPixel(val * 3.0856775814914e18);
      case "in":
        return this.cmToPixel(val * 2.54);
      default:
        return val;
      /*case 'em':
                cm = val * 0.42175176;
                return this.cmToPixel(cm);*/
    }
  }
  
  /**
   * @param {number} val
   * @param {unitType} from    // |'em'|'ex'|'pt'|'rem'
   * @return {number} return `pixel` from any measurement
   */
  static pxTo(val, to = "cm") {
    let cm = undefined;
    switch (to) {
      case "cm":
        return this.pixelToCm(val);
      case "mm":
        return this.pixelToCm(val / 0.1);
      case "pc":
        return this.pixelToCm(val / 3.0856775814914e18);
      case "in":
        return this.pixelToCm(val / 2.54);
      default:
        return val;
     
    }
  }
  /**
   * @param {number} w
   * @param {number} h
   * @param {unitType} fromUnit
   * @return {Size} return `Size` from
   */
  static getSizeFrom(w, h, fromUnit = "cm") {
    return new Size(this.pxFrom(w, fromUnit), this.pxFrom(h, fromUnit));
  }
  /**
   * @param {number} w
   * @param {number} h
   * @param {unitType} toUnit
   * @return {Size} return `Size` from
   */
  static getSizeTo(w, h, toUnit = "cm") {
    return new Size(this.pxTo(w, toUnit), this.pxTo(h, toUnit));
  }
  /** @private */
  static cmToPixel(val) {
    return val * measureManage.DPI;
  }
  /** @private */
  static pixelToCm(val) {
    return val / measureManage.DPI;
  }
}
(() => {
  let div = document.createElement("div");
  document.body.append(div);
  Object.assign(div.style, {
    height: "1cm",
    left: "-100%",
    position: "absolute",
    top: "-100%",
    width: "1cm",
  });
  measureManage.DPI = div.getClientRects()[0].height;
  div.remove();
})();
module.exports = { measureManage };
