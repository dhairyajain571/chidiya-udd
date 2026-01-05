
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] }
});

const GAME_DATA = [
    // Birds/Flying
    { name: 'Chidiya', type: 'fly' }, { name: 'Tota', type: 'fly' },
    { name: 'Maina', type: 'fly' }, { name: 'Kabootar', type: 'fly' },
    { name: 'Cheel', type: 'fly' }, { name: 'Kauwa', type: 'fly' },
    { name: 'Makkhi', type: 'fly' }, { name: 'Machchar', type: 'fly' },
    { name: 'Titli', type: 'fly' }, { name: 'Ullu', type: 'fly' },
    { name: 'Bat', type: 'fly' }, { name: 'Dragonfly', type: 'fly' },
    
    // Objects Flying
    { name: 'Plane', type: 'fly' }, { name: 'Rocket', type: 'fly' },
    { name: 'Helicopter', type: 'fly' }, { name: 'Drone', type: 'fly' },
    { name: 'Kite', type: 'fly' }, { name: 'Balloon', type: 'fly' },
    { name: 'Superman', type: 'fly' }, { name: 'UFO', type: 'fly' },

    // Animals Ground
    { name: 'Haathi', type: 'ground' }, { name: 'Ghoda', type: 'ground' },
    { name: 'Sher', type: 'ground' }, { name: 'Kutta', type: 'ground' },
    { name: 'Billi', type: 'ground' }, { name: 'Chuha', type: 'ground' },
    { name: 'Gaay', type: 'ground' }, { name: 'Bhains', type: 'ground' },
    { name: 'Bhalu', type: 'ground' }, { name: 'Khargosh', type: 'ground' },
    { name: 'Bandar', type: 'ground' }, { name: 'Oont', type: 'ground' }, // Camel

    // Objects Ground
    { name: 'Car', type: 'ground' }, { name: 'Bus', type: 'ground' },
    { name: 'Truck', type: 'ground' }, { name: 'Bike', type: 'ground' },
    { name: 'Train', type: 'ground' }, { name: 'Ship', type: 'ground' },
    { name: 'Table', type: 'ground' }, { name: 'Chair', type: 'ground' },
    { name: 'Laptop', type: 'ground' }, { name: 'Phone', type: 'ground' },
    { name: 'Shoe', type: 'ground' }, { name: 'House', type: 'ground' },
    { name: 'Tree', type: 'ground' }, { name: 'Mountain', type: 'ground' }
];

const rooms = {};

function generateRoomId() {
    return Math.random().toString(36).substring(2, 6).toUpperCase();
}

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('create_room', ({ name, difficulty = 'MEDIUM', visualHints = true }) => {
        const roomId = generateRoomId();
        rooms[roomId] = {
            id: roomId,
            players: [{ id: socket.id, name, isHost: true }],
            gameState: 'LOBBY',
            scores: { [socket.id]: 0 },
            lives: { [socket.id]: 3 },
            actions: {},
            history: [], // Track last few items types
            settings: { difficulty, visualHints } // Store visualHints
        };
        socket.join(roomId);
        socket.emit('room_created', roomId);
        io.to(roomId).emit('update_players', rooms[roomId].players);
    });

    socket.on('join_room', ({ roomId, playerName }) => {
        const room = rooms[roomId];
        if (room && room.gameState === 'LOBBY') {
            room.players.push({ id: socket.id, name: playerName, isHost: false });
            room.scores[socket.id] = 0;
            room.lives[socket.id] = 3;
            socket.join(roomId);
            socket.emit('joined_room', roomId);
            io.to(roomId).emit('update_players', room.players);
        } else {
            socket.emit('error', 'Room not found or game in progress');
        }
    });

    socket.on('start_game', (roomId) => {
        if (rooms[roomId]) {
            rooms[roomId].gameState = 'PLAYING';
            io.to(roomId).emit('game_started', rooms[roomId].settings);
            startRound(roomId);
        }
    });

    socket.on('player_action', ({ roomId, action }) => {
        if (rooms[roomId]) {
            rooms[roomId].actions[socket.id] = action;
        }
    });

    socket.on('disconnect', () => {
        // Cleanup logic is simplified for demo
        for (const rid in rooms) {
            const r = rooms[rid];
            const idx = r.players.findIndex(p => p.id === socket.id);
            if (idx !== -1) {
                r.players.splice(idx, 1);
                io.to(rid).emit('update_players', r.players);
                if (r.players.length === 0) delete rooms[rid];
            }
        }
    });
});

