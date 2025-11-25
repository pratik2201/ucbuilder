
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
 
  const { WinManager } = await import('ucbuilder/out/lib/WinManager.js');   
  
  const buildKeyBinding = {  
      ctrlKey: <?= keyBinding.ctrlKey ?>,
      shiftKey: <?= keyBinding.shiftKey ?>,
      altKey: <?= keyBinding.altKey ?>,
      keyCode: parseInt("<?= keyBinding.keyCode ?>") ?? undefined
  }
 
  let hasCaptured = false;
  //mgen.filewatcher.startWatch();
  window['$ucbuilder'] = mgen;
  WinManager.event.keyup((ev) => {
    if (hasCaptured) {
      if (WinManager.isKeyOK(buildKeyBinding,ev)) {
        (async () => {
          console.log('BUILDING...');
          //await mgen.filewatcher.stopWatch();
          await mgen.buildALL(() => {
             console.log('BUILD SUCCESSFULL...');
             //mgen.filewatcher.startWatch();
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
  
  WinManager.event.keydown((ev) => {
    if (WinManager.isKeyOK(buildKeyBinding,ev)) {
      hasCaptured = true;
    }
  }); 
  
  PathBridge.CheckAndSetDefault();  

  (await import('<?=initialPreload?>'));

  
  (await import('<?=initailModule?>'));
})();