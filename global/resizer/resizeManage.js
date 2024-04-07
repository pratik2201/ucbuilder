"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resizeManage = void 0;
const mouseForMove_1 = require("ucbuilder/global/mouseForMove");
const namingConversion_1 = require("ucbuilder/global/resizer/namingConversion");
const shapes_1 = require("ucbuilder/global/drawing/shapes");
const commonEvent_1 = require("ucbuilder/global/commonEvent");
const MeasureManage_1 = require("ucbuilder/global/measurement/MeasureManage");
class measurementNode {
    constructor() {
        this.size = 0;
        this.runningSize = 0;
    }
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
    constructor() {
        this.nameList = (0, namingConversion_1.getConvertedNames)();
        this.measurement = [];
        this.fillSize = false;
        this.options = {
            _container: undefined,
            _this: () => this,
            set container(val) {
                this._container = val;
                let sp = this._this().scrollPos;
                val.addEventListener("scroll", (e) => {
                    sp.x = this._container.scrollLeft;
                    sp.y = this._container.scrollTop;
                });
            },
            get container() {
                return this._container;
            },
            grid: undefined,
            getVarValue: (varName) => {
                return "";
            },
            setVarValue: (varName, val) => { },
            scale: 1,
        };
        this.scrollPos = new shapes_1.Point();
        this.Events = {
            onResizing: new commonEvent_1.CommonEvent(),
        };
        this.parentOffset = new DOMRect();
        this.hasMouseEntered = false;
        this.isCheckingHoverCollission = false;
        this.collissionResult = { hasCollied: false, index: -1 };
        this.mousemovelistner = (__e) => {
            if (this.isResizing || this.isCheckingHoverCollission)
                return;
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
        this._varName = "gridtemplate";
    }
    updateAr() {
        let counter = 0;
        this.measurement.forEach((row) => {
            counter += row.size;
            row.runningSize = counter;
        });
    }
    hasCollission(val) {
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
    redraw() {
        this.options.setVarValue(this.varName, this.measureText);
    }
    fillArrFromText(txt) {
        let prsVal = MeasureManage_1.MeasureManage.ptFromParse(txt);
        if (prsVal == undefined)
            return;
        txt = "" + MeasureManage_1.MeasureManage.ptFromParse(txt).value;
        let ar = txt.split(/ +/);
        let nlen = ar.length;
        if (this.measurement.length != nlen) {
            let rtrn = undefined;
            this.measurement.length = 0;
            ar.forEach((s, index) => {
                if (s === "auto") {
                    if (index == nlen - 1) {
                        s = '' + Number.MAX_VALUE;
                    }
                }
                let sz = parseFloat(s);
                rtrn = new measurementNode();
                rtrn.size = sz;
                this.measurement.push(rtrn);
            });
            this.updateAr();
        }
        else {
            let sz = 0;
            for (let i = 0; i < ar.length; i++) {
                sz = parseFloat(ar[1]);
                if (!isNaN(sz))
                    this.measurement[i].size = parseFloat(ar[i]);
            }
        }
    }
    init() {
        let mouseMv = new mouseForMove_1.MouseForMove();
        let leftIndex = 0, rightIndex = 0;
        let rightNode, leftNode;
        let rightNodeSize, leftNodeSize;
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
                    if (rightNode != undefined)
                        rightNodeSize = rightNode.size;
                    leftNodeSize = leftNode.size;
                    this.isResizing = true;
                }
                else
                    return false;
                evt.preventDefault();
            },
            onMove: (e, diff) => {
                let dval = diff[this.nameList.point];
                dval /= this.options.scale;
                if (e.shiftKey || this.fillSize) {
                    if (rightNode == undefined) {
                        leftNode.size = leftNodeSize + dval;
                    }
                    else {
                        diff[this.nameList.point] =
                            dval > 0
                                ? Math.min(dval, rightNodeSize)
                                : Math.max(dval, leftNodeSize * -1);
                        dval = diff[this.nameList.point];
                        leftNode.size = leftNodeSize + dval;
                        rightNode.size = rightNodeSize - dval;
                    }
                }
                else {
                    leftNode.size = leftNodeSize + dval;
                }
                if (isSettingSize)
                    return;
                isSettingSize = true;
                setTimeout(() => {
                    this.options.setVarValue(this.varName, this.measureText);
                    this.Events.onResizing.fire([e, diff]);
                    isSettingSize = false;
                }, 1);
            },
            onUp: (e, diff) => {
                if (this.isResizing)
                    this.updateAr();
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
            this.options.container.addEventListener("mousemove", this.mousemovelistner);
            this.hasMouseEntered = true;
        });
        this.options.grid.addEventListener("mouseleave", (e) => {
            this.hasMouseEntered = false;
            this.options.container.removeEventListener("mousemove", this.mousemovelistner);
        });
        this.fillArrFromText(this.options.getVarValue(this.varName));
    }
    updateOffset() {
        this.parentOffset = this.options.container.getClientRects()[0];
    }
    get varName() {
        return this._varName;
    }
    set varName(value) {
        this._varName = value;
    }
    get varValue() {
        return this.measureText;
    }
    getPrevIndex(index) {
        let rm = this.measurement;
        index--;
        for (; index >= 0 && rm[index].size == 0; index--)
            ;
        return index;
    }
    get measureText() {
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
exports.resizeManage = resizeManage;
