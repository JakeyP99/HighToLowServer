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

    socket.on('serverShutdown', () => {
        console.log('Server is shutting down...');
        // Display a message to the user
        const shutdownMessage = document.createElement('div');
        shutdownMessage.className = 'shutdown-message';
        shutdownMessage.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); ' +
            'background-color: #ff4444; color: white; padding: 20px; border-radius: 5px; text-align: center; ' +
            'box-shadow: 0 2px 10px rgba(0,0,0,0.2); z-index: 1000;';
        shutdownMessage.textContent = 'Server is shutting down. Please wait...';
        document.body.appendChild(shutdownMessage);

        // Disable any interactive elements
        const joinButton = document.getElementById('joinButton');
        if (joinButton) joinButton.disabled = true;
        
        // Automatically disconnect after a short delay
        setTimeout(() => {
            socket.disconnect();
            window.location.reload();
        }, 3000);
    });

    socket.on('playerCountUpdate', (currentPlayers, totalPlayers) => {
        const playerCountElement = document.getElementById('playerCount');
        const remainingPlayers = totalPlayers - currentPlayers;
        
        if (remainingPlayers > 0) {
            playerCountElement.textContent = `Waiting for ${remainingPlayers} more player${remainingPlayers === 1 ? '' : 's'} to join...`;
        } else {
            playerCountElement.textContent = 'All players have joined!';
        }
    });

    document.getElementById('joinButton').addEventListener('click', () => {
        const name = document.getElementById('playerNameInput').value;
        console.log("Join button clicked. Name:", name);
        if (name) {
            socket.emit('join', name);
        }
    });
});
