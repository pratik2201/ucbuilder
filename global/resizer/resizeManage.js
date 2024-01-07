const { mouseForMove } = require("@ucbuilder:/global/mouseForMove");
const { getConvertedNames } = require("@ucbuilder:/global/resizer/namingConversion");
const { Point } = require("@ucbuilder:/global/drawing/shapes");
const { commonEvent } = require("@ucbuilder:/global/commonEvent");
const { measureManage } = require("@ucbuilder:/global/measurement/measureManage");
class measurementNode {
  /** @type {number}  */
  size = 0;

  /** @type {number}  */
  runningSize = 0;

  get prevRunningSize() {
    return this.runningSize - this.size;
  }

  get minVal() {
    return this.runningSize - 2;
  }
  get maxVal() {
    return this.runningSize + 2;
  }

  hasCollission(val) {
    return val >= this.minVal && val <= this.maxVal;
  }
}

class resizeManage {
  constructor() {}

  updateAr() {
    let counter = 0;
    this.measurement.forEach((row) => {
      counter += row.size;
      row.runningSize = counter;
    });
    /*counter = 0;
        this.measurementExp.forEach((row) => {
            counter += row.size;
            row.runningSize = counter;
        });*/
  }
  hasCollission(val) {
    //val /= this.options.scale;
    let rtrn = { hasCollied: false, index: -1 };
    for (let i = 0; i < this.measurement.length; i++) {
      //  console.log(val+"  :  "+this.measurement[i].runningSize);
      if (this.measurement[i].hasCollission(val)) {
        rtrn.hasCollied = true;
        rtrn.index = i;
        break;
      }
    }
    return rtrn;
  }
  redraw(){
    this.options.setVarValue(this.varName,this.measureText);
  }
  /**
   * @param {string} txt
   * @returns {measurementNode[]}
   */
  fillArrFromText(txt) {
    txt = measureManage.ptFromParse(txt).value;
    /*.replace(/(\d+)([a-z]+)/gim, (m, val, unit) => {
      return measureManage.pxFrom(val, unit);
    });*/

    let ar = txt.split(/ +/);
    let nlen = ar.length;
    if (this.measurement.length != nlen) {
      let rtrn = undefined;
      this.measurement.length = 0;
      ar.forEach((s, index) => {
        if (s === "auto") {
          if (index == nlen - 1) {
            s = Number.MAX_VALUE;
          }
        }
        let sz = parseFloat(s);
        rtrn = new measurementNode();
        rtrn.size = sz;
        this.measurement.push(rtrn);
      });
      this.updateAr();
    } else {
      let sz = 0;
      for (let i = 0; i < ar.length; i++) {
        sz = parseFloat(ar[1]);
        if (!isNaN(sz)) this.measurement[i].size = parseFloat(ar[i]);
        /*let v = ar[i];
        let res = v.match(/(\d+)([a-z]+)/i);
        if (res != undefined) {}*/
      }
    }
    //console.log(this.measurement.map((s) => s.size).join("px ") + "px");
  }
  nameList = getConvertedNames();

  /** @type {measurementNode[]}  */
  measurement = [];

