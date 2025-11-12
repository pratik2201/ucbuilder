import { SpecialExtEnum, SpecialExtType } from "./global/ucUtil.js";

export interface SourceCodeNode {
    designerCode?: string,
    jsFileCode?: string,
    htmlCode?: string,
}
export function getSpecialExtTypeValue(_val: string): SpecialExtType {
    switch (_val) {
        case SpecialExtEnum.uc: return '.uc';
        //case SpecialExtEnum.t: return '.t';
        case SpecialExtEnum.tpt: return '.tpt';
        default: return 'none';
    }
}
export interface FilePartlyInfo {
    dirPath: string;
    //sortDirPath: string,
    fileName: string;
    extension: SpecialExtType;
    type: string;
    // fullPath?: string;
}
/*type FilePathInfo = {
    dirpath: string;
    name: string;
    sortname: string;
    extAr: string[];
    extStr: string;
};*/
export class PathHelper {
    //static pathModule: typeof import("path") = undefined;
    /* static getFileNameFromPath(_path: string) {
         return _path.replace(/^.*[\\\/]/, '');
     }
    static getFileNameWithoutExtFromPath(fullPath: string): string {
        return fullPath.replace(/(^.*[\\\/])(.*)/gm,
            (mch, dirPath, filename) => {
                let index = filename.indexOf(".");
                if (index != -1)
                    filename = filename.substring(0, index);
                return dirPath + filename;
            });
    } 
    static getFilePathInfo(filePath: string): FilePathInfo {
        const lastSlashIndex = filePath.lastIndexOf("/");
        const dirpath = lastSlashIndex !== -1 ? filePath.slice(0, lastSlashIndex) : "";
        const name = lastSlashIndex !== -1 ? filePath.slice(lastSlashIndex + 1) : filePath;
        const parts = name.split(".");

        const sortname = parts[0]; // Filename before any '.'
        const extAr = parts.slice(1); // Array of extensions
        const extStr = extAr.length > 0 ? "." + extAr.join(".") : ""; // Joined extensions as a string

        return { dirpath, name, sortname, extAr, extStr };
    } 
    static getFileInfoPartly(fullPath: string): FilePartlyInfo {
    let rtrn = {} as FilePartlyInfo;
    let array = Array.from(fullPath.matchAll(/(^.*[\\\/])*(.*)/gmi))[0];
    if (array != undefined) {
        let dirPath = array[1];
        let filename = array[2];
        let index = filename.indexOf(".");
        rtrn.dirPath = dirPath;
        if (index != -1) {

            rtrn.fileName = filename.substring(0, index);
            let flen = filename.length;
            rtrn.extension = filename.substring(index, flen) as SpecialExtType;
            let lindex = filename.lastIndexOf(".");
            rtrn.type = (lindex == index) ? rtrn.extension : filename.substring(lindex, flen);
        }
    }
    return rtrn;
}*/


    /**
     * Computes the relative path from `trimPath` to `actualPath`, ensuring correct formatting.
     * @param {string} actualPath - The full path to be trimmed.
     * @param {string} trimPath - The base path to remove.
     * @returns {string} - The relative path using `/` as the separator.
     */
    // static trimPath(actualPath: string, trimPath: string) {
    //     let _path = this.pathModule ?? nodeFn.path;
    //     // Normalize paths to handle mixed slashes (`/` and `\`)
    //     const normalizedActual = _path.normalize(actualPath);
    //     const normalizedTrim = _path.normalize(trimPath);

    //     // Compute the relative path
    //     let relativePath = _path.relative(normalizedTrim, normalizedActual);

    //     // Convert Windows-style `\` to Unix-style `/`
    //     relativePath = relativePath.replace(/\\/g, '/');

    //     // If the relative path is empty, return "./"
    //     if (!relativePath) return './';

    //     // Ensure `./` for subdirectories
    //     let rpath = relativePath.startsWith('.') ? relativePath : `./${relativePath}`;
    //     return this.preserveTrailingSlash(actualPath, rpath);
    // }
    // /**
    // * Ensures the resolved path retains a trailing slash if originally present.
    // * @param {string} originalPath - The original file path.
    // * @param {string} resolvedPath - The resolved file path.
    // * @returns {string} - The resolved path with a preserved trailing slash if applicable.
    // */
    // static preserveTrailingSlash(originalPath, resolvedPath) {
    //     return /[\/\\]$/.test(originalPath) ? resolvedPath + '/' : resolvedPath;
    // }

    // static resolve(basePath: string, filePath: string, aliases: { [alias: string]: string } = {}) {
    //     let _path = this.pathModule ?? nodeFn.path;
    //     if (!_path.isAbsolute(basePath)) {
    //         throw new Error("rootPath must be an absolute path.");
    //     }

    //     // Check if filePath starts with an alias
    //     for (const [alias, aliasPath] of Object.entries(aliases)) {
    //         if (filePath.startsWith(alias)) {
    //             // Replace alias with its corresponding absolute path
    //             filePath = _path.join(aliasPath, filePath.slice(alias.length));
    //             break;
    //         }
    //     }
    //     //  console.log('EsUtil');

    //     return this.preserveTrailingSlash(filePath, _path.resolve(basePath, filePath));

    // }
}