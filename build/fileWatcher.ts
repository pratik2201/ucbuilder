import fs  from "fs";
import { builder } from "./builder";
import { codeFileInfo } from "./codeFileInfo";

export class fileWatcher{
    constructor() { }
    main: builder;
    init(main: builder) {
        this.main = main;
        
    }
     startWatch(fPath:string) {        
         this.watcher = fs.watch(fPath, { recursive: true }, this.watch_Listner)
    }
     stopWatch(fPath:string) {        
        this.watcher.close();
    }
     watcher: fs.FSWatcher = undefined;

    watch_Listner = (evt: fs.WatchEventType, filepath: string) => {
        switch (evt) {
            case "change":
                if (filepath.endsWithI(codeFileInfo.___DESIGNER_EXT) || filepath.endsWithI(codeFileInfo.___DESIGNER_EXT)) {
                    console.log(`CHANGED :- ${filepath}`);
                    
                }        
                break;
            case "rename":
                if (filepath.endsWithI(codeFileInfo.___DESIGNER_EXT) || filepath.endsWithI(codeFileInfo.___DESIGNER_EXT)) {
                    console.log(`RENAMED :- ${filepath}`);
                      
                }   
                break;
        }
    };
}