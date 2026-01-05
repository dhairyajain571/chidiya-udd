import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
app.use(cors());

const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", 
        methods: ["GET", "POST"]
    }
});

// GAME STATE
const rooms = {};

// DATA
const GAME_DATA = [
  { name: "Chidiya", type: "fly" },
  { name: "Tota", type: "fly" },
  { name: "Maina", type: "fly" },
  { name: "Kabootar", type: "fly" },
  { name: "Cheel", type: "fly" },
  { name: "Kauwa", type: "fly" },
  { name: "Makkhi", type: "fly" },
  { name: "Machchar", type: "fly" },
  { name: "Titli", type: "fly" },
  { name: "Ullu", type: "fly" },
  { name: "Bat", type: "fly" },
  { name: "Dragonfly", type: "fly" },
  { name: "Plane", type: "fly" },
  { name: "Rocket", type: "fly" },
  { name: "Helicopter", type: "fly" },
  { name: "Drone", type: "fly" },
  { name: "Kite", type: "fly" },
  { name: "Balloon", type: "fly" },
  { name: "Superman", type: "fly" },
  { name: "UFO", type: "fly" },

  { name: "Haathi", type: "ground" },
  { name: "Ghoda", type: "ground" },
  { name: "Sher", type: "ground" },
  { name: "Kutta", type: "ground" },
  { name: "Billi", type: "ground" },
  { name: "Chuha", type: "ground" },
  { name: "Gaay", type: "ground" },
  { name: "Bhains", type: "ground" },
  { name: "Bhalu", type: "ground" },
  { name: "Khargosh", type: "ground" },
  { name: "Bandar", type: "ground" },
  { name: "Oont", type: "ground" },
  { name: "Car", type: "ground" },
  { name: "Bus", type: "ground" },
  { name: "Truck", type: "ground" },
  { name: "Bike", type: "ground" },
  { name: "Train", type: "ground" },
  { name: "Ship", type: "ground" },
  { name: "Table", type: "ground" },
  { name: "Chair", type: "ground" },
  { name: "Laptop", type: "ground" },
  { name: "Phone", type: "ground" },
  { name: "Shoe", type: "ground" },
  { name: "House", type: "ground" },
  { name: "Tree", type: "ground" },
  { name: "Mountain", type: "ground" },
];

function generateRoomId() {
  return Math.random().toString(36).substring(2, 6).toUpperCase();
}

// "Smart Random" to prevent streaks
function getBalancedItem(history) {
  // history: array of 'fly' or 'ground'
  const last3 = history.slice(-3);
  const flyCount = last3.filter((t) => t === "fly").length;
  const groundCount = last3.filter((t) => t === "ground").length;

  let candidates = GAME_DATA;
  if (flyCount >= 3) {
    candidates = GAME_DATA.filter((i) => i.type === "ground");
  } else if (groundCount >= 3) {
    candidates = GAME_DATA.filter((i) => i.type === "fly");
  }

  return candidates[Math.floor(Math.random() * candidates.length)];
}

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on(
    "create_room",
    ({ name, difficulty = "MEDIUM", visualHints = true }) => {
      const roomId = generateRoomId();
      rooms[roomId] = {
        id: roomId,
        players: [{ id: socket.id, name, isHost: true }],
        gameState: "LOBBY",
        scores: { [socket.id]: 0 },
        lives: { [socket.id]: 3 },
        actions: {},
        history: [], // Track last few items types
        settings: { difficulty, visualHints },
      };
      socket.join(roomId);
      socket.emit("room_created", roomId);
      io.to(roomId).emit("update_players", rooms[roomId].players);
    }
  );

  socket.on("join_room", ({ roomId, playerName }) => {
    const room = rooms[roomId];
    if (room && room.gameState === "LOBBY") {
      room.players.push({ id: socket.id, name: playerName, isHost: false });
      room.scores[socket.id] = 0;
      room.lives[socket.id] = 3;
      socket.join(roomId);
      socket.emit("joined_room", roomId);
      io.to(roomId).emit("update_players", room.players);
    } else {
      socket.emit("error", "Room not found or game already started");
    }
  });

  socket.on("start_game", (roomId) => {
    if (rooms[roomId]) {
      rooms[roomId].gameState = "PLAYING";
      io.to(roomId).emit("game_started", rooms[roomId].settings);
      startRound(roomId);
    }
  });

  socket.on("player_action", ({ roomId, action }) => {
    // action: 'FLY' or 'NOT_FLY'
    if (rooms[roomId] && rooms[roomId].gameState === "PLAYING") {
      rooms[roomId].actions[socket.id] = action;
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
    // Handle cleanup
    for (const roomId in rooms) {
      const room = rooms[roomId];
      const pIndex = room.players.findIndex((p) => p.id === socket.id);
      if (pIndex !== -1) {
        room.players.splice(pIndex, 1);
        io.to(roomId).emit("update_players", room.players);
        if (room.players.length === 0) {
          delete rooms[roomId];
        }
        break;
      }
    }
  });
});

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
  const diffMap = { EASY: 2000, MEDIUM: 1500, HARD: 1000 };
  let duration = diffMap[room.settings.difficulty] || 1500;

  // Speed up as score increases
  const maxScore = Math.max(...Object.values(room.scores));
  const decrease = Math.floor(maxScore / 5) * 100;

  duration = Math.max(600, duration - decrease);

  io.to(roomId).emit("new_round", { item, duration });

  setTimeout(() => {
    resolveRound(roomId);
  }, duration);
}

function resolveRound(roomId) {
  const room = rooms[roomId];
  if (!room) return;

  const item = room.currentItem;
  let anySurvivor = false;

  // Check actions
  room.players.forEach((p) => {
    if (room.lives[p.id] <= 0) return; // Dead players don't play

    const action = room.actions[p.id];
    // Logic:
    // Item FLY: Must action='FLY'
    // Item GROUND: Must action='NOT_FLY'

    let correct = false;
    if (item.type === "fly") {
      correct = action === "FLY";
    } else {
      correct = action === "NOT_FLY";
    }

    if (correct) {
      room.scores[p.id]++;
    } else {
      room.lives[p.id]--;
      if (room.lives[p.id] <= 0) {
        io.to(roomId).emit("player_eliminated", p.id);
      }
    }

    if (room.lives[p.id] > 0) anySurvivor = true;
  });

  io.to(roomId).emit("round_result", {
    scores: room.scores,
    lives: room.lives,
  });

  // Check Game Over
  const survivors = room.players.filter((p) => room.lives[p.id] > 0);

  if (survivors.length === 0) {
    // Everyone died same time?
    io.to(roomId).emit("game_over", { winner: null });
    delete rooms[roomId];
    return;
  } else if (survivors.length === 1 && room.players.length > 1) {
    // Winner declared (if multiplayer)
    io.to(roomId).emit("game_over", { winner: survivors[0] });
    delete rooms[roomId];
    return;
  }
  // Single player continues until 0 lives
  else if (room.players.length === 1 && survivors.length === 0) {
    io.to(roomId).emit("game_over", { winner: null });
    delete rooms[roomId];
    return;
  }

  // Next Round
  setTimeout(() => startRound(roomId), 1000);
}

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
