import { useEffect, useState, useRef } from 'react';
import { useStore } from '../../store/gameStore';
import { formatTime } from '../../utils/helpers';
import { gameState } from '../../utils/gameState';
import { MAP_SIZE } from '../../utils/constants';

function UI() {
  const score = useStore((s) => s.score);
  const timeLeft = useStore((s) => s.timeLeft);
  const isGameOver = useStore((s) => s.isGameOver);
  const gameStatus = useStore((s) => s.gameStatus);
  const gameOverReason = useStore((s) => s.gameOverReason);
  const initGame = useStore((s) => s.initGame);
  const joinGame = useStore((s) => s.joinGame);
  const returnToLobby = useStore((s) => s.returnToLobby);
  const tick = useStore((s) => s.tick);
  const getLeaderboard = useStore((s) => s.getLeaderboard);
  const chatMessages = useStore((s) => s.chatMessages);
  const addMessage = useStore((s) => s.addMessage);
  const lastWinner = useStore((s) => s.lastWinner);
  
  const [leaderboard, setLeaderboard] = useState([]);
  const [coords, setCoords] = useState({ x: 0, z: 0 });
  const [chatInput, setChatInput] = useState('');
  const [maxScore, setMaxScore] = useState(0);
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');
  const chatEndRef = useRef(null);

  // Initial Load
  useEffect(() => {
    initGame(); 
  }, [initGame]);

  // ESC Key Listener
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && gameStatus === 'playing') {
        returnToLobby();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [gameStatus, returnToLobby]);

  // Global Loop
  useEffect(() => {
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [tick]);

  // Stats Loop
  useEffect(() => {
    const timer = setInterval(() => {
      setLeaderboard(getLeaderboard());
      const currentScore = useStore.getState().score;
      if (currentScore > maxScore) setMaxScore(currentScore);
      
      setCoords({ 
        x: Math.round(gameState.playerPos.x), 
        z: Math.round(gameState.playerPos.z) 
      });
    }, 100);
    return () => clearInterval(timer);
  }, [getLeaderboard, maxScore]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Bot Chat
  useEffect(() => {
    const botPhrases = ["gg", "lol", "help!", "wow", "nice", "lag?", "team?", "nooo", "haha"];
    const timer = setInterval(() => {
      if (Math.random() > 0.7) {
        const bots = useStore.getState().bots;
        if (bots.length > 0) {
           const randomBot = bots[Math.floor(Math.random() * bots.length)];
           const randomPhrase = botPhrases[Math.floor(Math.random() * botPhrases.length)];
           addMessage(randomBot.name, randomPhrase, randomBot.color);
        }
      }
    }, 3000);
    return () => clearInterval(timer);
  }, [addMessage]);

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    addMessage(gameStatus === 'playing' ? 'YOU' : 'Guest', chatInput, '#fff');
    setChatInput('');
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setError('PLEASE ENTER A NAME!');
      setTimeout(() => setError(''), 2000);
      return;
    }
    joinGame(nickname);
  };

  return (
    <>
      {/* Error Toast */}
      {error && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[200%] z-[60] animate-bounce pointer-events-none">
          <div className="bg-red-500 text-white font-black px-6 py-3 rounded-xl shadow-lg border-2 border-black text-lg font-titan transform rotate-[-2deg]">
            ⚠️ {error}
          </div>
        </div>
      )}

      {/* --- HEADER INFO (ALWAYS VISIBLE) --- */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none flex flex-col items-center w-full">
        <div className="text-2xl font-black text-white tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] font-titan">
          <span className="text-blue-400">FFA-1</span>
          <span className="ml-3 text-yellow-400">[{formatTime(timeLeft)}]</span>
        </div>
        {lastWinner !== '---' && (
          <div className="text-green-400 font-black text-sm mt-1 drop-shadow-md bg-black/40 px-3 py-1 rounded animate-pulse">
            SON KAZANAN: {lastWinner.toUpperCase()}
          </div>
        )}
      </div>

      {/* --- LOBBY SCREEN --- */}
      {gameStatus === 'lobby' && (
        <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-auto bg-black/40 backdrop-blur-[2px]">
          <div className="bg-white rounded-lg p-1 shadow-2xl max-w-sm w-full mx-4">
            <div className="bg-white p-4 text-center border-b border-gray-200">
              <h1 className="text-5xl font-black text-black font-titan tracking-tighter">
                HOLE<span className="text-red-600">CITY</span>
              </h1>
            </div>
            
            <div className="p-6 flex flex-col gap-4">
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Nick" 
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="flex-1 border-2 border-gray-300 rounded px-3 py-2 font-bold focus:border-blue-500 focus:outline-none text-black"
                  maxLength={15}
                />
                <select className="border-2 border-gray-300 rounded px-2 py-2 font-bold text-gray-600 bg-gray-50 cursor-not-allowed">
                  <option>FFA-1</option>
                </select>
              </div>

              <button 
                onClick={handleJoin}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded text-lg shadow-[0_4px_0_#1e40af] active:shadow-none active:translate-y-1 transition-all"
              >
                Oyna
              </button>
              
              <div className="w-full bg-yellow-400 hover:bg-yellow-500 text-white font-bold py-2 rounded text-center shadow-[0_4px_0_#b45309] cursor-pointer text-sm">
                İzle / Spectate
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 font-bold mt-2">
                <label className="flex items-center gap-1"><input type="checkbox" defaultChecked readOnly /> İsim Göster</label>
                <label className="flex items-center gap-1"><input type="checkbox" defaultChecked readOnly /> Skor Göster</label>
                <label className="flex items-center gap-1"><input type="checkbox" defaultChecked readOnly /> Karanlık Tema</label>
                <label className="flex items-center gap-1"><input type="checkbox" readOnly /> Sohbet Gizle</label>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- PLAYING HUD --- */}
      {gameStatus === 'playing' && !isGameOver && (
        <>
          {/* Top Left: Stats & Minimap */}
          <div className="absolute top-4 left-4 z-10 pointer-events-none flex flex-col gap-2">
            <div className="text-white font-bold text-xs drop-shadow-md leading-tight font-mono bg-black/20 p-1 rounded">
              <div className="text-gray-300">Score: <span className="text-white">{score}</span></div>
              <div className="text-gray-300">Max: <span className="text-white">{Math.max(score, maxScore)}</span></div>
            </div>
            <div className="relative w-28 h-28 bg-black/40 border border-white/10 rounded backdrop-blur-sm overflow-hidden">
               <div className="absolute inset-0 grid grid-cols-4 grid-rows-4">
                 {[...Array(16)].map((_,i) => <div key={i} className="border-[0.5px] border-white/5"></div>)}
               </div>
               <div 
                 className="absolute w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_4px_white] transform -translate-x-1/2 -translate-y-1/2 transition-all duration-100 ease-linear"
                 style={{
                   left: `${((coords.x + MAP_SIZE/2) / MAP_SIZE) * 100}%`,
                   top: `${((coords.z + MAP_SIZE/2) / MAP_SIZE) * 100}%`
                 }}
               />
               <div className="absolute bottom-0.5 right-1 text-[8px] text-white/50 font-mono">
                 {coords.x}, {coords.z}
               </div>
            </div>
          </div>
        </>
      )}

      {/* --- LEADERBOARD (ALWAYS VISIBLE) --- */}
      <div className="absolute top-4 right-4 z-10 pointer-events-none">
        <div className="bg-black/40 backdrop-blur-sm p-2 rounded-lg min-w-[200px]">
          <div className="text-white/70 text-xs font-bold mb-1 text-center border-b border-white/10 pb-1">
            LEADERBOARD
          </div>
          <div className="flex flex-col gap-0.5">
            {leaderboard.slice(0, 10).map((entry, i) => (
              <div 
                key={entry.id} 
                className={`flex justify-between items-center text-xs px-1.5 py-0.5 rounded ${entry.isMe ? 'bg-yellow-500/20 text-yellow-300 font-bold' : 'text-white/90'}`}
              >
                <div className="flex items-center gap-2 max-w-[120px]">
                  <span className="opacity-60 w-4 text-right">{i + 1}.</span>
                  <span className="truncate">{entry.name}</span>
                </div>
                <span className="opacity-80 font-mono">{entry.score > 1000 ? (entry.score/1000).toFixed(1) + 'k' : entry.score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- CHAT (ALWAYS VISIBLE) --- */}
      <div className="absolute bottom-4 left-4 z-20 w-80 flex flex-col gap-2 pointer-events-auto">
        <div className="bg-black/40 backdrop-blur-sm rounded-lg p-2 h-40 overflow-y-auto flex flex-col gap-1 scrollbar-hide mask-image-gradient">
          {chatMessages.map((msg) => (
            <div key={msg.id} className="text-sm text-white drop-shadow-md break-words">
              <span style={{ color: msg.color }} className="font-bold mr-1">
                {msg.sender}:
              </span>
              <span className="opacity-90">{msg.text}</span>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <form onSubmit={handleChatSubmit} className="relative">
          <input 
            type="text" 
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            placeholder="Press enter to chat..."
            className="w-full bg-black/50 text-white px-3 py-2 rounded border border-white/20 focus:outline-none focus:border-white/50 text-sm placeholder-white/40 backdrop-blur-sm"
          />
        </form>
      </div>

      {/* --- GAME OVER MODAL --- */}
      {isGameOver && gameStatus === 'playing' && (
        <div className="absolute inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 animate-pop">
          <div className="bg-[#1a1a1a] border-4 border-[#333] rounded-2xl p-8 text-center max-w-md w-full mx-4 shadow-2xl relative">
            <div className="text-6xl mb-4 drop-shadow-lg">
              {gameOverReason.includes('TIME') ? '⏱️' : '💀'}
            </div>
            <h2 className="text-4xl text-white font-titan mb-2 text-shadow-lg tracking-wide">
              {gameOverReason.includes('TIME') ? 'TIME UP!' : 'GAME OVER'}
            </h2>
            <p className="text-gray-400 font-bold mb-8 text-lg">
              {gameOverReason}
            </p>
            <div className="bg-[#252525] rounded-xl p-4 mb-8 border border-white/5">
              <div className="text-gray-500 text-xs font-black tracking-widest mb-1">FINAL SCORE</div>
              <div className="text-5xl text-yellow-400 font-titan drop-shadow-md">{score}</div>
            </div>
            
            {/* Button changed to Return to Lobby */}
            <button
              onClick={returnToLobby}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-titan py-4 rounded-xl text-xl transition-all transform hover:-translate-y-1 shadow-[0_4px_0_#1e40af] active:shadow-none active:translate-y-1"
            >
              MAIN MENU
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default UI;
