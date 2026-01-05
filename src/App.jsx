import React, { useState, useEffect, useRef } from 'react';
import './index.css';
import { useSocket, SocketProvider } from './context/SocketContext';

export default function App() {
  return (
    <SocketProvider>
      <MainGame />
    </SocketProvider>
  );
}

// Emoji Mapping for Game Items
const EMOJI_MAP = {
  // --- FLYING (UDD) ---
  'Chidiya': '🐦', 'Tota': '🦜', 'Maina': '🐦‍⬛', 'Kabootar': '🕊️',
  'Cheel': '🦅', 'Kauwa': '🐦‍⬛', 'Makkhi': '🪰', 'Machchar': '🦟',
  'Titli': '🦋', 'Ullu': '🦉', 'Bat': '🦇', 'Dragonfly': '🐉',
  'Hummingbird': '🐦', 'Eagle': '🦅', 'Vulture': '🦅', 'Hawk': '🦅',
  'Falcon': '🦅', 'Seagull': '🐦', 'Pelican': '🐦', 'Stork': '🐦',
  'Flamingo': '🦩', 'Heron': '🐦', 'Swan': '🦢', 'Duck': '🦆',
  'Goose': '🪿', 'Peacock': '🦚', 'Kingfisher': '🐦', 'Woodpecker': '🐦',
  'Robin': '🐦', 'Sparrow': '🐦', 'Crow': '🐦‍⬛', 'Raven': '🐦‍⬛',
  'Magpie': '🐦‍⬛', 'Bluejay': '🐦', 'Cardinal': '🐦', 'Goldfinch': '🐦',
  'Parrot': '🦜', 'Cockatoo': '🦜', 'Macaw': '🦜', 'Toucan': '🦜',
  'Owl': '🦉', 'Pigeon': '🐦', 'Dove': '🕊️', 'Albatross': '🐦',
  'Ostrich': '🐦', 'Penguin': '🐧',

  'Bee': '🐝', 'Wasp': '🐝', 'Hornet': '🐝', 'Bumblebee': '🐝',
  'Moth': '🦋', 'Butterfly': '🦋', 'Ladybug': '🐞', 'Beetle': '🪲',
  'Grasshopper': '🦗', 'Cricket': '🦗', 'Locust': '🦗', 'Cicada': '🪲',
  'Firefly': '🪲', 'Mosquito': '🦟', 'Fly': '🪰', 'Gnat': '🪰',

  'Plane': '✈️', 'Rocket': '🚀', 'Helicopter': '🚁', 'Drone': '🛸',
  'Kite': '🪁', 'Balloon': '🎈', 'UFO': '🛸', 'Jet': '✈️',
  'Glider': '🪁', 'Parachute': '🪂', 'Blimp': '🎈', 'Zeppelin': '🎈',
  'Satellite': '🛰️', 'Space Shuttle': '🚀', 'Fighter Jet': '✈️', 'Biplane': '🛩️',
  'Seaplane': '🛩️', 'Hang Glider': '🪁', 'Paper Plane': '✈️', 'Frisbee': '🥏',
  'Boomerang': '🪃', 'Arrow': '🏹', 'Dart': '🎯', 'Bullet': '🔫',
  'Missile': '🚀', 'Cannonball': '💣', 'Fireworks': '🎆',

  'Superman': '🦸', 'Dragon': '🐉', 'Angel': '👼', 'Fairy': '🧚',
  'Phoenix': '🦅', 'Pegasus': '🐴', 'Griffin': '🦅', 'Vampire': '🧛',
  'Witch': '🧙‍♀️', 'Ghost': '👻', 'Genie': '🧞', 'Cupid': '💘',
  'Cloud': '☁️',

  // --- GROUND (NON-UDD) ---
  'Haathi': '🐘', 'Ghoda': '🐎', 'Sher': '🦁', 'Kutta': '🐕',
  'Billi': '🐈', 'Chuha': '🐀', 'Gaay': '🐄', 'Bhains': '🐃',
  'Bhalu': '🐻', 'Khargosh': '🐇', 'Bandar': '🐒', 'Oont': '🐫',
  'Pig': '🐖', 'Sheep': '🐑', 'Goat': '🐐', 'Donkey': '🫏',
  'Mule': '🫏', 'Zebra': '🦓', 'Giraffe': '🦒', 'Rhino': '🦏',
  'Hippo': '🦛', 'Deer': '🦌', 'Moose': '🫎', 'Elk': '🫎',
  'Bison': '🦬', 'Buffalo': '🐃', 'Ox': '🐂', 'Bull': '🐂',
  'Cow': '🐄', 'Calf': '🐄', 'Lamb': '🐑', 'Tiger': '🐅',
  'Lion': '🦁', 'Panther': '🐆', 'Leopard': '🐆', 'Cheetah': '🐆',
  'Jaguar': '🐆', 'Cougar': '🐆', 'Lynx': '🐈', 'Bobcat': '🐈',
  'Wolf': '🐺', 'Fox': '🦊', 'Coyote': '🐺', 'Jackal': '🐺',
  'Hyena': '🐕', 'Bear': '🐻', 'Polar Bear': '🐻‍❄️', 'Panda': '🐼',
  'Koala': '🐨', 'Kangaroo': '🦘', 'Wallaby': '🦘', 'Wombat': '🐨',
  'Platypus': '🦆', 'Otter': '🦦', 'Badger': '🦡', 'Beaver': '🦫',
  'Raccoon': '🦝', 'Skunk': '🦨', 'Squirrel': '🐿️', 'Chipmunk': '🐿️',
  'Rat': '🐀', 'Mouse': '🐁', 'Hamster': '🐹', 'Guinea Pig': '🐹',
  'Rabbit': '🐇', 'Hare': '🐇', 'Mole': '🦡', 'Hedgehog': '🦔',
  'Porcupine': '🦔', 'Armadillo': '🦔', 'Sloth': '🦥', 'Anteater': '🐜',

  'Snake': '🐍', 'Lizard': '🦎', 'Turtle': '🐢', 'Tortoise': '🐢',
  'Crocodile': '🐊', 'Alligator': '🐊', 'Frog': '🐸', 'Toad': '🐸',
  'Salamander': '🦎', 'Newt': '🦎', 'Chameleon': '🦎', 'Gecko': '🦎',
  'Iguana': '🦎', 'Komodo Dragon': '🦎', 'Python': '🐍', 'Cobra': '🐍',

  'Fish': '🐟', 'Shark': '🦈', 'Whale': '🐋', 'Dolphin': '🐬',
  'Octopus': '🐙', 'Squid': '🦑', 'Jellyfish': '🪼', 'Starfish': '⭐',
  'Crab': '🦀', 'Lobster': '🦞', 'Shrimp': '🦐', 'Seahorse': ' hippocamp',
  'Seal': '🦭', 'Walrus': '🦭', 'Manatee': '🦭', 'Eel': '🐍',
  'Ray': '🦈', 'Coral': '🪸', 'Clam': '🐚', 'Oyster': '🦪',

  'Ant': '🐜', 'Spider': '🕷️', 'Scorpion': '🦂', 'Centipede': '🐛',
  'Millipede': '🐛', 'Worm': '🪱', 'Caterpillar': '🐛', 'Snail': '🐌',
  'Slug': '🐌', 'Tick': '🕷️', 'Flea': '🕷️', 'Louse': '🕷️',
  'Mite': '🕷️', 'Termite': '🐜', 'Cockroach': '🪳', 'Bedbug': '🪳',

  'Car': '🚗', 'Bus': '🚌', 'Truck': '🚛', 'Bike': '🏍️',
  'Train': '🚂', 'Ship': '🚢', 'Boat': '⛵', 'Submarine': ' submarines',
  'Bicycle': '🚲', 'Scooter': '🛵', 'Skateboard': '🛹', 'Rollerblades': '🛼',
  'Van': '🚐', 'Jeep': '🚙', 'Taxi': '🚕', 'Police Car': '🚓',
  'Ambulance': '🚑', 'Fire Truck': '🚒', 'Tractor': '🚜', 'Bulldozer': '🚜',
  'Crane': '🏗️', 'Tank': '🪖', 'Canoe': '🛶', 'Kayak': '🛶',
  'Raft': '🛶', 'Ferry': '⛴️', 'Yacht': '🛥️', 'Cruise Ship': '🛳️',
  'Rickshaw': '🛺', 'Cart': '🛒', 'Wheelchair': '🦽', 'Stroller': '👶',

  'Table': '🪑', 'Chair': '🪑', 'Sofa': '🛋️', 'Bed': '🛏️',
  'Desk': '🖥️', 'Cupboard': '🚪', 'Shelf': '📚', 'Lamp': '🛋️',
  'Rug': '🧶', 'Curtain': '🪟', 'Door': '🚪', 'Window': '🪟',
  'Wall': '🧱', 'Floor': '🪵', 'Ceiling': '🏠', 'Roof': '🏠',
  'Stairs': '🪜', 'Ladder': '🪜', 'Mirror': '🪞', 'Clock': '🕰️',
  'Vase': '🏺', 'Pot': '🪴', 'Pan': '🍳', 'Plate': '🍽️',
  'Bowl': '🥣', 'Cup': '☕', 'Glass': '🥛', 'Mug': '🍺',
  'Spoon': '🥄', 'Fork': '🍴', 'Knife': '🔪', 'Bottle': '🍾',
  'Can': '🥫', 'Box': '📦', 'Bag': '👜', 'Basket': '🧺',
  'Bucket': '🪣', 'Broom': '🧹', 'Mop': '🧹', 'Trash Can': '🗑️',

  'Laptop': '💻', 'Phone': '📱', 'Tablet': '📲', 'TV': '📺',
  'Radio': '📻', 'Speaker': '🔊', 'Headphones': '🎧', 'Camera': '📷',
  'Watch': '⌚', 'Calculator': '🧮', 'Remote': '📺', 'Keyboard': '⌨️',
  'Mouse': '🖱️', 'Printer': '🖨️', 'Scanner': '🖨️', 'Fan': '🪭',
  'AC': '❄️', 'Heater': '🔥', 'Fridge': '🧊', 'Oven': '🥘',
  'Toaster': '🍞', 'Blender': '🥤', 'Mixer': '🥣', 'Iron': '♨️',
  'Vacuum': '🧹', 'Drill': '🔩', 'Hammer': '🔨', 'Saw': '🪚',
  'Wrench': '🔧', 'Screwdriver': '🪛',

  'Shoe': '👟', 'Sock': '🧦', 'Shirt': '👕', 'Pant': '👖',
  'Dress': '👗', 'Skirt': '💃', 'Coat': '🧥', 'Jacket': '🧥',
  'Hat': '🧢', 'Cap': '🧢', 'Glove': '🧤', 'Scarf': '🧣',
  'Belt': '👖', 'Tie': '👔', 'Purse': '👛', 'Wallet': '👛',
  'Glasses': '👓', 'Ring': '💍', 'Necklace': '📿', 'Earring': '💎',
  'Bracelet': '⌚', 'Umbrella': '☂️', 'Comb': '💇',
  'Brush': '🖌️', 'Toothbrush': '🪥', 'Soap': '🧼', 'Towel': '🧖',

  'Tree': '🌲', 'Flower': '🌺', 'Grass': '🌱', 'Bush': '🌳',
  'Rock': '🪨', 'Stone': '🪨', 'Sand': '🏖️', 'Mud': '💩',
  'Mountain': '⛰️', 'Hill': '⛰️', 'Valley': '🏞️', 'River': '🌊',
  'Lake': '🌊', 'Pond': '🌊', 'Ocean': '🌊', 'Sea': '🌊',
  'Beach': '🏖️', 'Desert': '🌵', 'Forest': '🌲', 'Jungle': '🌴',
  'Cave': '🕳️', 'Volcano': '🌋', 'Iceberg': '🧊', 'Glacier': '🧊',
  'Rain': '🌧️', 'Snow': '❄️', 'Hail': '🌨️', 'Fog': '🌫️',

  'Apple': '🍎', 'Banana': '🍌', 'Orange': '🍊', 'Grape': '🍇',
  'Mango': '🥭', 'Lemon': '🍋', 'Lime': '🍋‍🟩', 'Peach': '🍑',
  'Pear': '🍐', 'Cherry': '🍒', 'Berry': '🍓', 'Melon': '🍈',
  'Watermelon': '🍉', 'Pineapple': '🍍', 'Coconut': '🥥', 'Kiwi Fruit': '🥝',
  'Tomato': '🍅', 'Potato': '🥔', 'Onion': '🧅', 'Garlic': '🧄',
  'Carrot': '🥕', 'Corn': '🌽', 'Pea': '🫛', 'Bean': '🫘',
  'Rice': '🍚', 'Wheat': '🌾', 'Bread': '🍞', 'Toast': '🍞',
  'Cake': '🍰', 'Pie': '🥧', 'Cookie': '🍪', 'Biscuit': '🍪',
  'Candy': '🍬', 'Chocolate': '🍫', 'Ice Cream': '🍦', 'Donut': '🍩',
  'Pizza': '🍕', 'Burger': '🍔', 'Fries': '🍟', 'Hotdog': '🌭',
  'Sandwich': '🥪', 'Soup': '🍲', 'Salad': '🥗', 'Steak': '🥩',
  'Chicken': '🍗', 'Egg': '🥚', 'Cheese': '🧀', 'Butter': '🧈',
  'Milk': '🥛', 'Juice': '🧃', 'Water': '💧', 'Soda': '🥤',
  'Tea': '☕', 'Coffee': '☕', 'Beer': '🍺', 'Wine': '🍷',

  'House': '🏠', 'Home': '🏡', 'Apartment': '🏢', 'Building': '🏢',
  'Tower': '🗼', 'Skyscraper': '🏙️', 'Castle': '🏰', 'Palace': '🕌',
  'Fort': '🏯', 'Hut': '🛖', 'Tent': '⛺', 'Igloo': '🛖',
  'Bridge': '🌉', 'Dam': '🌊', 'Road': '🛣️', 'Street': '🛣️',
  'Park': '🏞️', 'Garden': '🏡', 'Farm': '🚜', 'Zoo': '🦁',
  'School': '🏫', 'College': '🎓', 'Office': '💼', 'Shop': '🛍️',
  'Mall': '🏬', 'Market': '🏪', 'Hospital': '🏥', 'Hotel': '🏨',
  'Bank': '🏦', 'Museum': '🏛️', 'Library': '📚', 'Cinema': '🎬',
  'Stadium': '🏟️', 'Gym': '💪', 'Pool': '🏊', 'Temple': '🛕',
  'Church': '⛪', 'Mosque': '🕌', 'Factory': '🏭', 'Warehouse': '🏭',

  'Pen': '🖊️', 'Pencil': '✏️', 'Eraser': '🧼', 'Sharpener': '🔪',
  'Ruler': '📏', 'Paper': '📄', 'Book': '📖', 'Notebook': '📓',
  'File': '📁', 'Folder': '📂', 'Envelope': '✉️', 'Card': '🃏',
  'Stamp': '📮', 'Coin': '🪙', 'Note': '📝', 'Key': '🔑',
  'Lock': '🔒', 'Chain': '⛓️', 'Rope': '🪢', 'Wire': '🔌',
  'Ball': '⚽', 'Bat': '🏏', 'Wicket': '🏏', 'Stump': '🏏',
  'Helmet': '⛑️', 'Net': '🥅', 'Goal': '🥅', 'Stick': '🏒',
  'Racket': '🎾', 'Club': '⛳', 'Dice': '🎲', 'Pawn': '♟️',
  'King': '♚', 'Queen': '♛', 'Bishop': '♝', 'Knight': '♞',
  'Rook': '♜', 'Joker': '🃏', 'Toy': '🧸', 'Doll': '🎎',
  'Robot': '🤖', 'Lego': '🧱', 'Block': '🧱', 'Puzzle': '🧩',
  'Piano': '🎹', 'Guitar': '🎸', 'Drum': '🥁', 'Violin': '🎻',
  'Flute': '🎼', 'Trumpet': '🎺', 'Harp': '🎵', 'Bell': '🔔'
};

