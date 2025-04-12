const { execSync, spawn } = require('child_process');

// Step 1: Kill any process using port 3000
try {
    const findPid = execSync(`netstat -ano | findstr :3000`).toString();
    const lines = findPid.split('\n').filter(Boolean);
    const pids = new Set(lines.map(line => line.trim().split(/\s+/).pop()));
    
    for (const pid of pids) {
        if (!isNaN(pid)) {
            console.log(`Killing process on port 3000: PID ${pid}`);
            execSync(`taskkill /PID ${pid} /F`);
        }
    }
} catch (err) {
    console.log('No existing process on port 3000');
}

// Step 2: Start the server
const server = spawn('node', ['server.js'], {
    stdio: 'inherit',
    shell: true
});

// Step 3: Start the Electron app
const electron = spawn('npx', ['electron', 'main.js'], {
    stdio: 'inherit',
    shell: true
});

electron.on('exit', () => {
    server.kill();
    process.exit();
});

