const { Point, Size } = require("@ucbuilder:/global/drawing/shapes");
const { unitType } = require("@ucreport:/enumAndMore");
class measureManage {
  /** @type {number} ITS `pt` value of 1 `millimeter` */
  static DPI = 2.83465;  
  constructor() {}
  /** @type {string}  */
  static pxFromParse(val) {
    return val.replace(/([\d\.]+) *([a-z]+)/gim, (m, val, unit) => {
      return measureManage.pxFrom(val, unit);
    });
  }
  /**
   * @param {number} val
   * @param {unitType} from    // |'em'|'ex'|'pt'|'rem'
   * @return {number} return `pixel` from any measurement
   */
  static pxFrom(val, from = "mm") {
    let cm = undefined;
    val = val || 1;
    switch (from) {
      case 'pt': return val;
      case "cm": //   10mm  =  1cm
        return this.mmToPoint(val * 10);
      case "in": //   25.4mm  =  1in
        return this.mmToPoint(val * 25.4);
      case "mm":
        return this.mmToPoint(val);
      case "pc": //   3.0856775814914E+19mm  =  1pt
        return this.mmToPoint(val * 3.0856775814914e19);

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
  static pxTo(val, to = "mm") {
    let cm = undefined;
    switch (to) {
      case "cm":
        return this.pointToMm(val / 10);
      case "mm":
        return this.pointToMm(val);
      case "pc":
        return this.pointToMm(val / 3.0856775814914e19);
      case "in":
        return this.pointToMm(val / 25.4);
      case 'pt': return val;
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
  static getSizeFrom(w, h, fromUnit = "mm") {
    return new Size(this.pxFrom(w, fromUnit), this.pxFrom(h, fromUnit));
  }
  /**
   * @param {number} w
   * @param {number} h
   * @param {unitType} toUnit
   * @return {Size} return `Size` from
   */
  static getSizeTo(w, h, toUnit = "mm") {
    return new Size(this.pxTo(w, toUnit), this.pxTo(h, toUnit));
  }
  /** @private */
  static mmToPoint(val) {
    return val * measureManage.DPI;
  }
  /** @private */
  static pointToMm(val) {
    return val / measureManage.DPI;
  }
}
(() => {
  /* let div = document.createElement("div");
  document.body.append(div);
  Object.assign(div.style, {
    height: "1pt",
    left: "-100%",
    position: "absolute",
    top: "-100%",
    width: "1pt",
  });*/
  //measureManage.DPI = 2.83465; //div.getClientRects()[0].height;
  //console.log('df:::'+me);
  //div.remove();
})();
module.exports = { measureManage };