function MainGame() {
  const socket = useSocket();

  // UI State
  const [view, setView] = useState('JOIN'); // JOIN, LOBBY, GAME, GAMEOVER
  const [roomCode, setRoomCode] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  // Game State
  const [players, setPlayers] = useState([]);
  const [currentItem, setCurrentItem] = useState(null);
  const [timerDuration, setTimerDuration] = useState(2000);
  const [scores, setScores] = useState({});
  const [lives, setLives] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [gameSettings, setGameSettings] = useState({ difficulty: 'MEDIUM', visualHints: true, gameMode: 'FUN' });
  const [rageIntensity, setRageIntensity] = useState(0); // 0 to 1 for animations
  const [roundCount, setRoundCount] = useState(0); // Track rounds for visuals
  const [countdown, setCountdown] = useState(null);

  // --- Socket Listeners ---
  useEffect(() => {
    if (!socket) return;

    socket.on('connect', () => {
      console.log('Connected to server');
    });

    socket.on('room_created', (code) => {
      setRoomCode(code);
      setView('LOBBY');
      setError('');
    });

    socket.on('joined_room', (code) => {
      setRoomCode(code);
      setView('LOBBY');
      setError('');
    });

    socket.on('update_players', (list) => {
      setPlayers(list);
    });

    socket.on('game_started', (settings) => {
      if (settings) setGameSettings(settings);
      setView('GAME');
      setRoundCount(0); // Reset visual stage
    });

    socket.on('countdown_tick', (val) => {
      setCountdown(val);
      if (val === 'GO!') {
        setTimeout(() => setCountdown(null), 1000);
      }
    });

    socket.on('new_round', ({ item, duration, roundCount: serverRoundCount, gameMode }) => {
      setCurrentItem(item);
      setTimerDuration(duration);
      setFeedback(null);
      setRoundCount(serverRoundCount || 0);

      // Rage Mode Animations
      if (gameMode === 'RAGE') {
        // Intensity increases with rounds (max around 40 rounds to full rage?)
        const intensity = Math.min((serverRoundCount || 0) / 30, 1);
        setRageIntensity(intensity);
      } else {
        setRageIntensity(0);
      }
    });

    socket.on('round_result', ({ scores: newScores, lives: newLives }) => {
      setScores(newScores);
      setLives(newLives);

      if (socket?.id) {
        const oldScore = scoreRef.current[socket.id] || 0;
        const newScore = newScores[socket.id] || 0;

        const oldLives = livesRef.current[socket.id] || 3;
        const myNewLives = newLives[socket.id] ?? 3;

        if (myNewLives < oldLives) {
          setFlashError(true);
          setTimeout(() => setFlashError(false), 500);
        }
      }

      // Update refs
      scoreRef.current = newScores;
      livesRef.current = newLives;
    });

    socket.on('player_eliminated', (playerId) => {
      if (playerId === socket.id) {
        // Maybe show "Spectating" message
      }
    });

    socket.on('game_over', ({ winner }) => {
      setView('GAMEOVER');
      setFeedback({ winner });
    });

    socket.on('error', (msg) => setError(msg));

    return () => {
      socket.off('connect');
      socket.off('room_created');
      socket.off('joined_room');
      socket.off('update_players');
      socket.off('game_started');
      socket.off('new_round');
      socket.off('round_result');
      socket.off('game_over');
      socket.off('error');
    };
  }, [socket]);


  // --- Sound Synth ---
  const playSound = (type) => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    const now = ctx.currentTime;

    if (type === 'pop') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.1);
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      osc.start(now);
      osc.stop(now + 0.1);
    } else if (type === 'success') {
      // Happy ding
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.linearRampToValueAtTime(1200, now + 0.1);
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    } else if (type === 'error') {
      // Sad buzz
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, now);
      osc.frequency.linearRampToValueAtTime(100, now + 0.3);
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.3);
      osc.start(now);
      osc.stop(now + 0.3);
    }
  };

  // State refs to track changes for audio feedback
  const scoreRef = useRef({});
  const livesRef = useRef({});
  const [flashError, setFlashError] = useState(false);

  // --- Actions ---
  const createRoom = () => { // Renamed from handleCreate
    if (!name) return setError('Please enter a name');
    playSound('pop');
    socket.emit('create_room', { name, difficulty: gameSettings.difficulty, visualHints: gameSettings.visualHints, gameMode: gameSettings.gameMode });
  };

  const handleJoin = () => {
    if (!name || !roomCode) return setError('Enter name & room code');
    playSound('pop');
    socket.emit('join_room', { roomId: roomCode, playerName: name });
  };

  const handleStart = () => {
    playSound('pop');
    socket.emit('start_game', roomCode);
  };

  const handleGameAction = (actionType) => {
    if (view === 'GAME' && currentItem) {
      socket.emit('player_action', { roomId: roomCode, action: actionType });

      // --- INSTANT CLIENT FEEDBACK ---
      const isFlyItem = currentItem.type === 'fly';
      const isCorrect = (isFlyItem && actionType === 'FLY') || (!isFlyItem && actionType === 'NOT_FLY');

      if (isCorrect) {
        playSound('success');
      } else {
        playSound('error');
        setFlashError(true);
        setTimeout(() => setFlashError(false), 500);
      }
    }
  };

  // Keyboard Support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.code === 'ArrowRight' || e.code === 'Space') {
        handleGameAction('FLY');
      }
      if (e.code === 'ArrowLeft' || e.key.toLowerCase() === 'n') {
        handleGameAction('NOT_FLY');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [view, roomCode, currentItem]);

  // --- Derived ---
  const myPlayer = players.find(p => p.id === socket?.id);
  const myLives = lives[socket?.id] ?? 3;

  // Visual Journey Stages
  const getVisualStage = () => {
    // FUN MODE: Static City
    if (gameSettings.gameMode === 'FUN') return 'stage-city';

    // RAGE MODE: Progressive Journey
    if (roundCount < 5) return 'stage-ground';
    if (roundCount < 10) return 'stage-sky';
    if (roundCount < 15) return 'stage-space';
    if (roundCount < 20) return 'stage-mars';
    if (roundCount < 25) return 'stage-galaxy';
    return 'stage-void'; // The "Hell" stage where Rage Overlay lives
  };

  const currentStage = getVisualStage();

  // Background Elements
  const renderBackgroundElements = () => {
    // 1. CITY (FUN MODE)
    if (currentStage === 'stage-city') {
      return (
        <div className="bg-anim-container">
          <div className="cloud c1">☁️</div>
          <div className="cloud c2" style={{ top: '15%' }}>☁️</div>
        </div>
      );
    }

    // 2. GROUND/SKY
    if (['stage-ground', 'stage-sky'].includes(currentStage)) {
      return (
        <div className="bg-anim-container">
          <div className="cloud c1">☁️</div>
          <div className="cloud c2">☁️</div>
          <div className="cloud c3">☁️</div>
          {currentStage === 'stage-ground' && <div className="cloud" style={{ top: '50%', left: '-10%', fontSize: '2rem', animationDuration: '15s' }}>🐦</div>}
        </div>
      );
    }

    // 3. SPACE / MARS
    if (['stage-space', 'stage-mars'].includes(currentStage)) {
      // Speed up stars: 3s base, faster every round, cap at 0.5s
      const starDuration = Math.max(0.5, 3 - (roundCount * 0.05)) + 's';
      return (
        <div className="bg-anim-container">
          <div className="shooting-star s1" style={{ animationDuration: starDuration }}></div>
          <div className="shooting-star s2" style={{ animationDuration: starDuration }}></div>
          <div className="shooting-star s3" style={{ animationDuration: starDuration }}></div>
          <div className="shooting-star s4" style={{ animationDuration: starDuration }}></div>
          <div className="shooting-star s5" style={{ animationDuration: starDuration }}></div>
          <div className="planet p1"></div>
          {currentStage === 'stage-space' && <div className="planet p2"></div>}
        </div>
      );
    }

    // 4. GALAXY / VOID
    if (['stage-galaxy', 'stage-void'].includes(currentStage)) {
      // Even faster in Galaxy!
      const starDuration = Math.max(0.2, 2 - (roundCount * 0.05)) + 's';
      return (
        <div className="bg-anim-container">
          <div className="black-hole"></div>
          {/* Shooting Stars Array */}
          <div className="shooting-star s1" style={{ animationDuration: starDuration }}></div>
          <div className="shooting-star s2" style={{ animationDuration: starDuration }}></div>
          <div className="shooting-star s3" style={{ animationDuration: starDuration }}></div>
          <div className="shooting-star s4" style={{ animationDuration: starDuration }}></div>
          <div className="shooting-star s5" style={{ animationDuration: starDuration }}></div>
          <div className="shooting-star s6" style={{ animationDuration: starDuration }}></div>
          <div className="shooting-star s7" style={{ animationDuration: starDuration }}></div>
          {/* Static Stars */}
          <div className="star s1">✨</div>
          <div className="star s5">⭐</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={`app-container ${currentStage} ${gameSettings.gameMode === 'RAGE' ? 'rage-mode' : ''}`} style={{ '--rage-intensity': rageIntensity }} onMouseDown={handleGameAction} onTouchStart={handleGameAction}>

      {renderBackgroundElements()}

      {/* RED FLASH OVERLAY */}
      {flashError && <div className="flash-error"></div>}

      {/* COUNTDOWN OVERLAY */}
      {countdown && (
        <div className="countdown-overlay">
          <div key={countdown} className="countdown-text">{countdown}</div>
        </div>
      )}

      {/* Header (Always Visible except Join) */}
      {view !== 'JOIN' && (
        <header className="game-header">
          <div className="badge">ROOM: {roomCode}</div>
          <div className="badge">ROUND: {roundCount}</div>
          <div className="badge">❤ {myLives}</div>
        </header>
      )}

      {/* ERROR TOAST */}
      {error && (
        <div style={{ position: 'absolute', top: 60, background: 'red', padding: '5px 10px', borderRadius: 5, zIndex: 200 }}>
          {error}
        </div>
      )}

      {/* VIEWS */}

      {view === 'JOIN' && (
        <div className="screen">
          <h1>Chidiya <span>Udd</span></h1>
          <p className="text-mute">Multiplayer Edition</p>

          <div style={{ width: '80%', display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '20px' }}>
            <input placeholder="Your Name" value={name} onChange={e => setName(e.target.value)} />

            <div className="btn-group" style={{ alignItems: 'center', flexDirection: 'column', gap: 5 }}>
              <div className="settings-group">
                <label>Difficulty:</label>
                <div className="btn-group">
                  {['EASY', 'MEDIUM', 'HARD'].map(d => (
                    <button
                      key={d}
                      className={`settings-btn ${gameSettings.difficulty === d ? 'active' : ''}`}
                      onClick={() => setGameSettings({ ...gameSettings, difficulty: d })}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="settings-group">
                <label>Game Mode:</label>
                <div className="btn-group">
                  <button
                    className={`settings-btn ${gameSettings.gameMode === 'FUN' ? 'active' : ''}`}
                    onClick={() => setGameSettings({ ...gameSettings, gameMode: 'FUN' })}
                  >
                    😎 FUN
                  </button>
                  <button
                    className={`settings-btn rage ${gameSettings.gameMode === 'RAGE' ? 'active' : ''}`}
                    onClick={() => setGameSettings({ ...gameSettings, gameMode: 'RAGE' })}
                  >
                    🔥 RAGE
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '10px 15px', width: '100%' }}>
                <label style={{ fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                  <input type="checkbox" checked={gameSettings.visualHints} onChange={e => setGameSettings({ ...gameSettings, visualHints: e.target.checked })} /> Show Icons
                </label>
              </div>

              <button className="primary-btn" onClick={createRoom}>CREATE ROOM</button>
            </div>

            <p className="text-mute">- OR -</p>

            <div className="btn-group">
              <input placeholder="Code" value={roomCode} onChange={e => setRoomCode(e.target.value.toUpperCase())} style={{ width: '40%' }} />
              <button className="primary-btn" onClick={handleJoin}>Join</button>
            </div>
          </div>
        </div>
      )}

      {view === 'LOBBY' && (
        <div className="screen">
          <h2>Waiting Room</h2>
          <div className="player-list">
            {players.map(p => (
              <div key={p.id} className="player-item">
                <span>{p.name} {p.isHost ? '👑' : ''}</span>
                <span>{p.id === socket.id ? '(You)' : ''}</span>
              </div>
            ))}
          </div>
          {myPlayer?.isHost ? (
            <button className="primary-btn" onClick={handleStart} style={{ marginTop: 20 }}>START GAME</button>
          ) : (
            <p className="text-mute" style={{ marginTop: 20 }}>Waiting for host to start...</p>
          )}
        </div>
      )}

      {view === 'GAME' && (
        <div className="game-area">
          <div className="timer-bar">
            {/* Key ensures animation restarts on new item */}
            {currentItem && (
              <div
                key={currentItem.name + timerDuration}
                className="timer-fill"
                style={{ animation: `shrink ${timerDuration}ms linear forwards` }}
              ></div>
            )}
          </div>

          <style>{`@keyframes shrink { from { transform: scaleX(1); } to { transform: scaleX(0); } }`}</style>

          {currentItem && (
            <div className="card">
              <div className="card-icon">
                {gameSettings.visualHints ? (EMOJI_MAP[currentItem.name] || '📦') : '❓'}
              </div>
              <div className="card-text">{currentItem.name}</div>
            </div>
          )}

          <p className="text-mute" style={{ marginTop: 10, fontSize: '0.8rem' }}>
            Right (➡) = Fly | Left (⬅) = Ground
          </p>

          <div className="btn-group" style={{ marginTop: 20, gap: 20 }}>
            <button
              className="primary-btn"
              style={{ background: '#e74c3c', color: 'white', boxShadow: '0 4px 0 #c0392b' }}
              onClick={() => handleGameAction('NOT_FLY')}
            >
              ⬅ Ground
            </button>
            <button
              className="primary-btn"
              style={{ background: '#2ecc71', color: 'white', boxShadow: '0 4px 0 #27ae60' }}
              onClick={() => handleGameAction('FLY')}
            >
              Fly ➡
            </button>
          </div>

          {/* Leaderboard Card */}
          <div className="leaderboard-card">
            <h3>Leaderboard</h3>
            {players
              .sort((a, b) => (scores[b.id] || 0) - (scores[a.id] || 0))
              .map(p => (
                <div key={p.id} className={`lb-item ${p.id === socket.id ? 'me' : ''}`}>
                  <span>{lives[p.id] > 0 ? '🟢' : '💀'} {p.name}</span>
                  <b>{scores[p.id] || 0}</b>
                </div>
              ))}
          </div>
        </div>
      )}

      {view === 'GAMEOVER' && (
        <div className="screen">
          <h1>Game Over</h1>
          <div style={{ fontSize: '3rem', margin: '20px' }}>🏆</div>
          {players.length > 1 ? (
            <h2>{feedback?.winner ? `${feedback.winner.name} Won!` : 'No Winners!'}</h2>
          ) : (
            <h2>You Scored: {scores[socket.id]}</h2>
          )}
          <button className="primary-btn" onClick={() => window.location.reload()}>Play Again</button>
        </div>
      )}

    </div>
  );
}
