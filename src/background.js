'use strict'

import path from 'path'
import {
  app,
  Menu,
  Tray,
  protocol,
  BrowserWindow,
  ipcMain
} from 'electron'
import {
  createProtocol
} from 'vue-cli-plugin-electron-builder/lib'
import installExtension, {
  VUEJS_DEVTOOLS
} from 'electron-devtools-installer'
const isDevelopment = process.env.NODE_ENV !== 'production'

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([{
  scheme: 'app',
  privileges: {
    secure: true,
    standard: true
  }
}])
let win
var trayMenuTemplate = [{
    label: '设置',
    click: function () {} //打开相应页面
  },
  {
    label: '帮助',
    click: function () {}
  },
  {
    label: '关于',
    click: function () {}
  },
  {
    label: '退出',
    click: function () {
      app.quit();
      app.quit(); //因为程序设定关闭为最小化，所以调用两次关闭，防止最大化时一次不能关闭的情况
    }
  }
];

//系统托盘图标目录
const trayIcon = path.join(__dirname, 'app.ico');
console.log(__dirname)


async function createWindow() {
  // Create the browser window.
  win = new BrowserWindow({
    width: 340,
    height: 580,
    webPreferences: {
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: true
    }
  })
  win.setAlwaysOnTop(10)
  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    // if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./index.html')
  }
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async () => {
  const appTray = new Tray(trayIcon); //app.ico是app目录下的ico文件

  //图标的上下文菜单
  const contextMenu = Menu.buildFromTemplate(trayMenuTemplate);

  //设置此托盘图标的悬停提示内容
  appTray.setToolTip('我的托盘图标');

  //设置此图标的上下文菜单
  appTray.setContextMenu(contextMenu);
  //单击右下角小图标显示应用
  appTray.on('click', function () {
    win.show();
  })
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      // await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  createWindow()
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', (data) => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
const pie = require("puppeteer-in-electron")
const puppeteer = require("puppeteer-core");
let priceWin
let pricePage
let priceBrowser
const main = async (dm) => {
  await pie.initialize(app);
  priceBrowser = await pie.connect(app, puppeteer);

  priceWin = new BrowserWindow({
    width: 0,
    height: 0,
    skipTaskbar: true
  }); //隐藏任务栏
  priceWin.minimize()
  let url = `http://quote.eastmoney.com`
  await priceWin.loadURL(url);
  pricePage = await pie.getPage(priceBrowser, priceWin);
  const result = await pricePage.evaluate(() => {
    return {
      price: document.querySelector('#price9').innerText,
      reduce: document.querySelector('#km1').innerText,
      rate: document.querySelector('#km2').innerText
    }; // 返回数据
  });
  console.log(result)
  return result
  // window.destroy();
};

main();
ipcMain.on('getInfo', async (e, dm) => {
  console.log(dm)
  await priceWin.loadURL(`http://quote.eastmoney.com/${dm}.html`);
  pricePage = await pie.getPage(priceBrowser, priceWin);
  console.log(11)
  const result = await pricePage.evaluate(() => {
    try {
      return {
        name: document.querySelector('#name').innerText,
        price: document.querySelector('#price9').innerText,
        reduce: document.querySelector('#km1').innerText,
        rate: document.querySelector('#km2').innerText
      }; // 返回数据
    } catch (error) {
      return error
    }
  });
  result.dm = dm
  console.log(result)
  win.webContents.send('priceInfo', result)
})