  fillSize = false;
  options = {
    /** @private @type {HTMLElement}  */
    _container: undefined,
    /** @private */
    _this: () => this,
    set container(val) {
      this._container = val;
      let sp = this._this().scrollPos;
      val.addEventListener("scroll", (e) => {
        sp.x = this._container.scrollLeft; //*this.scale;
        sp.y = this._container.scrollTop; //*this.scale;
        //console.log('=============>'+sp.y);
      });
    },
    get container() {
      return this._container;
    },

    /** @type {HTMLElement}  */
    grid: undefined,
    getVarValue: (varName) => {
      return "";
    },
    setVarValue: (varName, val) => {},
    scale: 1,
  };
  scrollPos = new Point();
  init() {
    let mouseMv = new mouseForMove();
    let leftIndex = 0,
      rightIndex = 0;

    /** @type {measurementNode}  */
    let rightNode, /** @type {measurementNode}  */ leftNode;
    /** @type {measurementNode}  */
    let rightNodeSize, /** @type {measurementNode}  */ leftNodeSize;

    this.isResizing = false;
    let isSettingSize = false;
    mouseMv.bind({
      onDown: (evt, dpoint) => {
        this.fillArrFromText(this.options.getVarValue(this.varName));
        if (this.collissionResult.hasCollied) {
          this.updateOffset();
          leftIndex = this.collissionResult.index;
          rightIndex = leftIndex + 1;
          rightNode = this.measurement[rightIndex];
          leftNode = this.measurement[leftIndex];
          if (rightNode != undefined) rightNodeSize = rightNode.size;
          leftNodeSize = leftNode.size;

          this.isResizing = true;
        } else return false;
        evt.preventDefault();
      },
      onMove: (e, diff) => {
        let dval = diff[this.nameList.point];
        dval /= this.options.scale;
        if (e.shiftKey || this.fillSize) {
          //  FILL MODE
          if (rightNode == undefined) {
            leftNode.size = leftNodeSize + dval;
          } else {
            diff[this.nameList.point] =
              dval > 0
                ? Math.min(dval, rightNodeSize)
                : Math.max(dval, leftNodeSize * -1);
            dval = diff[this.nameList.point];
            leftNode.size = leftNodeSize + dval;
            rightNode.size = rightNodeSize - dval;
          }
        } else {
          //  INCREASE MODE
          leftNode.size = leftNodeSize + dval;
        }
        if (isSettingSize) return;
        isSettingSize = true;
        setTimeout(() => {
          this.options.setVarValue(this.varName, this.measureText);
          this.Events.onResizing.fire(e, diff);
          isSettingSize = false;
        }, 1);
      },
      onUp: (e, diff) => {
        //console.log('onUp');
        if (this.isResizing) this.updateAr();
        isSettingSize = false;
        this.collissionResult.hasCollied = false;
        this.collissionResult.index = -1;
        this.fillArrFromText(this.options.getVarValue(this.varName));
        this.updateOffset();
        this.isResizing = false;
      },
    },this.options.container);

    this.options.grid.addEventListener("mouseenter", (e) => {
      this.updateOffset();
      this.options.container.addEventListener(
        "mousemove",
        this.mousemovelistner
      );
      this.hasMouseEntered = true;
    });
    this.options.grid.addEventListener("mouseleave", (e) => {
      this.hasMouseEntered = false;
      this.options.container.removeEventListener(
        "mousemove",
        this.mousemovelistner
      );
    });
    this.fillArrFromText(this.options.getVarValue(this.varName));
  }
  Events = {
    /**
     * @type {{on:(callback = (
     *          evt:MouseEvent,
     *          diff:Point,
     * ) =>{})} & commonEvent}
     */
    onResizing: new commonEvent(),
  };

  parentOffset = new DOMRect();
  updateOffset() {
    this.parentOffset = this.options.container.getClientRects()[0];
  }
  hasMouseEntered = false;
  isCheckingHoverCollission = false;
  collissionResult = { hasCollied: false, index: -1 };
  /** @param {MouseEvent} __e  */
  mousemovelistner = (__e) => {
    //console.log();
    if (this.isResizing || this.isCheckingHoverCollission)return;
    
    let ete = __e;
    let scale = this.options.scale;
    this.isCheckingHoverCollission = true;
    setTimeout(() => {
      this.isCheckingHoverCollission = false;
      let clientPos = ete[this.nameList.client];
      let parentOffst = this.parentOffset[this.nameList.point];
      let cursorPos = clientPos - parentOffst;
      cursorPos += this.scrollPos[this.nameList.point];
      
      this.collissionResult = this.hasCollission(cursorPos);
      this.options.container.style.cursor = this.collissionResult.hasCollied
        ? this.nameList.resize
        : "";
    }, 1);
  };
  _varName = "gridtemplate";
  get varName() {
    return this._varName;
  }
  set varName(value) {
    this._varName = value;
  }

  getPrevIndex(index) {
    let rm = this.measurement;
    index--;
    for (; index >= 0 && rm[index].size == 0; index--);
    return index;
  }
  get measureText() {
    //let scale = this.options.scale;
    
    //console.log();
    let rval = this.measurement.length <= 1
      ? "auto"
      : this.fillSize
      ? this.measurement
          .map((s) => (s.size))
          .slice(0, -1)
          .join("px ") + "px auto"
      : this.measurement.map((s) =>(s.size)).join("px ") + "px";
      return rval;
  }
}
module.exports = { resizeManage };
