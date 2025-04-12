document.addEventListener('DOMContentLoaded', () => {
    const socket = io.connect('http://localhost:3000');

    console.log("Waiting room script loaded");

    socket.on('updatePlayers', (players) => {
        const playerList = document.getElementById('playerList');
        playerList.innerHTML = '';

        players.forEach(player => {
            const li = document.createElement('li');
            li.textContent = player.name;
            playerList.appendChild(li);
        });
    });

    socket.on('player-joined', (name) => {
        console.log(`${name} has joined the game!`);
    });

    document.getElementById('joinButton').addEventListener('click', () => {
        const name = document.getElementById('playerNameInput').value;
        console.log("Join button clicked. Name:", name);
        if (name) {
            socket.emit('join', name);
        }
    });
});
