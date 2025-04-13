const { app, BrowserWindow } = require('electron');
const path = require('path');
const { exec } = require('child_process');  // To run the server

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true
        }
    });

    mainWindow.loadFile(path.join(__dirname, 'public', 'waitingroom.html'));

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// When Electron is ready, create the window and start the server
app.whenReady().then(() => {
    createWindow();

    // Start the server in the background. Ensure no other server is using port 3000.
    exec('node server.js', (err, stdout, stderr) => {
        if (err) {
            console.error('Server startup error:', err);
            return;
        }
        console.log('Server started:', stdout);
        if (stderr) console.error('Server error:', stderr);
    });

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
