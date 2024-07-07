const { contextBridge, ipcRenderer } = require("electron/renderer");

contextBridge.exposeInMainWorld("electronAPI", {
    onLockVault: (callback) => ipcRenderer.on("lock-vault", () => callback()),
});
