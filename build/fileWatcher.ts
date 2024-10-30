import fs from "fs";
import { builder } from "./builder";
import { codeFileInfo } from "./codeFileInfo";

export class fileWatcher {
    constructor() { }
    main: builder;
    init(main: builder) {
        this.main = main;

    }
    startWatch(fPath: string) {
        this.watcher = fs.watch(fPath, { recursive: true }, this.watch_Listner)
    }
    stopWatch(fPath: string) {
        this.watcher.close();

    }
    watcher: fs.FSWatcher = undefined;

    watch_Listner = (evt: fs.WatchEventType, filepath: string) => {
        filepath = filepath.toLowerCase();
        if (filepath.endsWith(codeFileInfo.___DESIGNER_EXT) || filepath.endsWith(codeFileInfo.___DESIGNER_SRC_EXT)) {
            switch (evt) {
                case "change":
                    console.log(`CHANGED :- ${filepath}`);

                    break;
                case "rename":
                    console.log(`RENAMED :- ${filepath}`);
                    break;
            }
        }
    };
}