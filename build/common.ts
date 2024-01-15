import { existsSync, readFileSync, unlinkSync, writeFileSync } from "fs";
import crypto from "crypto";
//namespace ucbuilder.build.common {  
export class buildOptions {
  static extType = Object.freeze({
    none: "none",
    Usercontrol: ".uc",
    template: ".tpt",
  })
  static ignoreDirs = ["@ucbuilder:/node_modules", "@ucbuilder:/.vscode"];
}
export class uniqOpt {
  static get guid(): string {
    return crypto.randomBytes(16).toString("hex");
    //let v = v1();
    //return v;
  }
  static get guidAs_(): string {
    return crypto.randomBytes(16).toString("hex");
    //let v = v1().replace(/-/g, "_");
    //return v;
  }
  static randomNo(min: number = 0, max: number = 1000000): number {
    let difference = max - min;
    let rand = Math.random();
    rand = Math.floor(rand * difference);
    rand = rand + min;
    return rand;
  }
}
export class objectOpt {
  /**
   * @param {Object} obj
   * @param {string} isOfthisClass class name to compare
   */
  static parse = (obj: object, isOfthisClass: string): boolean => {
    if (obj == undefined || Object.getPrototypeOf(obj) == null) return false;
    while (Object.getPrototypeOf(obj).constructor.name != isOfthisClass) {
      obj = Object.getPrototypeOf(obj);
      if (Object.getPrototypeOf(obj) == null) return false;
    }
    return true;
  }
  static assign(to: object, from: object): void {
    // Object.keys(to).forEach(ky => {
    //     to[ky] = from[ky];
    // });
  }

  static emptyObject = (obj: object): object => {
    return {};
    //   Object.keys(obj).forEach(function (key) {
    //     delete obj[key];
    //   });

    /*function excludeKey<T extends object, U extends keyof any>(
      obj: T,
      key: U
    ) {
      const { [key]: _, ...newObj } = obj;
      return newObj;
    }*/
  }
  /**
   * @template T
   * @param {T} obj
   * @returns {T}
   */
  static clone(obj: object): object {
    //console.log('here');
    return JSON.parse(JSON.stringify(obj));
  }
  /**
   * @param {{}} obj
   */
  static deepClone1 = (obj: object): object => {
    return objectOpt.clone(obj);
  }

  static getValByNameSpace = (obj: object, str: string): object => {
    let ars = str.split(".");
    try {
      ars.forEach((ar) => {
        obj = obj[ar as keyof typeof obj];
      });
      return obj;
    } catch {
      return undefined;
    }
  }
  /**
   * @param {{}} obj
   * @param {string} namespace property name i.e. person.address.home;
   * @param {string} valToAssign value to assign last property
   */
  static setChildValueByNameSpace(
    obj: object,
    namespace: string,
    valToAssign: string
  ): boolean {
    namespace.toLowerCase();
    //console.log("==>"+namespace);
    let ars = namespace.split(".");

    try {
      for (let i = 0; i < ars.length - 1; i++) {
        let k = objectOpt.getKeyFromObject(obj, ars[i]);

        if (k != undefined) obj = obj[k]; // k as keyof typeof obj
        else return false;
      }
      let lk = objectOpt.getKeyFromObject(obj, ars.pop());
      //console.log(lk);
      if (lk != undefined) {
        obj[lk] = valToAssign;
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      return false;
    }
  }
  /**
   * @param {Object} obj
   * @param {string} ar lowercase string to find
   */
  static getKeyFromObject = (obj: object, ar: string): string => {
    do {
      for (const key in Object.getOwnPropertyDescriptors(obj)) {
        if (key.toLowerCase() == ar) return key;
      }
      obj = Object.getPrototypeOf(obj);
    } while (obj != null || obj != undefined);
    return undefined;
  }

  static getParentClass = (obj: object): object => {
    return Object.getPrototypeOf(obj.constructor);
  }
  /**
   * @param {any} obj class reference
   * @returns {string}
   */
  static getClassName = (obj: any): string => {
    return Object.getPrototypeOf(obj).constructor.name;
  }
  static has = (key: string, obj: object): boolean => {
    return key in obj;
  }
}
export class controlOpt {
  static ATTR = Object.freeze({
    editableControls:
      "input,textarea,select,button,[tabindex='-1'],[contenteditable='true']",
  });
  static type = Object.freeze({
    usercontrol: "userontrol",
    form: "form",
  });
  /** @private */

