const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let players = [];
let totalPlayers = 0;
let currentPlayers = 0;

io.on('connection', (socket) => {
    console.log('New client connected');
    currentPlayers++;
    
    // Handle player count updates
    socket.on('setPlayerCount', (count) => {
        console.log(`Received setPlayerCount event from ${socket.id}`);
        console.log(`Player count set to: ${count}`);
        totalPlayers = count;
        // Broadcast the player count update to all clients
        io.emit('playerCountUpdate', currentPlayers, totalPlayers);
        console.log(`Broadcasting player count update - Current: ${currentPlayers}, Total: ${totalPlayers}`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('Client disconnected');
        currentPlayers--;
        // Broadcast the updated player count when someone disconnects
        io.emit('playerCountUpdate', currentPlayers, totalPlayers);
        console.log(`Broadcasting player count update after disconnect - Current: ${currentPlayers}, Total: ${totalPlayers}`);
    });

    // Assign host status to first connected player
    if (players.length === 0) {
        socket.emit("hostAssigned", true); // this user is the host
    } else {
        socket.emit("hostAssigned", false); // this user is not the host
    }

    // Handle player joining the game
    socket.on('join', (name) => {
        console.log(`Received 'join' event with name: ${name}`);
        players.push({ id: socket.id, name });
        console.log('Updated players:', players);
        io.emit('updatePlayers', players);  // Tell all clients the updated list
    });

    // Handle game starting (if needed)
    socket.on('startGame', () => {
        io.emit('gameStarted');
    });

    // Add logging for connection and disconnection
    console.log(`New connection established. Current players: ${currentPlayers}`);
});

// Serve static files from the public folder
app.use(express.static('public'));

// Graceful shutdown handler
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

function shutdown() {
    console.log('Starting graceful shutdown...');
    
    // Notify all clients that the server is shutting down
    io.emit('serverShutdown');
    
    // Close the server
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });

    // If server hasn't closed in 10 seconds, force shutdown
    setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);
}

server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
