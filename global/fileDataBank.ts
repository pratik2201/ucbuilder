import { FileInfo } from "ucbuilder/build/codeFileInfo";
import { strOpt } from "ucbuilder/build/common";
import { ReplaceTextRow } from "ucbuilder/global/findAndReplace";
import { readFileSync, writeFileSync, existsSync } from "fs";

interface FileDataRow {
    path: string;
    originalContent: string;
    content: string;
}

class FileDataBank {
    static source: FileDataRow[] = [];
    static replacableText: ReplaceTextRow[] = [];

    // var filterstrings = ['firststring', 'secondstring', 'thirdstring'];
    // var regex = new RegExp(filterstrings.join("|"), "i");
    // var isAvailable = regex.test(passedinstring);

    static checkIfValidReplacable(textToFind: string): boolean {
        let textToFindLower = textToFind/*.toLowerCase()*/;
        return this.replacableText.findIndex(s =>
            //s.originalLowerCaseText.includes(textToFindLower)
            s.originalFinderText.includesI(textToFindLower)
            ||
            //textToFindLower.includes(s.originalLowerCaseText)
            textToFindLower.includesI(s.originalFinderText)
        ) == -1;
    }

    static pushReplacableText(textToFind: string, replaceWith: string): void {
        //let textToFindLower = textToFind.toLowerCase();
        let textToFindLower = textToFind;
        let fval = this.replacableText.find(s => s.originalFinderText.equalIgnoreCase(textToFindLower)); // s => s.originalLowerCaseText == textToFindLower
        if (fval == undefined) {
            this.replacableText.push({
                originalFinderText: textToFind,
                //originalLowerCaseText: textToFindLower,
                textToFind: strOpt.cleanTextForRegs(textToFind),
                replaceWith: replaceWith,
                //replaceLowerCaseText: replaceWith.toLowerCase(),

            });
        } else {
            fval.originalFinderText = textToFind;
            //fval.originalLowerCaseText = textToFindLower;
            fval.textToFind = strOpt.cleanTextForRegs(textToFind);
            fval.replaceWith = replaceWith;
            //fval.replaceLowerCaseText = replaceWith.toLowerCase();
        }
    }

    static getReplacedContent(content: string): string {
        this.replacableText.forEach(rw => {
            content = strOpt.replaceAll(content, rw.textToFind, rw.replaceWith);
        });
        return content;
    }

    static options = {
        reloadData: false,
        replaceContentWithKeys: true,
        isFullPath: false,
    }

    static readFile(path: string, {
        reloadData = false,
        replaceContentWithKeys = true,
        isFullPath = false,
    } = {}): string {
        let fullPath = path/*.toLowerCase()*/.trim();
        if (!isFullPath) {
            let fing = new FileInfo();
            fing.parse(path, true);
            fullPath = fing.fullPath;
        }

        if (!existsSync(fullPath)) return undefined;

        let data = this.source.find(s => s.path == fullPath);


        if (data != undefined) {
            if (!reloadData)
                return replaceContentWithKeys ? data.content : data.originalContent;
            let originalContent = readFileSync(fullPath, "binary");
            let content = this.getReplacedContent(originalContent);
            data.originalContent = originalContent;
            data.content = content;
            return replaceContentWithKeys ? content : originalContent;
        }
        else {
            let originalContent = readFileSync(fullPath, "binary");
            let content = this.getReplacedContent(originalContent);
            this.source.push({
                path: fullPath,
                content: content,
                originalContent: originalContent,
            });
            return replaceContentWithKeys ? content : originalContent;
        }
    }

    static writeFile(path: string, data: string): void {
        writeFileSync(path, data);
    }
}

export { FileDataBank, FileDataRow };