  // /**
  //  * @param {JQuery} $ele
  //  */
  // hasFocus($ele: JQuery): boolean {
  //     return $ele.is(":focus");
  // },

  static selectAllText = (elem: HTMLInputElement | HTMLElement): void => {
    if ((elem as HTMLInputElement).select)
      (elem as HTMLInputElement).select();
    else selectElementContents(elem);
    function selectElementContents(el: HTMLElement) {
      //console.log(el);
      var range = document.createRange();
      range.selectNodeContents(el);
      var sel = window.getSelection();
      sel.removeAllRanges();
      try {
        sel.addRange(range);
      } catch (exp) {
        console.log(exp);
      }
    }
  }
  static setProcessCSS = (styleName: string, value: string): void => {
    document.execCommand("styleWithCSS", true, "" + true);
    document.execCommand(styleName, true, value);
  }
  // /**
  //  * @param {JQuery} $ele
  //  */
  // hasFocus($ele: JQuery): boolean {
  //     return $ele.is(":focus");
  // },

  /**
   * @param {HTMLElement} sourceTag
   * @param {string} newName
   * @returns {HTMLElement}
   */
  static renameTag = (sourceTag: HTMLElement, newName: string): HTMLElement => {
    var d = document.createElement(newName);
    d.innerHTML = sourceTag.innerHTML;
    Array.from(sourceTag.attributes).forEach((s) => {
      if (s.specified)
        try {
          d.setAttribute(s.name, s.value);
        } catch (e) {
          console.log(e);
        }
    });
    sourceTag.parentNode.replaceChild(d, sourceTag);
    return d;
  }
  /**
   * @param {Node} textNode
   */
  static TextNodeToElement = (textNode: Node): void => {
    var spanNode = document.createElement("span");
    spanNode.setAttribute("class", "red");
    var newTextNode = document.createTextNode(textNode.textContent);
    spanNode.appendChild(newTextNode);
    textNode.parentNode.replaceChild(spanNode, textNode);
  }

  static sizing = {
    /** @param {CSSStyleDeclaration} elestyle */
    getFullHeight: (elestyle: CSSStyleDeclaration): number => {
      return (
        parseFloat(elestyle.height) +
        parseFloat(elestyle.paddingBottom) +
        parseFloat(elestyle.paddingTop) +
        parseFloat(elestyle.borderBottomWidth) +
        parseFloat(elestyle.borderTopWidth)
      );
    },
    /** @param {CSSStyleDeclaration} elestyle */
    getFullWidth: (elestyle: CSSStyleDeclaration): number => {
      return (
        parseFloat(elestyle.width) +
        parseFloat(elestyle.paddingLeft) +
        parseFloat(elestyle.paddingRight) +
        parseFloat(elestyle.borderLeftWidth) +
        parseFloat(elestyle.borderRightWidth)
      );
    },
  }
}
export class propOpt {
  static ATTR = Object.freeze({
    // UC_STAMP: "a" + randNumbers(),
    // PARENT_STAMP: "a" + randNumbers(),
    // UNIQUE_STAMP: "a" + randNumbers(),

    FILE_STAMP: "file-stamp",
    BASE_OBJECT: "base_object",
    ACCESS_KEY: "x-name",
    TEMPLETE_DEFAULT: "primary",
    TEMPLETE_ACCESS_KEY: "x-tname",
    SCOPE_KEY: "x-scope",
    OPTION: "_option",
    //
  });
  static hasAttr = (attr: any): boolean => {
    return typeof attr !== "undefined" && attr !== false;
  }
}
export class looping {
  /**
   * @param {Array} arr
   * @param {Function} callback
   * @returns
   */
  static removeFromArray = (
    arr: any[],
    callback: (ele: any) => boolean = (ele) => {
      return false;
    }
  ): any[] => {
    let i = 0;
    while (i < arr.length) {
      if (callback(arr[i])) {
        arr.splice(i, 1);
      } else {
        ++i;
      }
    }
    return arr;
  }
  static kvp(
    obj: object,
    callback: (k: string, v: any) => void = (k, v) => { }
  ): void {
    Object.entries(obj).forEach(([key, value]) => {
      callback(key, value);
    });
  }
  /**
   * @param {Array} ar Array To iterate
   * @param {Function} callback func return true will exit the loop
   */
  static iterateArray = (
    ar: any[] = [],
    callback: (ele: any) => boolean = (ele) => {
      return true;
    }
  ): boolean => {
    let escapeLoop = undefined;
    for (let index = 0; index < ar.length && escapeLoop !== true; index++) {
      escapeLoop = callback(ar[index]);
    }
    return escapeLoop === true;
  }
  static filterJson = (
    jData: any[] = [],
    eachCalback: (row: any, index: number) => boolean = (row, index) => {
      return false;
    }
  ): string => {
    return ""; //$.grep(jData, eachCalback);
  }

