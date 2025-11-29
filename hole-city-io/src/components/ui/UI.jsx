import { useEffect, useState, useRef } from 'react';
import { useStore } from '../../store/gameStore';
import { formatTime } from '../../utils/helpers';
import { gameState } from '../../utils/gameState';
import { MAP_SIZE } from '../../utils/constants';

function UI() {
  const score = useStore((s) => s.score);
  const timeLeft = useStore((s) => s.timeLeft);
  const isGameOver = useStore((s) => s.isGameOver);
  const gameOverReason = useStore((s) => s.gameOverReason);
  const startGame = useStore((s) => s.startGame);
  const tick = useStore((s) => s.tick);
  const getLeaderboard = useStore((s) => s.getLeaderboard);
  const chatMessages = useStore((s) => s.chatMessages);
  const addMessage = useStore((s) => s.addMessage);
  
  const [leaderboard, setLeaderboard] = useState([]);
  const [coords, setCoords] = useState({ x: 0, z: 0 });
  const [chatInput, setChatInput] = useState('');
  const [maxScore, setMaxScore] = useState(0);
  const chatEndRef = useRef(null);

  // Timer Loop
  useEffect(() => {
    if (isGameOver) return;
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [isGameOver, tick]);

  // Leaderboard & Coords Loop
  useEffect(() => {
    const timer = setInterval(() => {
      setLeaderboard(getLeaderboard());
      const currentScore = useStore.getState().score;
      if (currentScore > maxScore) setMaxScore(currentScore);
      
      setCoords({ 
        x: Math.round(gameState.playerPos.x), 
        z: Math.round(gameState.playerPos.z) 
      });
    }, 100); // Daha akıcı minimap için 100ms
    return () => clearInterval(timer);
  }, [getLeaderboard, maxScore]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  // Bot Chat Simulation
  useEffect(() => {
    if (isGameOver) return;
    const botPhrases = ["gg", "lol", "help!", "wow", "nice one", "lag?", "team?", "nooo", "haha"];
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
  }, [isGameOver, addMessage]);

  const handleChatSubmit = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    addMessage('YOU', chatInput, '#fff');
    setChatInput('');
  };

  return (
    <>
      {/* --- TOP LEFT: STATS & MINIMAP --- */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none flex flex-col gap-2">
        {/* Stats Text */}
        <div className="text-white font-bold text-xs drop-shadow-md leading-tight font-mono bg-black/20 p-1 rounded">
          <div className="text-gray-300">Score: <span className="text-white">{score}</span></div>
          <div className="text-gray-300">Max: <span className="text-white">{Math.max(score, maxScore)}</span></div>
        </div>
        
        {/* Minimap Box */}
        <div className="relative w-28 h-28 bg-black/40 border border-white/10 rounded backdrop-blur-sm overflow-hidden">
           {/* Grid Background */}
           <div className="absolute inset-0 grid grid-cols-4 grid-rows-4">
             {[...Array(16)].map((_,i) => <div key={i} className="border-[0.5px] border-white/5"></div>)}
           </div>
           
           {/* Player Dot */}
           <div 
             className="absolute w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_4px_white] transform -translate-x-1/2 -translate-y-1/2 transition-all duration-100 ease-linear"
             style={{
               left: `${((coords.x + MAP_SIZE/2) / MAP_SIZE) * 100}%`,
               top: `${((coords.z + MAP_SIZE/2) / MAP_SIZE) * 100}%`
             }}
           />
           
           {/* Coordinates Text */}
           <div className="absolute bottom-0.5 right-1 text-[8px] text-white/50 font-mono">
             {coords.x}, {coords.z}
           </div>
        </div>
      </div>

      {/* --- TOP CENTER: ROOM INFO & TIMER --- */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none flex flex-col items-center">
        <div className="text-2xl font-black text-white tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] font-titan">
          <span className="text-blue-400">FFA-1</span>
          <span className="ml-3 text-yellow-400">[{formatTime(timeLeft)}]</span>
        </div>
      </div>

      {/* --- TOP RIGHT: LEADERBOARD --- */}
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

      {/* --- BOTTOM LEFT: CHAT --- */}
      <div className="absolute bottom-4 left-4 z-20 w-80 flex flex-col gap-2 pointer-events-auto">
        {/* Chat History */}
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
        
        {/* Chat Input */}
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
      {isGameOver && (
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

            <button
              onClick={startGame}
              className="w-full bg-green-500 hover:bg-green-400 text-white font-titan py-4 rounded-xl text-xl transition-all transform hover:-translate-y-1 shadow-[0_4px_0_#166534] active:shadow-none active:translate-y-1"
            >
              PLAY AGAIN
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default UI;
