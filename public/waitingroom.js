document.addEventListener('DOMContentLoaded', () => {
    // Connect to the socket server
    const socket = io();
    
    // Debug logging for connection status
    socket.on('connect', () => {
        console.log('Connected to server');
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from server');
    });

    socket.on('updatePlayers', (players) => {
        console.log('Received players update:', players);
        const playerList = document.getElementById('playerList');
        if (!playerList) {
            console.error('Player list element not found');
            return;
        }

        // Clear existing list
        playerList.innerHTML = '';

        // Add each player to the list
        players.forEach(player => {
            console.log('Adding player:', player);
            const li = document.createElement('li');
            li.className = 'player-item';
            
            // Add player name
            const nameDiv = document.createElement('div');
            nameDiv.className = 'player-name';
            nameDiv.textContent = player.name || 'Unknown Player';
            
            // Add player class
            const classDiv = document.createElement('div');
            classDiv.className = 'player-class';
            classDiv.textContent = player.classChoice || 'No class selected';
            
            // Assemble the elements
            li.appendChild(nameDiv);
            li.appendChild(classDiv);
            
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
        console.log('Received player count update:', currentPlayers, totalPlayers);
        const playerCountElement = document.getElementById('playerCount');
        if (!playerCountElement) {
            console.error('Player count element not found');
            return;
        }

        const remainingPlayers = totalPlayers - currentPlayers;
        if (remainingPlayers > 0) {
            playerCountElement.textContent = `Waiting for ${remainingPlayers} more player${remainingPlayers === 1 ? '' : 's'} to join...`;
        } else {
            playerCountElement.textContent = 'All players have joined! Game starting soon...';
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
