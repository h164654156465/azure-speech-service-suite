const electron = require("electron");
const { app, BrowserWindow } = electron;
require('dotenv').config();

app.on("ready", () => {
    let win = new BrowserWindow({
        width: 800,
        height: 600,
        show: false,
        webPreferences: {
            nodeIntegration: true
        }
    });
    win.on('closed', () => {
        win = null;
    });

    win.once("ready-to-show", () => {
        win.show();
    });

    // Or load a local HTML file
    win.loadURL(`file://${__dirname}/app/index.html`);

});

app.on("window-all-closed", () => {
    app.quit();
});