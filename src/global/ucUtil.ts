export interface FILE_WARCHER_FILE_ROW {
    unlink: { [key: string]: number },
    modified: { [key: string]: number },
    add: { [key: string]: number },
    moved: { from: string, to: string }[],
    renamed: { from: string, to: string }[],
}
export class ucUtil {
    static GetType(obj: any):string { return Object.getPrototypeOf(obj).constructor.name; }
    static PHP_REMOVE(text: string) {
        return text.replace(/<\?(=|php| )(.*?)\?>/gm, '&lt;!--?$1$2?--&gt;');
    }
    static PHP_ADD(text: string) {
        return text.replace(/&lt;!--\?(=|php )(.*?)\?--&gt;/gm, '<?$1$2?>');
    }
     
    static trimPath(pth: string) {
        return pth.replace(/^\.?\/*|\/*$/g, '');
    }
    static JsonCopy<K>(obj: K): K {
        return JSON.parse(JSON.stringify(obj));
    }
    static distinct<T>(ar: Array<T>): Array<T> {
        return [...new Set(ar)] as unknown as Array<T>;
    }
    static cleanNodeModulesPath(path: string) {
        return path.replace(/(?:\.\.[\/\\])+node_modules[\/\\]/i, '');
    }
    static changeExtension(path: string, fromExt: string, toExt: string) {
        // Ensure extensions start with a dot
        if (!fromExt.startsWith('.')) fromExt = '.' + fromExt;
        if (!toExt.startsWith('.')) toExt = '.' + toExt;

        // Replace the extension only if it matches
        if (path.endsWith(fromExt)) {
            return path.slice(0, -fromExt.length) + toExt;
        }

        // Otherwise, just append the new one
        return path + toExt;
    }
    static toFilePath(path: string, trim = true) {
        let ns = path.replace(/[\\\/]+/gi, "/");
        return trim ? this._trim_(ns, "/") : ns;
    }

    static _trim_ = (str: string, charlist?: string): string => {

        if (charlist === undefined)
            charlist = "\s";
        charlist = this.escapeRegs(charlist);
        return str.replace(new RegExp("^[" + charlist + "]+$", 'ig'), "");
    }
    static escapeRegs = (str: string) => {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    static devEsc = (str: string): string => {
        // debugger;
        return str.replace(/(.{0,1}){:(.*?)}/gm, (m, fchar, url) => {
            //  console.log([m,fchar,url]);
            let rtrn = (fchar == "\\") ? `{:${url}}` : (fchar ?? '') + "" + url;
            return rtrn;
        });
    }
}

export type SpecialExtType = "none" | ".uc" | ".tpt" /*| ".t"*/;
export enum SpecialExtEnum {
    none = "none",
    uc = ".uc",
    tpt = ".tpt",
    // t = ".t"
}

