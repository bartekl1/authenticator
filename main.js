const { app, BrowserWindow, Menu, shell, dialog, ipcMain } = require("electron/main");
const path = require("node:path");
const fse = require("fs-extra");

const { getTranslation } = require("./translations");

const package = fse.readJSONSync("package.json");

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 500,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegrationInWorker: true,
        },
        icon: "./img/icon_x128.ico",
    });

    mainWindow.setAspectRatio(5/8);
    mainWindow.setMinimumSize(438, 700);
    mainWindow.setMaximumSize(562, 900);
    mainWindow.setMaximizable(false);
    mainWindow.removeMenu();

    const locale = app.getLocale();

    const menu = Menu.buildFromTemplate([
        {
            label: getTranslation(0, locale),
            submenu: [
                {
                    label: getTranslation(5, locale),
                    click: async () => {
                        mainWindow.webContents.send("lock-vault");
                    },
                },
                {
                    label: getTranslation(1, locale),
                    click: async () => {
                        app.exit();
                    },
                },
            ],
        },
        {
            label: getTranslation(2, locale),
            submenu: [
                {
                    label: getTranslation(4, locale),
                    click: async () => {
                        dialog.showMessageBox(null,  {
                            title: "Authenticator",
                            message: `Authenticator\nv. ${package.version}\nby @bartekl1\n${package.homepage.replace("#readme", "")}`,
                            icon: "./img/icon_x128.ico",
                        });
                    },
                },
                {
                    label: getTranslation(3, locale),
                    click: async () => {
                        shell.openExternal(package.homepage.replace("#readme", ""));
                    },
                },
            ],
        },
    ]);
    Menu.setApplicationMenu(menu);

    mainWindow.loadFile("index.html");

    if (process.argv.includes("--relaunch-with-devtools")) mainWindow.webContents.openDevTools({ mode: "detach" });
    
    if (fse.existsSync(path.join(app.getPath("userData"), "ENABLE_DEV_MODE"))) {
        mainWindow.webContents.on("before-input-event", (_, input) => {
            if (input.type === "keyDown" && input.key === "F12") {
                mainWindow.webContents.isDevToolsOpened()
                ? mainWindow.webContents.closeDevTools()
                : mainWindow.webContents.openDevTools({ mode: "detach" });
            } else if (input.type === "keyDown" && input.key === "F5") {
                mainWindow.webContents.isDevToolsOpened()
                ? app.relaunch({ args: process.argv.slice(1).concat(['--relaunch-with-devtools']) })
                : app.relaunch()
                app.exit()
            }
        });
    }
}

app.whenReady().then(() => {
    createWindow();

    app.on("activate", () => {
        if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
});

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
});
