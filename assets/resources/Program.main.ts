// DONT MODIFY UNTILL YOU KNOW ABOUT FILE
import { app, BrowserWindow, ipcMain, screen } from "electron";
import { dirname, join } from "path";
import { IpcMainHelper } from "ucbuilder";
import * as url from "url";
const __filename = url.fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
let win: Electron.BrowserWindow;
app.on('ready', () => {
  let screenElectron: Electron.Screen = screen;
  let mainScreen: Electron.Display = screenElectron.getPrimaryDisplay();
  win = new BrowserWindow({
    width: mainScreen.size.width,
    height: mainScreen.size.height,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      spellcheck: false,
      sandbox: false,
      webSecurity: true,
      preload: join(__dirname, '../Program.preload.cjs'),
    },
  });
  win.webContents.openDevTools();
  win.setMenu(null);
  try {
    win.loadURL(url.format({
      pathname: join(__dirname, '../Program.viewer.html'),
      protocol: 'file:',
      slashes: true,
    }));
    IpcMainHelper.init(ipcMain, win, "./out/Program.js", "./out/Program.preload-renderer.js");
  } catch (ex) {
  }
});