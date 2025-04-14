const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let players = [];
let totalPlayers = 0;
let connectedClients = 0;

// Serve static files from the public directory
app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
    connectedClients++;
    
    // Broadcast the new connection count to all clients
    io.emit('clientCountUpdate', connectedClients);


    // Handle initial state request
    socket.on('requestInitialState', () => {
        console.log(`Client ${socket.id} requested initial state`);
        socket.emit('playerCountUpdate', players.length, totalPlayers);
        socket.emit('clientCountUpdate', connectedClients);
        socket.emit('updatePlayers', players);
        console.log('Sent initial state:', {
            connectedClients,
            currentPlayers: players.length,
            totalPlayers: totalPlayers,
            players: players
        });
    });

    socket.on('setPlayerCount', (count) => {
        console.log(`Received setPlayerCount event from ${socket.id}`);
        console.log(`Setting player count to: ${count}`);
        
        // Update total players
        totalPlayers = parseInt(count);
        
        // Broadcast to ALL clients including sender
        io.emit('playerCountUpdate', players.length, totalPlayers);
        io.emit('updatePlayers', players);
        console.log(`Broadcasting player count update - Current: ${players.length}, Total: ${totalPlayers}`);
    });

    socket.on('join', (playerData) => {
        console.log('Received join event from', socket.id, ':', playerData);
        
        // Remove any existing player with same socket ID
        players = players.filter(p => p.id !== socket.id);
        
        // Add new player
        const newPlayer = {
            id: socket.id,
            name: playerData.name,
            classChoice: playerData.classChoice
        };
        players.push(newPlayer);
        
        // Broadcast updates to ALL clients
        io.emit('updatePlayers', players);
        io.emit('playerCountUpdate', players.length, totalPlayers);
        
        console.log('Current players:', players);
        console.log(`Current/Total players: ${players.length}/${totalPlayers}`);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
        connectedClients--;
        players = players.filter(p => p.id !== socket.id);
        io.emit('updatePlayers', players);
        io.emit('playerCountUpdate', players.length, totalPlayers);
        io.emit('clientCountUpdate', connectedClients);
    });

    // Assign host status to first connected player
    if (players.length === 0) {
        socket.emit("hostAssigned", true);
    } else {
        socket.emit("hostAssigned", false);
    }

    // Handle game starting (if needed)
    socket.on('startGame', () => {
        io.emit('gameStarted');
    });
});

// Graceful shutdown handler
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

function shutdown() {
    console.log('Starting graceful shutdown...');
    io.emit('serverShutdown');
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
    setTimeout(() => {
        console.error('Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 10000);
}

server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
