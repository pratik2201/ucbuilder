import { MouseForMove } from "ucbuilder/global/mouseForMove";
import { getConvertedNames } from "ucbuilder/global/resizer/namingConversion";
import { Point } from "ucbuilder/global/drawing/shapes";
import { CommonEvent } from "ucbuilder/global/commonEvent";
import { MeasureManage } from "ucbuilder/global/measurement/measureManage";

class measurementNode {
  size: number = 0;
  runningSize: number = 0;

  get prevRunningSize(): number {
    return this.runningSize - this.size;
  }

  get minVal(): number {
    return this.runningSize - 2;
  }

  get maxVal(): number {
    return this.runningSize + 2;
  }

  hasCollission(val: number): boolean {
    return val >= this.minVal && val <= this.maxVal;
  }
}

class resizeManage {
  constructor() {}
  isResizing: boolean;
  updateAr(): void {
    let counter = 0;
    this.measurement.forEach((row) => {
      counter += row.size;
      row.runningSize = counter;
    });
  }

  hasCollission(val: number): { hasCollied: boolean; index: number } {
    let rtrn = { hasCollied: false, index: -1 };
    for (let i = 0; i < this.measurement.length; i++) {
      if (this.measurement[i].hasCollission(val)) {
        rtrn.hasCollied = true;
        rtrn.index = i;
        break;
      }
    }
    return rtrn;
  }

  redraw(): void {
    this.options.setVarValue(this.varName, this.measureText);
  }

  fillArrFromText(txt: string): void {
    let prsVal = MeasureManage.ptFromParse(txt);
    if (prsVal == undefined) return;
    txt = "" + MeasureManage.ptFromParse(txt).value;
    let ar = txt.split(/ +/);
    let nlen = ar.length;
    if (this.measurement.length != nlen) {
      let rtrn = undefined;
      this.measurement.length = 0;
      ar.forEach((s, index) => {
        if (s === "auto") {
          if (index == nlen - 1) {
            s = ''+Number.MAX_VALUE;
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
      }
    }
  }

  nameList = getConvertedNames();

  measurement: measurementNode[] = [];

  fillSize: boolean = false;

  options = {
    _container: undefined as HTMLElement | undefined,
    _this: () => this,
    set container(val: HTMLElement) {
      this._container = val;
      let sp = this._this().scrollPos;
      val.addEventListener("scroll", (e) => {
        sp.x = this._container.scrollLeft;
        sp.y = this._container.scrollTop;
      });
    },
    get container(): HTMLElement | undefined {
      return this._container;
    },

    grid: undefined as HTMLElement | undefined,
    getVarValue: (varName: string): string => {
      return "";
    },
    setVarValue: (varName: string, val: string): void => {},
    scale: 1,
  };

  scrollPos = new Point();

  init(): void {
    let mouseMv = new MouseForMove();
    let leftIndex = 0,
      rightIndex = 0;

    let rightNode: measurementNode ,
      leftNode: measurementNode ;
    let rightNodeSize: number ,
      leftNodeSize: number;

    this.isResizing = false;
    let isSettingSize = false;
    mouseMv.bind({
      onDown: (evt: MouseEvent, dpoint: Point): boolean => {
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
      onMove: (e: MouseEvent, diff: Point): void => {
        let dval = diff[this.nameList.point];
        dval /= this.options.scale;
        if (e.shiftKey || this.fillSize) {
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
          leftNode.size = leftNodeSize + dval;
        }
        if (isSettingSize) return;
        isSettingSize = true;
        setTimeout(() => {
          this.options.setVarValue(this.varName, this.measureText);
          this.Events.onResizing.fire([e, diff]);
          isSettingSize = false;
        }, 1);
      },
      onUp: (e: MouseEvent, diff: Point): void => {
        if (this.isResizing) this.updateAr();
        isSettingSize = false;
        this.collissionResult.hasCollied = false;
        this.collissionResult.index = -1;
        this.fillArrFromText(this.options.getVarValue(this.varName));
        this.updateOffset();
        this.isResizing = false;
      },
    }, this.options.container);

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
    onResizing: new CommonEvent(),
  };

  parentOffset = new DOMRect();

  updateOffset(): void {
    this.parentOffset = this.options.container.getClientRects()[0];
  }

  hasMouseEntered = false;
  isCheckingHoverCollission = false;
  collissionResult = { hasCollied: false, index: -1 };

  mousemovelistner = (__e: MouseEvent): void => {
    if (this.isResizing || this.isCheckingHoverCollission) return;

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
  get varName(): string {
    return this._varName;
  }
  set varName(value: string) {
    this._varName = value;
  }
  get varValue(): string {
    return this.measureText;
  }
  
  getPrevIndex(index: number): number {
    let rm = this.measurement;
    index--;
    for (; index >= 0 && rm[index].size == 0; index--);
    return index;
  }

  get measureText(): string {
    let rval = this.measurement.length <= 1
      ? "auto"
      : this.fillSize
      ? this.measurement
          .map((s) => s.size)
          .slice(0, -1)
          .join("px ") + "px auto"
      : this.measurement.map((s) => s.size).join("px ") + "px";
    return rval;
  }
}

export { resizeManage };