const { newObjectOpt } = require("@ucbuilder:/global/objectOpt");
const namingConversion = {
  offsetSize: "offsetWidth",
  splitterText: "splitter-width",
  gridTemplate: "grid-template-columns",
  gridAuto: "grid-auto-rows",
  point: "x",
  size: "width",
  dir: "left",
  resize: "e-resize",
  pagePoint: "pageX",
  client: "clientX",
  OPPOSITE: {
    scrollPoint: "scrollTop",
    scrollSize: "scrollBarHeight",
  },
};
module.exports = {
  namingConversion: namingConversion,
  /**
   * @param {'grid-template-columns'|'grid-template-rows'} gridTemplate
   *
   **/
  getConvertedNames: (gridTemplate = "grid-template-columns") => {
    let _rtrn = newObjectOpt.clone(namingConversion);
    if (gridTemplate == "grid-template-rows") {
      _rtrn.offsetSize = "offsetHeight";
      _rtrn.splitterText = "splitter-height";
      _rtrn.gridTemplate = gridTemplate;
      _rtrn.gridAuto = "grid-auto-columns";
      _rtrn.resize = "n-resize";
      (_rtrn.size = "height"), (_rtrn.point = "y");
      _rtrn.dir = "top";
      _rtrn.pagePoint = "pageY";
      _rtrn.client = "clientY";
      _rtrn.OPPOSITE = {
        scrollPoint: "scrollLeft",
        scrollSize: "scrollBarWidth",
      };
    }
    return _rtrn;
  },
};
