import chokidar, { ChokidarOptions, FSWatcher } from "chokidar";
import fs from "fs";
import path from "path";
import { IpcMainGroup } from "../ipc/IpcMainHelper.js";
import { TSPathResolver } from "../global/TSPathResolver.js";
import { FILE_WARCHER_FILE_ROW, ucUtil } from "../global/ucUtil.js";
import { codeFileInfo } from "./codeFileInfo.js";
import url from "url";
import { PathBridge } from "./pathBridge.js";
const main = IpcMainGroup(import.meta.url);
const projectRoot = path.resolve();
const srcPath = projectRoot; //path.join(projectRoot, "src");
const pathMapFile = path.join(projectRoot, "path-map.json");
const ignoredList = [
    path.join(projectRoot, 'node_modules'),
    path.join(projectRoot, '.git'),
    path.join(projectRoot, 'out'),
    path.join(projectRoot, 'dist'),
];
let rendererIgnorance: string[] = [];
const watcherOptions: ChokidarOptions = {
    ignoreInitial: true,
    ignored: (file) => ignoredList.findIndex(s => TSPathResolver.isSamePath(s, file)) >= 0 &&
        rendererIgnorance.findIndex(s => TSPathResolver.isSamePath(s, file)) >= 0,

    //  [
    //     '**/node_modules/**',
    //     '**/.git/**',
    //    // '**/out/**',
    //    // '**/assets/**',
    //    // '**/dist/**',
    //     path.join(srcPath, 'out'),
    //     path.join(srcPath, 'dist'),
    // ],
    persistent: true,
    depth: undefined,     // watch all subfolders
    usePolling: true,     // more stable across OS types
    interval: 200,        // poll every 200ms
};
main.On("rendererIgnorance.add", (e, ..._paths: string[]) => {
    _paths = _paths.map(s => path.normalize(s));
    rendererIgnorance.push(..._paths);
    rendererIgnorance = ucUtil.distinct(rendererIgnorance);
    e.returnValue = true;
});
main.On("rendererIgnorance.remove", (e, ..._paths: string[]) => {
    _paths = _paths.map(s => path.normalize(s));
    rendererIgnorance = rendererIgnorance.filter(s => !_paths.includes(s));
    e.returnValue = true;
});
let eleEvent: Electron.IpcMainEvent;
let IS_ON = false;
main.On("startWatch", (e, _path) => {
    eleEvent = e;
    IS_ON = true;
    startWatch();
});
main.Handle("stopWatch", async (evt, _path) => {
    //watcher?.unwatch(srcPath);
    if (watcher != undefined)
        await watcher.close();//.then(() => console.log("Chokidar watcher stopped"));
    IS_ON = false;
    clearInterval(interval);
    return true;
});
// ---- STATE ----
let pathMap = fs.existsSync(pathMapFile)
    ? JSON.parse(fs.readFileSync(pathMapFile, "utf-8"))
    : {};

let unlinkCache = [];  // store recently removed files (for rename detection)
const MOVE_TIME_DIFFERENCE = 3200;
const WATCH_LIST: FILE_WARCHER_FILE_ROW = {
    unlink: {},
    modified: {},
    add: {},
    renamed: [],
    moved: [],
};
let watcher: FSWatcher;
let interval = null;

