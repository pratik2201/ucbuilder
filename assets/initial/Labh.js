
const shiftKey = <?= keyBinding.shiftKey ?>;
const ctrlKey = <?= keyBinding.ctrlKey ?>;
const altKey = <?= keyBinding.altKey ?>;
let hasCaptured = false;
const keyCode = parseInt("<?= keyBinding.keyCode ?>") ?? undefined;
/**
 * @param {KeyboardEvent} ev 
 * @returns {boolean}
 */
function checkForDown(ev) {
  let rtrn = (shiftKey == ev.shiftKey && ctrlKey == ev.ctrlKey && altKey == ev.altKey);
  rtrn = rtrn && (Number.isNaN(keyCode) || keyCode == ev.keyCode);
  return rtrn;
 /* let rtrn = (shiftKey == ev.shiftKey) &&
    (ctrlKey == ev.ctrlKey) &&
    (altKey == ev.altKey);
  rtrn = rtrn && (Number.isNaN(keyCode) || keyCode == ev.keyCode)
  return rtrn;*/
}
/**
 * @param {KeyboardEvent} ev 
 * @returns {boolean}
 */
function checkForUp(ev) { 
  let rtrn = (shiftKey == ev.shiftKey && ctrlKey == ev.ctrlKey && altKey == ev.altKey);
  rtrn = rtrn && (Number.isNaN(keyCode) || keyCode == ev.keyCode);
  return rtrn;
  /*let rtrn = (shiftKey != ev.shiftKey) ||
    (ctrlKey != ev.ctrlKey) ||
    (altKey != ev.altKey);
  rtrn = rtrn && (!Number.isNaN(keyCode) && keyCode != ev.keyCode);
  return rtrn;*/
}

(async () => {
  let _api = window["<?=IPC_API_KEY?>"];

  
  const { IpcRendererHelper } = await import('ucbuilder/out/ipc/IpcRendererHelper.js');
  IpcRendererHelper.init(window);

  const { ProjectManage } = await import('ucbuilder/out/ipc/ProjectManage.js');
  ProjectManage.init();      
  
  <?= _preloadImport ?>        
  
    
  const { nodeFn } = await import('ucbuilder/out/nodeFn.js');
  //console.log(nodeFn.path.resolve());
    
  const { PathBridge } = await import('ucbuilder/out/build/pathBridge.js');
  PathBridge.path = nodeFn.path;
  PathBridge.url = nodeFn.url;
  PathBridge.source = ProjectManage.projects;

  const { TabIndexManager } = await import("ucbuilder/out/lib/TabIndexManager.js");
  TabIndexManager.init();

  const { Extensions } = await import('ucbuilder/out/lib/Extensions.js');
  Extensions.init();

  const { StylerRegs } = await import('ucbuilder/out/StylerRegs.js');
  StylerRegs.initProjectsStyle();

  const { builder } = await import('ucbuilder/out/build/builder.js');
  let mgen = builder.GetInstance(); // 
  mgen.
  window['$ucbuilder'] = mgen;
  //mgen.addToIgnore('node_modules', '.git','out', '.vscode'); 
  window.addEventListener('keyup', (ev) => {
    if (hasCaptured) {
      if (checkForUp(ev)) {
        (async () => {
          console.log('BUILDING...');
          await mgen.filewatcher.stopWatch();
          await mgen.buildALL(() => {
             console.log('BUILD SUCCESSFULL...');
             mgen.filewatcher.startWatch();
          },false);
        })();
        hasCaptured = false;
      }
    } else {
      //console.log('ds:'+ev.keyCode);
      if (ev.keyCode == 116) {
        _api.reload();
      }
    }
  });
  window.addEventListener('keydown', (ev) => {
    if (checkForDown(ev)) {
      hasCaptured = true;
    }
  });
  
  PathBridge.CheckAndSetDefault();  

  (await import('<?=initialPreload?>'));

  
  (await import('<?=initailModule?>'));
})();