  /**
   * @param {HTMLElement} htEle
   */
  static htmlChildren = (
    htEle: HTMLElement,
    eachCalback: (row: HTMLElement, index: number) => boolean = (
      row,
      index
    ) => {
      return false;
    }
  ): void => {
    for (let index = 0; index < htEle.children.length; index++) {
      if (
        eachCalback(htEle.children.item(index) as HTMLElement, index) === true
      )
        return;
    }
  }
}
export interface filePartlyInfo{
  dirPath: string;
  sortDirPath:string,
  fileName: string;
  extension: string;
  type: string;
  fullPath?: string;
}
// const filePartInfo:filePartInfo = {
//   dirPath: '',
//   fileName:'',
//   extension: '',
//   type: '',
//   fullPath: '',
// }
export class pathInfo {
  
  static CODEFILE_TYPE = Object.freeze({
    ucHtmlFile: "ucHtmlFile",
    ucTemplateFile: "ucTemplateFile",
    ucDesignerFile: "ucDesignerFile",
    ucCodeFile: "ucCodeFile",
    ucStyleFile: "ucStyleFile",
  });
  static TYPE = Object.freeze({
    directory: "directory",
    file: "file",

  });
  static cleanPath(_pth: string = ""): string {

    return strOpt.trim__(_pth.replace(/[\\/]{1,}/g, "/"), "/ ");
  }
  static existFile(_path: string): boolean {

    return existsSync(_path);
  }
  static removeFile(_path: string): void {
    unlinkSync(_path);
  }

  static readFile(_path: string): string {
    return readFileSync(_path, "binary");
  }
  static writeFile(_path: string, _data: string): void {
    writeFileSync(_path, _data, { encoding: "binary" });
  }
  /**
   * @param {string} fullPath
   * @returns string
   */
  static getFileNameFromPath(fullPath: string): string {
    return fullPath.replace(/^.*[\\\/]/, "");
  }

  /**
   * @param {string} fullPath
   * @returns string
   */
  static getFileNameWithoutExtFromPath(fullPath: string): string {
    return fullPath.replace(
      /(^.*[\\\/])(.*)/gm,
      /**
       * @param {string} mch
       * @param {string} dirPath
       * @param {string} filename
       * @returns
       */
      (mch: string, dirPath: string, filename: string): string => {
        let index = filename.indexOf(".");
        if (index != -1) filename = filename.substring(0, index);
        return dirPath + filename;
      }
    );
  }
  
  /**
   * @param {string} fullPath
   * @returns string
   */
  static getFileInfoPartly(
    fullPath: string
  ):filePartlyInfo {
    let rtrn = {} as filePartlyInfo;
    let array = Array.from(fullPath.matchAll(/(^.*[\\\/])(.*)/gm))[0];
    if (array != undefined) {
      /** @type {string}  */
      let dirPath = array[1];
      /** @type {string}  */
      let filename = array[2];
      let index = filename.indexOf(".");
      rtrn.dirPath = dirPath;
      rtrn.fullPath = fullPath;
      if (index != -1) {
        rtrn.fileName = filename.substring(0, index);
        let flen = filename.length;
        rtrn.extension = filename.substring(index, flen);
        let lindex = filename.lastIndexOf(".");

        rtrn.type =
          lindex == index ? rtrn.extension : filename.substring(lindex, flen);
      }
    }
    return rtrn;
  }
}
export class arrayOpt {
  /**
  * @param {Array} currentArr
  * @param {Array} elementToPush
  * @param {number} atPosition
  */
  pushRange(
    currentArr: any[],
    elementToPush: any[],
    atPosition: number
  ): void {
    currentArr.splice(atPosition, 0, ...elementToPush);
  }
  /**
   *
   * @param {Array} source
   * @param {number|Array} indexToDelete
   * @returns
   */
  removeAt(source: any[], deleteIndex: number | number[]): any[] {
    if (typeof deleteIndex == "number") source.splice(deleteIndex, 1);
    else {
      deleteIndex.forEach((indTodelete) => {
        source.splice(indTodelete, 1);
      });
    }
    return source;
  }

