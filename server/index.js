import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());

// Serve Static Files (Vite Build)
app.use(express.static(path.join(__dirname, '../dist')));

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
  // --- FLYING (UDD) ---
  // Birds
  { name: "Chidiya", type: "fly" }, { name: "Tota", type: "fly" }, { name: "Maina", type: "fly" }, { name: "Kabootar", type: "fly" },
  { name: "Cheel", type: "fly" }, { name: "Kauwa", type: "fly" }, { name: "Makkhi", type: "fly" }, { name: "Machchar", type: "fly" },
  { name: "Titli", type: "fly" }, { name: "Ullu", type: "fly" }, { name: "Bat", type: "fly" }, { name: "Dragonfly", type: "fly" },
  { name: "Hummingbird", type: "fly" }, { name: "Eagle", type: "fly" }, { name: "Vulture", type: "fly" }, { name: "Hawk", type: "fly" },
  { name: "Falcon", type: "fly" }, { name: "Seagull", type: "fly" }, { name: "Pelican", type: "fly" }, { name: "Stork", type: "fly" },
  { name: "Flamingo", type: "fly" }, { name: "Heron", type: "fly" }, { name: "Swan", type: "fly" }, { name: "Duck", type: "fly" },
  { name: "Goose", type: "fly" }, { name: "Peacock", type: "fly" }, { name: "Kingfisher", type: "fly" }, { name: "Woodpecker", type: "fly" },
  { name: "Robin", type: "fly" }, { name: "Sparrow", type: "fly" }, { name: "Crow", type: "fly" }, { name: "Raven", type: "fly" },
  { name: "Magpie", type: "fly" }, { name: "Bluejay", type: "fly" }, { name: "Cardinal", type: "fly" }, { name: "Goldfinch", type: "fly" },
  { name: "Parrot", type: "fly" }, { name: "Cockatoo", type: "fly" }, { name: "Macaw", type: "fly" }, { name: "Toucan", type: "fly" },
  { name: "Owl", type: "fly" }, { name: "Pigeon", type: "fly" }, { name: "Dove", type: "fly" }, { name: "Albatross", type: "fly" },
  { name: "Ostrich", type: "fly" }, { name: "Penguin", type: "fly" }, /* Trick: Some birds don't fly but users expect UDD for generic birds? No, Ostrich/Penguin = Ground usually. Removed from FLY */
  { name: "Penguin", type: "ground" }, { name: "Ostrich", type: "ground" }, { name: "Kiwi", type: "ground" }, { name: "Emu", type: "ground" },

  // Insects & Bugs (Flying)
  { name: "Bee", type: "fly" }, { name: "Wasp", type: "fly" }, { name: "Hornet", type: "fly" }, { name: "Bumblebee", type: "fly" },
  { name: "Moth", type: "fly" }, { name: "Butterfly", type: "fly" }, { name: "Ladybug", type: "fly" }, { name: "Beetle", type: "fly" },
  { name: "Grasshopper", type: "fly" }, { name: "Cricket", type: "fly" }, { name: "Locust", type: "fly" }, { name: "Cicada", type: "fly" },
  { name: "Firefly", type: "fly" }, { name: "Mosquito", type: "fly" }, { name: "Fly", type: "fly" }, { name: "Gnat", type: "fly" },

  // Man-made Aviation
  { name: "Plane", type: "fly" }, { name: "Rocket", type: "fly" }, { name: "Helicopter", type: "fly" }, { name: "Drone", type: "fly" },
  { name: "Kite", type: "fly" }, { name: "Balloon", type: "fly" }, { name: "UFO", type: "fly" }, { name: "Jet", type: "fly" },
  { name: "Glider", type: "fly" }, { name: "Parachute", type: "fly" }, { name: "Blimp", type: "fly" }, { name: "Zeppelin", type: "fly" },
  { name: "Satellite", type: "fly" }, { name: "Space Shuttle", type: "fly" }, { name: "Fighter Jet", type: "fly" }, { name: "Biplane", type: "fly" },
  { name: "Seaplane", type: "fly" }, { name: "Hang Glider", type: "fly" }, { name: "Paper Plane", type: "fly" }, { name: "Frisbee", type: "fly" },
  { name: "Boomerang", type: "fly" }, { name: "Arrow", type: "fly" }, { name: "Dart", type: "fly" }, { name: "Bullet", type: "fly" },
  { name: "Missile", type: "fly" }, { name: "Cannonball", type: "fly" }, { name: "Fireworks", type: "fly" },

  // Mythical & Other
  { name: "Superman", type: "fly" }, { name: "Dragon", type: "fly" }, { name: "Angel", type: "fly" }, { name: "Fairy", type: "fly" },
  { name: "Phoenix", type: "fly" }, { name: "Pegasus", type: "fly" }, { name: "Griffin", type: "fly" }, { name: "Vampire", type: "fly" },
  { name: "Witch", type: "fly" }, { name: "Ghost", type: "fly" }, { name: "Genie", type: "fly" }, { name: "Cupid", type: "fly" },
  { name: "Cloud", type: "fly" },

  // --- GROUND (NON-UDD) ---
  // Animals (Mammals)
  { name: "Haathi", type: "ground" }, { name: "Ghoda", type: "ground" }, { name: "Sher", type: "ground" }, { name: "Kutta", type: "ground" },
  { name: "Billi", type: "ground" }, { name: "Chuha", type: "ground" }, { name: "Gaay", type: "ground" }, { name: "Bhains", type: "ground" },
  { name: "Bhalu", type: "ground" }, { name: "Khargosh", type: "ground" }, { name: "Bandar", type: "ground" }, { name: "Oont", type: "ground" },
  { name: "Pig", type: "ground" }, { name: "Sheep", type: "ground" }, { name: "Goat", type: "ground" }, { name: "Donkey", type: "ground" },
  { name: "Mule", type: "ground" }, { name: "Zebra", type: "ground" }, { name: "Giraffe", type: "ground" }, { name: "Rhino", type: "ground" },
  { name: "Hippo", type: "ground" }, { name: "Deer", type: "ground" }, { name: "Moose", type: "ground" }, { name: "Elk", type: "ground" },
  { name: "Bison", type: "ground" }, { name: "Buffalo", type: "ground" }, { name: "Ox", type: "ground" }, { name: "Bull", type: "ground" },
  { name: "Cow", type: "ground" }, { name: "Calf", type: "ground" }, { name: "Lamb", type: "ground" }, { name: "Tiger", type: "ground" },
  { name: "Lion", type: "ground" }, { name: "Panther", type: "ground" }, { name: "Leopard", type: "ground" }, { name: "Cheetah", type: "ground" },
  { name: "Jaguar", type: "ground" }, { name: "Cougar", type: "ground" }, { name: "Lynx", type: "ground" }, { name: "Bobcat", type: "ground" },
  { name: "Wolf", type: "ground" }, { name: "Fox", type: "ground" }, { name: "Coyote", type: "ground" }, { name: "Jackal", type: "ground" },
  { name: "Hyena", type: "ground" }, { name: "Bear", type: "ground" }, { name: "Polar Bear", type: "ground" }, { name: "Panda", type: "ground" },
  { name: "Koala", type: "ground" }, { name: "Kangaroo", type: "ground" }, { name: "Wallaby", type: "ground" }, { name: "Wombat", type: "ground" },
  { name: "Platypus", type: "ground" }, { name: "Otter", type: "ground" }, { name: "Badger", type: "ground" }, { name: "Beaver", type: "ground" },
  { name: "Raccoon", type: "ground" }, { name: "Skunk", type: "ground" }, { name: "Squirrel", type: "ground" }, { name: "Chipmunk", type: "ground" },
  { name: "Rat", type: "ground" }, { name: "Mouse", type: "ground" }, { name: "Hamster", type: "ground" }, { name: "Guinea Pig", type: "ground" },
  { name: "Rabbit", type: "ground" }, { name: "Hare", type: "ground" }, { name: "Mole", type: "ground" }, { name: "Hedgehog", type: "ground" },
  { name: "Porcupine", type: "ground" }, { name: "Armadillo", type: "ground" }, { name: "Sloth", type: "ground" }, { name: "Anteater", type: "ground" },

  // Reptiles & Amphibians
  { name: "Snake", type: "ground" }, { name: "Lizard", type: "ground" }, { name: "Turtle", type: "ground" }, { name: "Tortoise", type: "ground" },
  { name: "Crocodile", type: "ground" }, { name: "Alligator", type: "ground" }, { name: "Frog", type: "ground" }, { name: "Toad", type: "ground" },
  { name: "Salamander", type: "ground" }, { name: "Newt", type: "ground" }, { name: "Chameleon", type: "ground" }, { name: "Gecko", type: "ground" },
  { name: "Iguana", type: "ground" }, { name: "Komodo Dragon", type: "ground" }, { name: "Python", type: "ground" }, { name: "Cobra", type: "ground" },

  // Sea Creatures (Generally Ground/Swim)
  { name: "Fish", type: "ground" }, { name: "Shark", type: "ground" }, { name: "Whale", type: "ground" }, { name: "Dolphin", type: "ground" },
  { name: "Octopus", type: "ground" }, { name: "Squid", type: "ground" }, { name: "Jellyfish", type: "ground" }, { name: "Starfish", type: "ground" },
  { name: "Crab", type: "ground" }, { name: "Lobster", type: "ground" }, { name: "Shrimp", type: "ground" }, { name: "Seahorse", type: "ground" },
  { name: "Seal", type: "ground" }, { name: "Walrus", type: "ground" }, { name: "Manatee", type: "ground" }, { name: "Eel", type: "ground" },
  { name: "Ray", type: "ground" }, { name: "Coral", type: "ground" }, { name: "Clam", type: "ground" }, { name: "Oyster", type: "ground" },

  // Insects (Crawling/Non-Flying generic context or larvae)
  { name: "Ant", type: "ground" }, { name: "Spider", type: "ground" }, { name: "Scorpion", type: "ground" }, { name: "Centipede", type: "ground" },
  { name: "Millipede", type: "ground" }, { name: "Worm", type: "ground" }, { name: "Caterpillar", type: "ground" }, { name: "Snail", type: "ground" },
  { name: "Slug", type: "ground" }, { name: "Tick", type: "ground" }, { name: "Flea", type: "ground" }, { name: "Louse", type: "ground" },
  { name: "Mite", type: "ground" }, { name: "Termite", type: "ground" }, { name: "Cockroach", type: "ground" }, { name: "Bedbug", type: "ground" },

  // Vehicles (Land/Water)
  { name: "Car", type: "ground" }, { name: "Bus", type: "ground" }, { name: "Truck", type: "ground" }, { name: "Bike", type: "ground" },
  { name: "Train", type: "ground" }, { name: "Ship", type: "ground" }, { name: "Boat", type: "ground" }, { name: "Submarine", type: "ground" },
  { name: "Bicycle", type: "ground" }, { name: "Scooter", type: "ground" }, { name: "Skateboard", type: "ground" }, { name: "Rollerblades", type: "ground" },
  { name: "Van", type: "ground" }, { name: "Jeep", type: "ground" }, { name: "Taxi", type: "ground" }, { name: "Police Car", type: "ground" },
  { name: "Ambulance", type: "ground" }, { name: "Fire Truck", type: "ground" }, { name: "Tractor", type: "ground" }, { name: "Bulldozer", type: "ground" },
  { name: "Crane", type: "ground" }, { name: "Tank", type: "ground" }, { name: "Canoe", type: "ground" }, { name: "Kayak", type: "ground" },
  { name: "Raft", type: "ground" }, { name: "Ferry", type: "ground" }, { name: "Yacht", type: "ground" }, { name: "Cruise Ship", type: "ground" },
  { name: "Rickshaw", type: "ground" }, { name: "Cart", type: "ground" }, { name: "Wheelchair", type: "ground" }, { name: "Stroller", type: "ground" },

  // Objects (Furniture, Household)
  { name: "Table", type: "ground" }, { name: "Chair", type: "ground" }, { name: "Sofa", type: "ground" }, { name: "Bed", type: "ground" },
  { name: "Desk", type: "ground" }, { name: "Cupboard", type: "ground" }, { name: "Shelf", type: "ground" }, { name: "Lamp", type: "ground" },
  { name: "Rug", type: "ground" }, { name: "Curtain", type: "ground" }, { name: "Door", type: "ground" }, { name: "Window", type: "ground" },
  { name: "Wall", type: "ground" }, { name: "Floor", type: "ground" }, { name: "Ceiling", type: "ground" }, { name: "Roof", type: "ground" },
  { name: "Stairs", type: "ground" }, { name: "Ladder", type: "ground" }, { name: "Mirror", type: "ground" }, { name: "Clock", type: "ground" },
  { name: "Vase", type: "ground" }, { name: "Pot", type: "ground" }, { name: "Pan", type: "ground" }, { name: "Plate", type: "ground" },
  { name: "Bowl", type: "ground" }, { name: "Cup", type: "ground" }, { name: "Glass", type: "ground" }, { name: "Mug", type: "ground" },
  { name: "Spoon", type: "ground" }, { name: "Fork", type: "ground" }, { name: "Knife", type: "ground" }, { name: "Bottle", type: "ground" },
  { name: "Can", type: "ground" }, { name: "Box", type: "ground" }, { name: "Bag", type: "ground" }, { name: "Basket", type: "ground" },
  { name: "Bucket", type: "ground" }, { name: "Broom", type: "ground" }, { name: "Mop", type: "ground" }, { name: "Trash Can", type: "ground" },

  // Electronics & Gadgets
  { name: "Laptop", type: "ground" }, { name: "Phone", type: "ground" }, { name: "Tablet", type: "ground" }, { name: "TV", type: "ground" },
  { name: "Radio", type: "ground" }, { name: "Speaker", type: "ground" }, { name: "Headphones", type: "ground" }, { name: "Camera", type: "ground" },
  { name: "Watch", type: "ground" }, { name: "Calculator", type: "ground" }, { name: "Remote", type: "ground" }, { name: "Keyboard", type: "ground" },
  { name: "Mouse", type: "ground" }, { name: "Printer", type: "ground" }, { name: "Scanner", type: "ground" }, { name: "Fan", type: "ground" },
  { name: "AC", type: "ground" }, { name: "Heater", type: "ground" }, { name: "Fridge", type: "ground" }, { name: "Oven", type: "ground" },
  { name: "Toaster", type: "ground" }, { name: "Blender", type: "ground" }, { name: "Mixer", type: "ground" }, { name: "Iron", type: "ground" },
  { name: "Vacuum", type: "ground" }, { name: "Drill", type: "ground" }, { name: "Hammer", type: "ground" }, { name: "Saw", type: "ground" },
  { name: "Wrench", type: "ground" }, { name: "Screwdriver", type: "ground" },

  // Clothing & Personal
  { name: "Shoe", type: "ground" }, { name: "Sock", type: "ground" }, { name: "Shirt", type: "ground" }, { name: "Pant", type: "ground" },
  { name: "Dress", type: "ground" }, { name: "Skirt", type: "ground" }, { name: "Coat", type: "ground" }, { name: "Jacket", type: "ground" },
  { name: "Hat", type: "ground" }, { name: "Cap", type: "ground" }, { name: "Glove", type: "ground" }, { name: "Scarf", type: "ground" },
  { name: "Belt", type: "ground" }, { name: "Tie", type: "ground" }, { name: "Purse", type: "ground" }, { name: "Wallet", type: "ground" },
  { name: "Glasses", type: "ground" }, { name: "Ring", type: "ground" }, { name: "Necklace", type: "ground" }, { name: "Earring", type: "ground" },
  { name: "Bracelet", type: "ground" }, { name: "Watch", type: "ground" }, { name: "Umbrella", type: "ground" }, { name: "Comb", type: "ground" },
  { name: "Brush", type: "ground" }, { name: "Toothbrush", type: "ground" }, { name: "Soap", type: "ground" }, { name: "Towel", type: "ground" },

  // Nature & Landscape
  { name: "Tree", type: "ground" }, { name: "Flower", type: "ground" }, { name: "Grass", type: "ground" }, { name: "Bush", type: "ground" },
  { name: "Rock", type: "ground" }, { name: "Stone", type: "ground" }, { name: "Sand", type: "ground" }, { name: "Mud", type: "ground" },
  { name: "Mountain", type: "ground" }, { name: "Hill", type: "ground" }, { name: "Valley", type: "ground" }, { name: "River", type: "ground" },
  { name: "Lake", type: "ground" }, { name: "Pond", type: "ground" }, { name: "Ocean", type: "ground" }, { name: "Sea", type: "ground" },
  { name: "Beach", type: "ground" }, { name: "Desert", type: "ground" }, { name: "Forest", type: "ground" }, { name: "Jungle", type: "ground" },
  { name: "Cave", type: "ground" }, { name: "Volcano", type: "ground" }, { name: "Iceberg", type: "ground" }, { name: "Glacier", type: "ground" },
  { name: "Rain", type: "ground" }, { name: "Snow", type: "ground" }, { name: "Hail", type: "ground" }, { name: "Fog", type: "ground" },

  // Food & Drink
  { name: "Apple", type: "ground" }, { name: "Banana", type: "ground" }, { name: "Orange", type: "ground" }, { name: "Grape", type: "ground" },
  { name: "Mango", type: "ground" }, { name: "Lemon", type: "ground" }, { name: "Lime", type: "ground" }, { name: "Peach", type: "ground" },
  { name: "Pear", type: "ground" }, { name: "Cherry", type: "ground" }, { name: "Berry", type: "ground" }, { name: "Melon", type: "ground" },
  { name: "Watermelon", type: "ground" }, { name: "Pineapple", type: "ground" }, { name: "Coconut", type: "ground" }, { name: "Kiwi Fruit", type: "ground" },
  { name: "Tomato", type: "ground" }, { name: "Potato", type: "ground" }, { name: "Onion", type: "ground" }, { name: "Garlic", type: "ground" },
  { name: "Carrot", type: "ground" }, { name: "Corn", type: "ground" }, { name: "Pea", type: "ground" }, { name: "Bean", type: "ground" },
  { name: "Rice", type: "ground" }, { name: "Wheat", type: "ground" }, { name: "Bread", type: "ground" }, { name: "Toast", type: "ground" },
  { name: "Cake", type: "ground" }, { name: "Pie", type: "ground" }, { name: "Cookie", type: "ground" }, { name: "Biscuit", type: "ground" },
  { name: "Candy", type: "ground" }, { name: "Chocolate", type: "ground" }, { name: "Ice Cream", type: "ground" }, { name: "Donut", type: "ground" },
  { name: "Pizza", type: "ground" }, { name: "Burger", type: "ground" }, { name: "Fries", type: "ground" }, { name: "Hotdog", type: "ground" },
  { name: "Sandwich", type: "ground" }, { name: "Soup", type: "ground" }, { name: "Salad", type: "ground" }, { name: "Steak", type: "ground" },
  { name: "Chicken", type: "ground" }, { name: "Egg", type: "ground" }, { name: "Cheese", type: "ground" }, { name: "Butter", type: "ground" },
  { name: "Milk", type: "ground" }, { name: "Juice", type: "ground" }, { name: "Water", type: "ground" }, { name: "Soda", type: "ground" },
  { name: "Tea", type: "ground" }, { name: "Coffee", type: "ground" }, { name: "Beer", type: "ground" }, { name: "Wine", type: "ground" },

  // Buildings & Structures
  { name: "House", type: "ground" }, { name: "Home", type: "ground" }, { name: "Apartment", type: "ground" }, { name: "Building", type: "ground" },
  { name: "Tower", type: "ground" }, { name: "Skyscraper", type: "ground" }, { name: "Castle", type: "ground" }, { name: "Palace", type: "ground" },
  { name: "Fort", type: "ground" }, { name: "Hut", type: "ground" }, { name: "Tent", type: "ground" }, { name: "Igloo", type: "ground" },
  { name: "Bridge", type: "ground" }, { name: "Dam", type: "ground" }, { name: "Road", type: "ground" }, { name: "Street", type: "ground" },
  { name: "Park", type: "ground" }, { name: "Garden", type: "ground" }, { name: "Farm", type: "ground" }, { name: "Zoo", type: "ground" },
  { name: "School", type: "ground" }, { name: "College", type: "ground" }, { name: "Office", type: "ground" }, { name: "Shop", type: "ground" },
  { name: "Mall", type: "ground" }, { name: "Market", type: "ground" }, { name: "Hospital", type: "ground" }, { name: "Hotel", type: "ground" },
  { name: "Bank", type: "ground" }, { name: "Museum", type: "ground" }, { name: "Library", type: "ground" }, { name: "Cinema", type: "ground" },
  { name: "Stadium", type: "ground" }, { name: "Gym", type: "ground" }, { name: "Pool", type: "ground" }, { name: "Temple", type: "ground" },
  { name: "Church", type: "ground" }, { name: "Mosque", type: "ground" }, { name: "Factory", type: "ground" }, { name: "Warehouse", type: "ground" },

  // Miscellaneous Objects
  { name: "Pen", type: "ground" }, { name: "Pencil", type: "ground" }, { name: "Eraser", type: "ground" }, { name: "Sharpener", type: "ground" },
  { name: "Ruler", type: "ground" }, { name: "Paper", type: "ground" }, { name: "Book", type: "ground" }, { name: "Notebook", type: "ground" },
  { name: "File", type: "ground" }, { name: "Folder", type: "ground" }, { name: "Envelope", type: "ground" }, { name: "Card", type: "ground" },
  { name: "Stamp", type: "ground" }, { name: "Coin", type: "ground" }, { name: "Note", type: "ground" }, { name: "Key", type: "ground" },
  { name: "Lock", type: "ground" }, { name: "Chain", type: "ground" }, { name: "Rope", type: "ground" }, { name: "Wire", type: "ground" },
  { name: "Ball", type: "ground" }, { name: "Bat", type: "ground" }, { name: "Wicket", type: "ground" }, { name: "Stump", type: "ground" },
  { name: "Helmet", type: "ground" }, { name: "Net", type: "ground" }, { name: "Goal", type: "ground" }, { name: "Stick", type: "ground" },
  { name: "Racket", type: "ground" }, { name: "Club", type: "ground" }, { name: "Dice", type: "ground" }, { name: "Pawn", type: "ground" },
  { name: "King", type: "ground" }, { name: "Queen", type: "ground" }, { name: "Bishop", type: "ground" }, { name: "Knight", type: "ground" },
  { name: "Rook", type: "ground" }, { name: "Joker", type: "ground" }, { name: "Toy", type: "ground" }, { name: "Doll", type: "ground" },
  { name: "Robot", type: "ground" }, { name: "Lego", type: "ground" }, { name: "Block", type: "ground" }, { name: "Puzzle", type: "ground" },
  { name: "Piano", type: "ground" }, { name: "Guitar", type: "ground" }, { name: "Drum", type: "ground" }, { name: "Violin", type: "ground" },
  { name: "Flute", type: "ground" }, { name: "Trumpet", type: "ground" }, { name: "Harp", type: "ground" }, { name: "Bell", type: "ground" },
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
    ({ name, difficulty = "MEDIUM", visualHints = true, gameMode = "FUN" }) => {
      const roomId = generateRoomId();
      rooms[roomId] = {
        id: roomId,
        players: [{ id: socket.id, name, isHost: true }],
        gameState: "LOBBY",
        scores: { [socket.id]: 0 },
        lives: { [socket.id]: 3 },
        actions: {},
        history: [], // Track last few items types
        settings: { difficulty, visualHints, gameMode },
        roundCount: 0, // NEW: Track rounds for Rage Mode scaling
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
      rooms[roomId].gameState = "COUNTDOWN";
      io.to(roomId).emit("game_started", rooms[roomId].settings);

      // Start Countdown
      let count = 3;
      io.to(roomId).emit("countdown_tick", count);
      count--;

      const countdownInterval = setInterval(() => {
        // Safety check: Room might be deleted if user disconnects
        if (!rooms[roomId]) {
          clearInterval(countdownInterval);
          return;
        }

        if (count > 0) {
          io.to(roomId).emit("countdown_tick", count);
          count--;
        } else {
          clearInterval(countdownInterval);
          io.to(roomId).emit("countdown_tick", "GO!");

          if (rooms[roomId]) {
            rooms[roomId].gameState = "PLAYING";
            setTimeout(() => startRound(roomId), 1000);
          }
        }
      }, 1000);
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
  socket.on("restart_game", (roomId) => {
    const room = rooms[roomId];
    if (!room) {
      socket.emit("room_expired");
      return;
    }

    if (socket.id === room.players[0].id) { // Only Host
      room.gameState = "LOBBY";
      // Reset Scores & Lives
      Object.keys(room.scores).forEach(pid => room.scores[pid] = 0);
      Object.keys(room.lives).forEach(pid => room.lives[pid] = 3);
      room.roundCount = 0;
      room.actions = {};
      room.history = [];

      io.to(roomId).emit("game_reset");
      io.to(roomId).emit("update_players", room.players);
    }
  });

  socket.on("update_settings", ({ roomId, settings }) => {
    const room = rooms[roomId];
    if (room && socket.id === room.players[0].id) { // Only Host
      room.settings = settings;
      io.to(roomId).emit("settings_updated", settings);
    }
  });
});

