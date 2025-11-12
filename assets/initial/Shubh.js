
let intervalId = setInterval(() => {
  let _api = window["<?=IPC_API_KEY?>"];
  if (_api != undefined) {
    clearInterval(intervalId);
    _api.INIT_IMPORT_MAP(window);
    (async () => {
      let script = document.createElement('script');
      const scriptcontent = `<?= Labh?>`;
      script.innerHTML = scriptcontent;
      document.body.appendChild(script);
      script.remove();
    })();
  }
}, 100);