import { newObjectOpt } from "ucbuilder/global/objectOpt";

export interface NamingConversion {
  offsetSize: string;
  splitterText: string;
  gridTemplate: string;
  gridAuto: string;
  point: string;
  size: string;
  dir: string;
  resize: string;
  pagePoint: string;
  client: string;
  offsetPoint: string;
  OPPOSITE: {
    scrollPoint: string;
    scrollSize: string;
  };
}

export const namingConversion: NamingConversion = {
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
  offsetPoint: "offsetX",
  OPPOSITE: {
    scrollPoint: "scrollTop",
    scrollSize: "scrollBarHeight",
  },
};

export const getConvertedNames = (gridTemplate: "grid-template-columns" | "grid-template-rows" = "grid-template-columns"): NamingConversion => {
  let _rtrn = newObjectOpt.clone(namingConversion);
  if (gridTemplate == "grid-template-rows") {
    _rtrn.offsetSize = "offsetHeight";
    _rtrn.splitterText = "splitter-height";
    _rtrn.gridTemplate = gridTemplate;
    _rtrn.gridAuto = "grid-auto-columns";
    _rtrn.resize = "n-resize";
    _rtrn.size = "height";
    _rtrn.point = "y";
    _rtrn.dir = "top";
    _rtrn.pagePoint = "pageY";
    _rtrn.client = "clientY";
    _rtrn.offsetPoint = "offsetY";
    _rtrn.OPPOSITE = {
      scrollPoint: "scrollLeft",
      scrollSize: "scrollBarWidth",
    };
  }
  return _rtrn;
};

