import { existsSync, readFileSync, unlinkSync, writeFileSync } from "fs";
import crypto from "crypto";

const __THIS = {
  numOpt: {
    
    
  },
  strOpt: {
    
  },
  arrayOpt: {
   
  },
  pathInfo: {
    
  },
  looping: {
    /**
     * @param {Array} arr
     * @param {Function} callback
     * @returns
     */
    removeFromArray: (
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
    },
    kvp(
      obj: object,
      callback: (k: string, v: any) => void = (k, v) => {}
    ): void {
      Object.entries(obj).forEach(([key, value]) => {
        callback(key, value);
      });
    },
    /**
     * @param {Array} ar Array To iterate
     * @param {Function} callback func return true will exit the loop
     */
    iterateArray: (
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
    },
    filterJson: (
      jData: any[] = [],
      eachCalback: (row: any, index: number) => boolean = (row, index) => {
        return false;
      }
    ): string => {
      return ""; //$.grep(jData, eachCalback);
    },

    /**
     * @param {HTMLElement} htEle
     */
    htmlChildren: (
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
    },
  },
  propOpt: {
    ATTR: Object.freeze({
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
    }),
    hasAttr: (attr: any): boolean => {
      return typeof attr !== "undefined" && attr !== false;
    },
    // /**
    //  * @param {JQuery} $selector
    //  * @param {string} attrib
    //  * @returns
    //  */
    // getMaxAttr: ($selector: JQuery, attrib: string = 'tab-index'): number => {
    //     let max = -1;
    //     $selector.attr(attrib, function (a, b) {
    //         max = Math.max(max, +b);
    //     });
    //     return max;
    // }
  },
  controlOpt: {
    ATTR: Object.freeze({
      editableControls:
        "input,textarea,select,button,[tabindex='-1'],[contenteditable='true']",
    }),
    type: Object.freeze({
      usercontrol: "userontrol",
      form: "form",
    }),
    /** @private */

    // /**
    //  * @param {JQuery} $ele
    //  */
    // hasFocus($ele: JQuery): boolean {
    //     return $ele.is(":focus");
    // },

    selectAllText: (elem: HTMLInputElement | HTMLElement): void => {
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
    },
    setProcessCSS: (styleName: string, value: string): void => {
      document.execCommand("styleWithCSS", true, "" + true);
      document.execCommand(styleName, true, value);
    },
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
    renameTag: (sourceTag: HTMLElement, newName: string): HTMLElement => {
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
    },
    /**
     * @param {Node} textNode
     */
    TextNodeToElement: (textNode: Node): void => {
      var spanNode = document.createElement("span");
      spanNode.setAttribute("class", "red");
      var newTextNode = document.createTextNode(textNode.textContent);
      spanNode.appendChild(newTextNode);
      textNode.parentNode.replaceChild(spanNode, textNode);
    },

    sizing: {
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
    },
  },
  objectOpt: {
    /**
     * @param {Object} obj
     * @param {string} isOfthisClass class name to compare
     */
    parse: (obj: object, isOfthisClass: string): boolean => {
      if (obj == undefined || Object.getPrototypeOf(obj) == null) return false;
      while (Object.getPrototypeOf(obj).constructor.name != isOfthisClass) {
        obj = Object.getPrototypeOf(obj);
        if (Object.getPrototypeOf(obj) == null) return false;
      }
      return true;
    },
    assign(to: object, from: object): void {
      // Object.keys(to).forEach(ky => {
      //     to[ky] = from[ky];
      // });
    },
   
    emptyObject: (obj: object): object => {
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
    },
    /**
     * @template T
     * @param {T} obj
     * @returns {T}
     */
    clone: (obj: object): object => {
      //console.log('here');
      return JSON.parse(JSON.stringify(obj));
    },
    /**
     * @param {{}} obj
     */
    deepClone1: (obj: object): object => {
      return __THIS.objectOpt.clone(obj);
    },
    
    getValByNameSpace: (obj: object, str: string): object => {
      let ars = str.split(".");
      try {
        ars.forEach((ar) => {
          obj = obj[ar as keyof typeof obj];
        });
        return obj;
      } catch {
        return undefined;
      }
    },
    /**
     * @param {{}} obj
     * @param {string} namespace property name i.e. person.address.home;
     * @param {string} valToAssign value to assign last property
     */
    setChildValueByNameSpace(
      obj: object,
      namespace: string,
      valToAssign: string
    ): boolean {
      namespace.toLowerCase();
      //console.log("==>"+namespace);
      let ars = namespace.split(".");

      try {
        for (let i = 0; i < ars.length - 1; i++) {
          let k = __THIS.objectOpt.getKeyFromObject(obj, ars[i]);

          if (k != undefined) obj = obj[k]; // k as keyof typeof obj
          else return false;
        }
        let lk = __THIS.objectOpt.getKeyFromObject(obj, ars.pop());
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
    },
    /**
     * @param {Object} obj
     * @param {string} ar lowercase string to find
     */
    getKeyFromObject: (obj: object, ar: string): string => {
      do {
        for (const key in Object.getOwnPropertyDescriptors(obj)) {
          if (key.toLowerCase() == ar) return key;
        }
        obj = Object.getPrototypeOf(obj);
      } while (obj != null || obj != undefined);
      return undefined;
    },

    getParentClass: (obj: object): object => {
      return Object.getPrototypeOf(obj.constructor);
    },
    /**
     * @param {any} obj class reference
     * @returns {string}
     */
    getClassName: (obj: any): string => {
      return Object.getPrototypeOf(obj).constructor.name;
    },
    has: (key: string, obj: object): boolean => {
      return key in obj;
    },
  },

  uniqOpt: {
    get guid(): string {
      return crypto.randomBytes(16).toString("hex");
      //let v = v1();
      //return v;
    },
    get guidAs_(): string {
      return crypto.randomBytes(16).toString("hex");
      //let v = v1().replace(/-/g, "_");
      //return v;
    },
    randomNo(min: number = 0, max: number = 1000000): number {
      let difference = max - min;
      let rand = Math.random();
      rand = Math.floor(rand * difference);
      rand = rand + min;
      return rand;
    },
  },
  buildOptions: {
    /*controlType: Object.freeze({
            elementHT: 'elementHT',
            Usercontrol: 'Usercontrol'
        }),*/
    extType: Object.freeze({
      none: "none",
      Usercontrol: ".uc",
      template: ".tpt",
    }),
    ignoreDirs: ["@ucbuilder:/node_modules", "@ucbuilder:/.vscode"],
  },
};