function getBalancedItem(history) {
    // History is array of 'fly' or 'ground'
    const last3 = history.slice(-3);
    
    // Default pool
    let candidates = GAME_DATA;
    
    // Anti-streak logic
    if (last3.length === 3) {
        if (last3.every(t => t === 'fly')) {
            // High chance of ground
            if (Math.random() > 0.2) candidates = GAME_DATA.filter(i => i.type === 'ground');
        } else if (last3.every(t => t === 'ground')) {
            // High chance of fly
            if (Math.random() > 0.2) candidates = GAME_DATA.filter(i => i.type === 'fly');
        }
    }
    
    return candidates[Math.floor(Math.random() * candidates.length)];
}

function startRound(roomId) {
    const room = rooms[roomId];
    if (!room) return;
    
    room.actions = {};
    
    // BALANCED SELECTION
    const item = getBalancedItem(room.history || []);
    room.currentItem = item;
    room.history.push(item.type);
    if (room.history.length > 5) room.history.shift();

    // DIFFICULTY LOGIC
    // Base durations
    const diffMap = { 'EASY': 2000, 'MEDIUM': 1500, 'HARD': 1000 };
    let duration = diffMap[room.settings.difficulty] || 1500;
    
    // Speed up over time (every 5 rounds roughly, represented by history length check or just scores)
    // Let's use max score in room as proxy for progress
    const maxScore = Math.max(...Object.values(room.scores));
    const decrease = Math.floor(maxScore / 5) * 100; // -100ms every 5 points
    
    duration = Math.max(600, duration - decrease); // Cap at 600ms

    io.to(roomId).emit('new_round', { item, duration });

    setTimeout(() => {
        resolveRound(roomId);
    }, duration);
}

function resolveRound(roomId) {
    const room = rooms[roomId];
    if (!room) return;

    const item = room.currentItem;
    room.players.forEach(p => {
        if (room.lives[p.id] <= 0) return;

        const playerAction = room.actions[p.id]; // 'FLY', 'NOT_FLY', or undefined (Timeout)
        let correct = false;
        
        // LOGIC: Must provide correct input. Timeout is always wrong now.
        if (item.type === 'fly') {
            if (playerAction === 'FLY') correct = true;
        } else {
            // Ground
            if (playerAction === 'NOT_FLY') correct = true;
        }

        if (correct) {
            room.scores[p.id]++;
        } else {
            room.lives[p.id]--;
            if (room.lives[p.id] <= 0) {
                io.to(roomId).emit('player_eliminated', p.id);
            }
        }
    });

    io.to(roomId).emit('round_result', { scores: room.scores, lives: room.lives });

    // CHECK WIN/LOSS CONDITION
    const strategies = room.players.map(p => ({
        id: p.id,
        alive: room.lives[p.id] > 0,
        name: p.name
    }));
    
    const aliveCount = strategies.filter(s => s.alive).length;
    
    // Multi-player: Game Over if 1 or 0 left
    if (room.players.length > 1) {
        if (aliveCount <= 1) {
            const winner = strategies.find(s => s.alive);
            io.to(roomId).emit('game_over', { winner: winner || null });
            room.gameState = 'GAMEOVER';
            return; // STOP LOOP
        }
    } 
    // Single-player: Game Over if 0 left
    else {
        if (aliveCount === 0) {
            io.to(roomId).emit('game_over', { winner: null });
            room.gameState = 'GAMEOVER';
            return; // STOP LOOP
        }
    }

    // Next round if game continues
    setTimeout(() => {
        startRound(roomId);
    }, 1000);
}

const PORT = 3001;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