function startWatch() {
    // ---- WATCHER ----
    watcher = chokidar.watch(srcPath, watcherOptions);
    console.log(`[path-watcher] Watching ${srcPath}`);
    watcher
        .on("add", newPath => {
            WATCH_LIST.add[newPath] = Date.now();
            doProcess();
        })
        .on("unlink", removedPath => {
            WATCH_LIST.unlink[removedPath] = Date.now();
            doProcess();
        });
}
/*function checkDesignerMove(update: FILE_WARCHER_FILE_ROW) {
    let toRenames: { from: string, to: string }[] = [];
    let toRemoveFromIgnore: string[] = [];
    update.moved.forEach(f => {
        if (f.from.endsWith('.uc.ts') || f.from.endsWith('.tpt.ts')) {
            let fromPathOf = PathBridge.Convert(f.from, 'src', '.ts');
            let toPathOf = PathBridge.Convert(f.to, 'src', '.ts');
            if (fs.existsSync(fromPathOf[".designer.ts"])) {
                let nd: { from: string, to: string } = {
                    from: fromPathOf[".designer.ts"],
                    to: toPathOf[".designer.ts"]
                };
                update.moved.push(nd);
                toRenames.push(nd);
            }
        }
    });

    toRenames.forEach(s => {
        fs.rmSync(s.from, { force: true });
    });
}*/
let isProcessing = false;
function doProcess() {
    if (isProcessing) return;
    isProcessing = true;
    function analysis() {
        const newAr = ucUtil.JsonCopy(WATCH_LIST);
        isProcessing = false;
        WATCH_LIST.add = {}; WATCH_LIST.modified = {}; WATCH_LIST.unlink = {};
        for (let [addedPath, addedTime] of Object.entries(newAr.add)) {
            for (let [unlinkPath, unlinkTime] of Object.entries(newAr.unlink)) {
                if ((addedTime - unlinkTime) < MOVE_TIME_DIFFERENCE) {
                    const addedBaseName = path.basename(addedPath);
                    const unlinkBaseName = path.basename(unlinkPath);
                    if (addedBaseName === unlinkBaseName) {
                        delete newAr.add[addedPath];
                        delete newAr.unlink[unlinkPath];
                        newAr.moved.push({ from: unlinkPath, to: addedPath });
                        let fromPathOf = PathBridge.Convert(unlinkPath, 'src', '.ts');
                        let toPathOf = PathBridge.Convert(addedPath, 'src', '.ts');
                        newAr.moved.push({
                            from: fromPathOf[".designer.ts"],
                            to: toPathOf[".designer.ts"]
                        });
                        break;
                    }
                }
            }
        }
        //  checkDesignerMove(newAr);
        main.Reply("updates", eleEvent, JSON.stringify(newAr));
    }
    let to = setTimeout(analysis, 3000);
}
/*function detectRename(newFile) {
    const now = Date.now();
    const matchIndex = unlinkCache.findIndex(
        e => {
            return now - e.time < MOVE_TIME_DIFFERENCE && path.basename(e.path) === path.basename(newFile);
        }
    );
    if (matchIndex !== -1) {
        const oldFile = unlinkCache[matchIndex].path;
        unlinkCache.splice(matchIndex, 1);
        main.Reply("watch_moved", eleEvent, oldFile, newFile);
        const key = Object.keys(pathMap).find(k => pathMap[k] === oldFile);
        if (key) {
            pathMap[key] = newFile;
            savePathMap();
        }
        return true;
    }

    return false;
}
function startWatch() {
    // ---- WATCHER ----
    console.log(watcherOptions);

    watcher = chokidar.watch(srcPath, watcherOptions);
    console.log(`[path-watcher] Watching ${srcPath}`);

    watcher
        .on("add", newPath => {
            if (!detectRename(newPath)) {
                // console.log("🟢 File added:", newPath);
                pathMap[newPath] = newPath;
                //savePathMap();
            }
        })
        .on("unlink", removedPath => {
            //console.log("🔴 File removed:", removedPath);

            unlinkCache.push({ path: removedPath, time: Date.now() });
            const entry = Object.keys(pathMap).find(k => pathMap[k] === removedPath);
            if (entry) delete pathMap[entry];
            //savePathMap();
            main.Reply("watch_removed", eleEvent, removedPath);
        })
    // ---- PERIODIC SYNC ----
    interval = setInterval(() => {
        console.log("🧩 Background sync running...");
        const now = Date.now();
        unlinkCache = unlinkCache.filter(e => now - e.time < MOVE_TIME_DIFFERENCE);
    }, 5000);
}
*/