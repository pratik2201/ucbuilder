namespace ucbuilder.util {
  export class strOpt {
    /**
     * @param {string} str
     * @param {boolean} defValue
     *
     * @returns {boolean}
     */
     static getBool (str: number | string, defValue: boolean = false): boolean {
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

    /**
     * @param {string} text
     * @returns {string}
     */
     static cleanTextForRegs(text: string): string {
      return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    }
    /**
     * @param {string} source
     * @param {string} textToFind
     * @param {string} replaceWith
     * @returns {string}
     */
     static replaceAll (
      source: string,
      textToFind: string,
      replaceWith: string
    ): string  {
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
    static encode_utf8 (s: string): string  {
      return unescape(encodeURIComponent(s));
    }
    static decode_utf8 (s: string): string  {
      return decodeURIComponent(escape(s));
    }
    static _trim (source: string, charlist?: string): string  {
      if (charlist === undefined) charlist = "s";
      return source.replace(new RegExp("^(" + charlist + ")+"), "");
    }
    /**
     *
     * @param {string} source
     * @param {string[]} charlist
     * @returns {string}
     */
     static trim_ (source: string, ...charlist: string[]): string  {
      if (charlist === undefined) charlist = ["s"];

      let src = source;
      Array.from(charlist).forEach((nd) => {
        nd = nd.replace(".", ".");
        src = src.replace(new RegExp("(" + nd + ")+$"), "");
      });
      return src;
    }

    static __trim (source: string, charlist?: string): string  {
      if (charlist === undefined) charlist = "s";
      return source.replace(new RegExp("^[" + charlist + "]+"), "");
    }
    static trim__ (source: string, charlist?: string): string  {
      if (charlist === undefined) charlist = "s";
      return source.replace(new RegExp("[" + charlist + "]+$"), "");
    }
  }
}