  moveElement(arr: any[], old_index: number, new_index: number): any[] {
    if (new_index >= arr.length) {
      var k = new_index - arr.length + 1;
      while (k--) {
        arr.push(undefined);
      }
    }
    arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
    return arr; // for testing
  }
  /**
   * @template T
   * @param {T[]} arr
   * @param {(ele:T)=>{ }} callback
   * @returns
   */
  removeByCallback(arr: any[], callback: (ele: any) => boolean): any[] {
    let i = 0;
    while (i < arr.length) {
      if (callback(arr[i])) {
        arr.splice(i, 1);
      } else {
        ++i;
      }
    }
    return arr;
  }
  /** @param {Array} array */
  Max(array: any[], propName: string): number {
    return Math.max(...array.map((o) => o[propName]));
  }
}
export class numOpt {
  static addFloat(actualNum: number): number {
    let floatNumber = "" + actualNum;
    let position = floatNumber.indexOf(".");
    if (position == -1) {
      return +floatNumber + 1;
    } else {
      let len = floatNumber.length;
      let a = "0".repeat(len - 2) + "1";
      let dec = len - position - 1;
      let add = [a.slice(0, position), ".", a.slice(position)].join("");
      return parseFloat(
        (parseFloat(floatNumber) + parseFloat(add)).toFixed(dec)
      );
    }
  }
  static gtv(
    ifBeingThis: number,
    equalToThis: number,
    thanHowMuchAboutThis: number
  ): number {
    return this.getThirdValue(ifBeingThis, equalToThis, thanHowMuchAboutThis);
  }
  static getThirdValue(
    ifBeingThis: number,
    equalToThis: number,
    thanHowMuchAboutThis: number
  ): number {
    return this.SafeDivision(equalToThis * thanHowMuchAboutThis, ifBeingThis);
  }
  static gtvc(
    ifBeingThis: number,
    equalToThis: number,
    thanHowMuchAboutThis: number
  ): number {
    return this.getThirdValueCheck(
      ifBeingThis,
      equalToThis,
      thanHowMuchAboutThis
    );
  }
  static getThirdValueCheck(
    ifBeingThis: number,
    equalToThis: number,
    thanHowMuchAboutThis: number
  ): number {
    if (thanHowMuchAboutThis < ifBeingThis)
      return this.SafeDivision(
        equalToThis * thanHowMuchAboutThis,
        ifBeingThis
      );
    else {
      //return this.SafeDivision(thanHowMuchAboutThis,equalToThis);
      return (
        this.SafeDivision(thanHowMuchAboutThis, ifBeingThis) * equalToThis
      );
    }
  }
  static SafeDivision(Numerator: number, Denominator: number): number {
    return Denominator == 0 ? 0 : Numerator / Denominator;
  }
}
export class strOpt {
  static getBool(str: number | string, defValue: boolean = false): boolean {
    switch (str) {
      case undefined:
      case null:
      case NaN:
        return defValue;
      default:
        switch ((str + "").toLowerCase().trim()) {
          case "yes":
          case "1":
          case "true":
            return true;
          case "no":
          case "0":
          case "false":
            return false;
        }
    }
    return defValue;
  }
  static cleanTextForRegs(text: string): string {
    return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
  static replaceAll(
    source: string,
    textToFind: string,
    replaceWith: string
  ): string {
    return source.replace(
      new RegExp("(.){0,1}" + textToFind, "g"),
      (match, fkey) => {
        switch (fkey) {
          case "\\":
            return textToFind;
          case undefined:
            return replaceWith;
          default:
            return fkey + "" + replaceWith;
        }
      }
    );
  }
  static encode_utf8(s: string): string {
    return unescape(encodeURIComponent(s));
  }
  static decode_utf8(s: string): string {
    return decodeURIComponent(escape(s));
  }
  static _trim(source: string, charlist?: string): string {
    if (charlist === undefined) charlist = "s";
    return source.replace(new RegExp("^(" + charlist + ")+"), "");
  }
  static trim_(source: string, ...charlist: string[]): string {
    if (charlist === undefined) charlist = ["s"];

    let src = source;
    Array.from(charlist).forEach((nd) => {
      nd = nd.replace(".", ".");
      src = src.replace(new RegExp("(" + nd + ")+$"), "");
    });
    return src;
  }

  static __trim(source: string, charlist?: string): string {
    if (charlist === undefined) charlist = "s";
    return source.replace(new RegExp("^[" + charlist + "]+"), "");
  }
  static trim__(source: string, charlist?: string): string {
    if (charlist === undefined) charlist = "s";
    return source.replace(new RegExp("[" + charlist + "]+$"), "");
  }
}
//}
