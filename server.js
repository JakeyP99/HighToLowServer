const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

let players = [];

io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);

    // Handle player joining the game
    socket.on('join', (name) => {
        console.log(`Received 'join' event with name: ${name}`);
        players.push({ id: socket.id, name });
        console.log('Updated players:', players);
        io.emit('updatePlayers', players);  // Tell all clients the updated list
    });
    
    // Handle player disconnecting
    socket.on('disconnect', () => {
        players = players.filter(p => p.id !== socket.id);
        io.emit('updatePlayers', players);
        console.log('A player disconnected');
    });

    // Handle game starting (if needed)
    socket.on('startGame', () => {
        io.emit('gameStarted');
    });
});

// Serve static files from the public folder
app.use(express.static('public'));

server.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
