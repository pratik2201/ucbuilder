import { existsSync, readFileSync, unlinkSync, writeFileSync } from "fs";
namespace ucbuilder.util {
  
  // existsSync, readFileSync, unlinkSync, writeFileSync
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
    static cleanPath (_pth: string = ""): string  {
      return ucbuilder.util.strOpt.trim__(_pth.replace(/[\\/]{1,}/g, "/"), "/ ");
    }
    static existFile (_path: string): boolean  {
      return existsSync(_path);
    }
    static removeFile (_path: string): void  {
      unlinkSync(_path);
    }

    static readFile (_path: string): string  {
      return readFileSync(_path, "binary");
    }
    static writeFile (_path: string, _data: string): void  {
      writeFileSync(_path, _data, { encoding: "binary" });
    }
    /**
     * @param {string} fullPath
     * @returns string
     */
     static getFileNameFromPath (fullPath: string): string  {
      return fullPath.replace(/^.*[\\\/]/, "");
    }

    /**
     * @param {string} fullPath
     * @returns string
     */
     static getFileNameWithoutExtFromPath (fullPath: string): string  {
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
     static getFileInfoPartly (
      fullPath: string
    ): {
      dirPath: string;
      fileName: string;
      extension: string;
      type: string;
      fullPath: string;
    }  {
      let rtrn = {
        dirPath: "",
        fileName: "",
        extension: "",
        type: "",
        fullPath: "",
      };
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
}
