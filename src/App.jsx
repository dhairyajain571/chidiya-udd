
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
  'Chidiya': '🐦', 'Tota': '🦜', 'Maina': '🐧', 'Kabootar': '🕊',
  'Cheel': '🦅', 'Kauwa': '🦅', 'Makkhi': '🪰', 'Machchar': '🦟',
  'Titli': '🦋', 'Ullu': '🦉', 'Bat': '🦇', 'Dragonfly': '🐉',
  'Plane': '✈️', 'Rocket': '🚀', 'Helicopter': '🚁', 'Drone': '🛸',
  'Kite': '🪁', 'Balloon': '🎈', 'Superman': '🦸', 'UFO': '🛸',
  'Haathi': '🐘', 'Ghoda': '🐎', 'Sher': '🦁', 'Kutta': '🐕',
  'Billi': '🐈', 'Chuha': '🐀', 'Gaay': '🐄', 'Bhains': '🐃',
  'Bhalu': '🐻', 'Khargosh': '🐇', 'Bandar': '🐒', 'Oont': '🐫',
  'Car': '🚗', 'Bus': '🚌', 'Truck': '🚛', 'Bike': '🏍',
  'Train': '🚂', 'Ship': '🚢', 'Table': '🪑', 'Chair': '🪑',
  'Laptop': '💻', 'Phone': '📱', 'Shoe': '👟', 'House': '🏠',
  'Tree': '🌲', 'Mountain': '⛰'
};

function MainGame() {
  const socket = useSocket();
  
  // UI State
  const [view, setView] = useState('JOIN'); // JOIN, LOBBY, GAME, GAMEOVER
  const [roomCode, setRoomCode] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  
  // Game State


  // ... (Correcting the Start Listener from previous step if needed, or just adding the state)
  // Actually, I need to insert the state declaration at the top level of MainGame.
  
  // (Assuming I am at line 30, updating MainGame component state)
  const [players, setPlayers] = useState([]);
  const [currentItem, setCurrentItem] = useState(null);
  const [timerDuration, setTimerDuration] = useState(2000);
  const [scores, setScores] = useState({});
  const [lives, setLives] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [gameSettings, setGameSettings] = useState({ difficulty: 'MEDIUM', visualHints: true });


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
    });




    socket.on('new_round', ({ item, duration }) => {
      setCurrentItem(item);
      setTimerDuration(duration);
      setFeedback(null);
      // Play pop sound for new card (we need to access function, but it's defined below. 
      // React quirks. Best to move playSound out or define before effect.
      // For now, let's keep it simple and just rely on visual pop, or duplicate audio logic here briefly or Refactor.
      // PROPER FIX: Move playSound outside component or use useCallback.
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
                // I lost a life (Feedback already handled instantly, but if timeout happened, we need feedback here!)
                // Wait, if I timed out, I didn't press anything, so no instant feedback.
                // So we SHOULD play error if I lost a life and I didn't perform an action?
                // Or just always play error on life loss to be safe? 
                // Let's play error here ONLY if we didn't play it instantly?
                // Simpler: Just flash red here if life lost (extra warning).
                setFlashError(true);
                setTimeout(() => setFlashError(false), 500);
            } else if (newScore > oldScore) {
                // I got a point (Sound handled instantly usually)
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
  const handleCreate = () => {
    if (!name) return setError('Please enter a name');
    playSound('pop');
    socket.emit('create_room', name);
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
  }, [view, roomCode, currentItem]); // Added currentItem dependency for feedback logic 

  // --- Derived ---
  const myPlayer = players.find(p => p.id === socket?.id);
  const myLives = lives[socket?.id] ?? 3;

  return (
    <div className="app-container" onMouseDown={handleGameAction} onTouchStart={handleGameAction}>
      
      {/* RED FLASH OVERLAY */}
      {flashError && <div className="flash-error"></div>}

      {/* DEBUG OVERLAY */}
      
      {/* Header (Always Visible except Join) */}
      {view !== 'JOIN' && (
        <header className="game-header">
          <div className="badge">ROOM: {roomCode}</div>
          <div className="badge">❤ {myLives}</div>
        </header>
      )}

      {/* ERROR TOAST */}
      {error && (
        <div style={{position:'absolute', top: 60, background:'red', padding:'5px 10px', borderRadius:5, zIndex:200}}>
          {error}
        </div>
      )}

      {/* VIEWS */}
      
      {view === 'JOIN' && (
        <div className="screen">
          <h1>Chidiya <span>Udd</span></h1>
          <p className="text-mute">Multiplayer Edition</p>
          
          <div style={{width:'80%', display:'flex', flexDirection:'column', gap:'10px', marginTop:'20px'}}>
            <input placeholder="Your Name" value={name} onChange={e => setName(e.target.value)} />
            
            <div className="btn-group" style={{alignItems:'center', flexDirection:'column', gap:5}}>
               <div style={{display:'flex', gap:10, width:'100%'}}>
                   <select id="diff-select" style={{flex:1, padding:'15px', borderRadius:'12px', border:'none', background:'rgba(255,255,255,0.2)', color:'white'}}>
                       <option value="EASY">Easy</option>
                       <option value="MEDIUM">Medium</option>
                       <option value="HARD">Hard</option>
                   </select>
                   <div style={{flex:1, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(255,255,255,0.1)', borderRadius:12}}>
                       <label style={{fontSize:'0.8rem', cursor:'pointer', display:'flex', alignItems:'center', gap:5}}>
                           <input type="checkbox" id="hints-check" defaultChecked /> Show Icons
                       </label>
                   </div>
               </div>
               <button className="primary-btn" onClick={() => {
                   if (!name) return setError('Please enter a name');
                   const diff = document.getElementById('diff-select').value;
                   const hints = document.getElementById('hints-check').checked;
                   playSound('pop');
                   socket.emit('create_room', { name, difficulty: diff, visualHints: hints });
               }}>Create Room</button>
            </div>
            
            <p className="text-mute">- OR -</p>
            
            <div className="btn-group">
               <input placeholder="Code" value={roomCode} onChange={e => setRoomCode(e.target.value.toUpperCase())} style={{width:'40%'}}/>
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
             <button className="primary-btn" onClick={handleStart} style={{marginTop:20}}>START GAME</button>
          ) : (
             <p className="text-mute" style={{marginTop:20}}>Waiting for host to start...</p>
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
                 style={{animation: `shrink ${timerDuration}ms linear forwards`}}
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
          
          <p className="text-mute" style={{marginTop: 10, fontSize: '0.8rem'}}>
             Right (➡) = Fly | Left (⬅) = Ground
          </p>
          
          <div className="btn-group" style={{marginTop: 20, gap: 20}}>
              <button 
                  className="primary-btn" 
                  style={{background:'#e74c3c', color:'white', boxShadow:'0 4px 0 #c0392b'}}
                  onClick={() => handleGameAction('NOT_FLY')}
              >
                  ⬅ Ground
              </button>
              <button 
                  className="primary-btn" 
                  style={{background:'#2ecc71', color:'white', boxShadow:'0 4px 0 #27ae60'}}
                  onClick={() => handleGameAction('FLY')}
              >
                  Fly ➡
              </button>
          </div>

          {/* Leaderboard Card */}
          <div className="leaderboard-card">
             <h3>Leaderboard</h3>
             {players
                .sort((a,b) => (scores[b.id] || 0) - (scores[a.id] || 0))
                .map(p => (
                 <div key={p.id} className={`lb-item ${p.id===socket.id ? 'me':''}`}>
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
            <div style={{fontSize:'3rem', margin:'20px'}}>🏆</div>
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