function startRound(roomId) {
  const room = rooms[roomId];
  if (!room) return;

  room.actions = {};

  // BALANCED SELECTION (Normal)
  const item = getBalancedItem(room.history || []);

  room.currentItem = item;
  room.history.push(item.type);
  if (room.history.length > 5) room.history.shift();

  // DIFFICULTY LOGIC
  const diffMap = { EASY: 2000, MEDIUM: 1500, HARD: 1000 };
  let duration = diffMap[room.settings.difficulty] || 1500;

  // -- DIFFICULTY & PROGRESSION --
  room.roundCount = (room.roundCount || 0) + 1;

  if (room.settings.gameMode === "RAGE") {
    // RAGE Logic: Start at 2000ms, decrease by 50ms per round, cap at 400ms
    const baseRage = 2000;
    const speedup = room.roundCount * 50;
    duration = Math.max(400, baseRage - speedup);
  } else {
    // FUN / Classic Logic
    // Speed up slightly as score increases (original logic)
    const maxScore = Math.max(...Object.values(room.scores));
    const decrease = Math.floor(maxScore / 5) * 100;
    duration = Math.max(600, duration - decrease);
  }

  io.to(roomId).emit("new_round", {
    item,
    duration,
    roundCount: room.roundCount,
    gameMode: room.settings.gameMode
  });

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
    room.gameState = "GAMEOVER";
    return;
  } else if (survivors.length === 1 && room.players.length > 1) {
    // Winner declared (if multiplayer)
    io.to(roomId).emit("game_over", { winner: survivors[0] });
    room.gameState = "GAMEOVER";
    return;
  }
  // Single player continues until 0 lives
  else if (room.players.length === 1 && survivors.length === 0) {
    io.to(roomId).emit("game_over", { winner: null });
    room.gameState = "GAMEOVER";
    return;
  }

  // Next Round
  setTimeout(() => startRound(roomId), 1000);
}

// Handle React Routing, return all requests to React app
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../dist', 'index.html'));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
