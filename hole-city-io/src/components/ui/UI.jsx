import { useEffect, useState, useRef } from 'react';
import { useStore } from '../../store/gameStore';
import { formatTime } from '../../utils/helpers';
import { gameState } from '../../utils/gameState';
import { MAP_SIZE, ROOMS, SKINS } from '../../utils/constants';

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
  const addGlobalAnnouncement = useStore((s) => s.addGlobalAnnouncement);
  const globalAnnouncements = useStore((s) => s.globalAnnouncements);
  const isHallOfFameOpen = useStore((s) => s.isHallOfFameOpen);
  const toggleHallOfFame = useStore((s) => s.toggleHallOfFame);
  const honorBoardData = useStore((s) => s.honorBoardData); 
  const connectWallet = useStore((s) => s.connectWallet);
  const walletAddress = useStore((s) => s.walletAddress);
  const isWalletConnected = useStore((s) => s.isWalletConnected);
  const savedNickname = useStore((s) => s.playerName); 
  const currentRoomId = useStore((s) => s.currentRoomId);
  const selectedSkin = useStore((s) => s.selectedSkin);
  const setSkin = useStore((s) => s.setSkin);
  const settings = useStore((s) => s.settings);
  const updateSettings = useStore((s) => s.updateSettings);
  const startSpectating = useStore((s) => s.startSpectating);
  const globalHighScore = useStore((s) => s.globalHighScore);
  
  const [leaderboard, setLeaderboard] = useState([]);
  const [coords, setCoords] = useState({ x: 0, z: 0 });
  const [chatInput, setChatInput] = useState('');
  const [maxScore, setMaxScore] = useState(0);
  const [nickname, setNickname] = useState('');
  const [selectedRoom, setSelectedRoom] = useState('FFA-1'); 
  const [roomTimes, setRoomTimes] = useState({}); 
  const [error, setError] = useState('');
  const [visibleAnnouncement, setVisibleAnnouncement] = useState(null);
  const [isSkinGalleryOpen, setIsSkinGalleryOpen] = useState(false);
  const chatEndRef = useRef(null);

  // Nickname güncelleme
  useEffect(() => {
     if (savedNickname && savedNickname !== 'Guest') setNickname(savedNickname);
  }, [savedNickname]);

  // Oda sürelerini takip et
  useEffect(() => {
     const timer = setInterval(() => {
        const times = {};
        ROOMS.forEach(r => {
           times[r.id] = useStore.getState().getRoomTime(r.id);
        });
        setRoomTimes(times);
     }, 1000);
     return () => clearInterval(timer);
  }, []);

  // Initial Load
  useEffect(() => {
    initGame(); 
  }, [initGame]);

  // ESC Key Listener
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        if (gameStatus === 'playing') {
           returnToLobby();
        } else if (isHallOfFameOpen) {
           toggleHallOfFame(false);
        } else if (isSkinGalleryOpen) {
           setIsSkinGalleryOpen(false);
        }
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [gameStatus, returnToLobby, isHallOfFameOpen, toggleHallOfFame, isSkinGalleryOpen]);

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

  // Announcement Visibility Logic
  useEffect(() => {
    if (globalAnnouncements.length > 0) {
      const newest = globalAnnouncements[0];
      setVisibleAnnouncement(newest);
      const timer = setTimeout(() => {
        setVisibleAnnouncement(null);
      }, 10000); 
      return () => clearTimeout(timer);
    }
  }, [globalAnnouncements]);

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
    addMessage(gameStatus === 'playing' ? (nickname || 'YOU') : 'Guest', chatInput, '#fff');
    setChatInput('');
  };

  const handleConnect = (e) => {
      e.preventDefault();
      connectWallet();
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (!nickname.trim()) {
      setError('PLEASE ENTER A NAME!');
      setTimeout(() => setError(''), 2000);
      return;
    }
    joinGame(nickname, selectedRoom); 
  };

  const handleSpectate = () => {
    startSpectating(selectedRoom);
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

      {/* --- TOP CENTER: HEADER & GLOBAL ANNOUNCEMENTS --- */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none flex flex-col items-center w-full">
        <div className="text-2xl font-black text-white tracking-widest drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] font-titan">
          <span className="text-blue-400">{currentRoomId}</span>
          <span className="ml-3 text-yellow-400">[{formatTime(timeLeft)}]</span>
        </div>
        
        {/* GLOBAL ANNOUNCEMENT */}
        {visibleAnnouncement && (
          <div className="mt-2 text-xs font-black text-[#4ade80] drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)] tracking-wide animate-pulse bg-black/50 px-4 py-1 rounded-full border border-[#4ade80]/30">
            {visibleAnnouncement.text}
          </div>
        )}
      </div>

      {/* --- LOBBY SCREEN --- */}
      {gameStatus === 'lobby' && (
        <>
           {/* MENU (LEFT SIDE) */}
           <div className="absolute top-1/2 -translate-y-1/2 left-4 z-[60] flex flex-col gap-2 w-48 animate-pop">
              <div className="bg-white border-4 border-gray-200 rounded-2xl overflow-hidden shadow-[0_0_20px_rgba(0,0,0,0.2)] transform -rotate-1 hover:rotate-0 transition-transform duration-300">
                 <div className="p-3 bg-gray-100 border-b-4 border-gray-200 font-black text-gray-700 text-center font-titan tracking-wider text-lg">
                    MENU
                 </div>
                 <div className="p-2 flex flex-col gap-2">
                    <button 
                      onClick={() => toggleHallOfFame(true)}
                      className="w-full p-3 text-center text-gray-600 font-bold text-sm rounded-xl hover:bg-blue-50 hover:text-blue-600 transition-all duration-200 font-titan tracking-wide active:scale-95"
                    >
                        HONOR BOARD
                    </button>
                    <button 
                      onClick={() => setIsSkinGalleryOpen(true)}
                      className="w-full p-3 text-center text-gray-600 font-bold text-sm rounded-xl hover:bg-purple-50 hover:text-purple-600 transition-all duration-200 font-titan tracking-wide active:scale-95"
                    >
                        SKIN GALLERY
                    </button>
                 </div>
              </div>
           </div>

           {/* MAIN LOBBY BOX */}
           <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-auto bg-black/60 backdrop-blur-[4px]">
             <div className="bg-[#f0f0f0] rounded-3xl p-2 shadow-[0_0_50px_rgba(0,0,0,0.8)] max-w-sm w-full mx-4 border-8 border-white">
               {/* Header */}
               <div className="bg-white rounded-t-2xl p-6 text-center border-b-4 border-gray-200">
                 <h1 className="text-6xl font-black text-black font-titan tracking-tighter transform -rotate-2 drop-shadow-xl">
                   WHOLE<span className="text-[#ff3333]">CITY</span>
                 </h1>
                 {isWalletConnected && walletAddress && (
                    <div className="mt-2 text-[10px] font-bold text-gray-400 bg-gray-100 py-1 px-3 rounded-full inline-block border border-gray-200 font-mono">
                       Wallet: {walletAddress.slice(0,6)}...{walletAddress.slice(-4)}
                    </div>
                 )}
               </div>
               
               <div className="p-6 flex flex-col gap-4 bg-gray-50 rounded-b-2xl">
                 
                 {!isWalletConnected ? (
                    <button 
                      onClick={handleConnect}
                      className="w-full bg-[#f6851b] hover:bg-[#e2761b] text-white font-titan py-4 rounded-xl text-xl shadow-[0_6px_0_#cd6116] active:shadow-none active:translate-y-1.5 transition-all border-2 border-orange-400 flex items-center justify-center gap-3 group"
                    >
                      <span className="text-2xl group-hover:rotate-12 transition-transform">🦊</span> CONNECT WALLET
                    </button>
                 ) : (
                    <>
                        <div className="flex gap-2">
                            <input 
                                type="text" 
                                placeholder="Nickname" 
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                className="flex-1 border-4 border-gray-300 rounded-xl px-4 py-3 font-black text-lg focus:border-blue-500 focus:outline-none text-gray-800 placeholder-gray-400 transition-colors shadow-inner"
                                maxLength={15}
                            />
                            <select 
                               value={selectedRoom}
                               onChange={(e) => setSelectedRoom(e.target.value)}
                               className="border-4 border-gray-300 rounded-xl px-2 py-3 font-black text-gray-600 bg-gray-100 cursor-pointer focus:outline-none focus:border-blue-500"
                            >
                               {ROOMS.map(r => (
                                  <option key={r.id} value={r.id}>
                                     {r.id} [{formatTime(roomTimes[r.id] || 0)}]
                                  </option>
                               ))}
                            </select>
                        </div>

                        <button 
                            onClick={handleJoin}
                            className="w-full bg-[#3b82f6] hover:bg-[#2563eb] text-white font-titan py-4 rounded-xl text-2xl shadow-[0_6px_0_#1d4ed8] active:shadow-none active:translate-y-1.5 transition-all border-2 border-blue-400"
                        >
                            PLAY
                        </button>
                        
                        <button
                            onClick={handleSpectate}
                            className="w-full bg-[#eab308] hover:bg-[#ca8a04] text-white font-titan py-3 rounded-xl text-center text-lg shadow-[0_4px_0_#a16207] cursor-pointer active:shadow-none active:translate-y-1 transition-all border-2 border-yellow-300"
                        >
                            SPECTATE
                        </button>
                    </>
                 )}

                 <div className="grid grid-cols-2 gap-3 text-xs text-gray-700 font-bold mt-2 bg-gray-200 p-3 rounded-xl shadow-inner">
                   <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={settings.showNames} 
                        onChange={(e) => updateSettings({ showNames: e.target.checked })}
                        className="accent-blue-600 w-4 h-4" 
                      /> Show Names
                   </label>
                   <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={settings.showScore} 
                        onChange={(e) => updateSettings({ showScore: e.target.checked })}
                        className="accent-blue-600 w-4 h-4" 
                      /> Show Score
                   </label>
                   <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={settings.hideChat} 
                        onChange={(e) => updateSettings({ hideChat: e.target.checked })}
                        className="accent-blue-600 w-4 h-4" 
                      /> Hide Chat
                   </label>
                 </div>
               </div>
             </div>
           </div>

           {/* SKIN GALLERY MODAL */}
           {isSkinGalleryOpen && (
              <div className="absolute inset-0 z-[70] bg-black/80 backdrop-blur-lg flex items-center justify-center animate-pop">
                 <div className="bg-[#151515] border-4 border-[#333] rounded-3xl w-full max-w-4xl mx-4 shadow-[0_0_60px_rgba(0,0,0,0.8)] overflow-hidden relative">
                    
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#2c1e3e] to-[#1e1e2e] p-6 flex justify-between items-center border-b-4 border-[#000]/30 shadow-lg relative overflow-hidden">
                       <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 opacity-70"></div>
                       <h2 className="text-4xl font-titan text-white tracking-wider drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] transform -rotate-1">
                          <span className="text-[#d946ef]">SKIN</span> GALLERY
                       </h2>
                       <button 
                         onClick={() => setIsSkinGalleryOpen(false)}
                         className="bg-red-500 hover:bg-red-600 text-white rounded-xl w-10 h-10 flex items-center justify-center font-black text-xl shadow-[0_4px_0_#991b1b] active:shadow-none active:translate-y-1 transition-all"
                       >
                          ✕
                       </button>
                    </div>

                    {/* Grid */}
                    <div className="p-8 grid grid-cols-2 md:grid-cols-3 gap-6 bg-[#121212] max-h-[60vh] overflow-y-auto">
                       {SKINS.map((skin) => {
                          const isSelected = selectedSkin === skin.id;
                          const isLegendary = skin.type === 'legendary';
                          
                          return (
                             <div 
                                key={skin.id}
                                onClick={() => setSkin(skin.id)}
                                className={`relative bg-[#1e1e1e] rounded-2xl p-4 border-4 transition-all duration-200 cursor-pointer hover:scale-105 group
                                   ${isSelected 
                                      ? 'border-[#4ade80] shadow-[0_0_20px_rgba(74,222,128,0.3)]' 
                                      : isLegendary 
                                         ? `border-[${skin.color}] border-opacity-50 hover:border-opacity-100` 
                                         : 'border-[#333] hover:border-gray-500'
                                   }
                                `}
                                style={isLegendary && !isSelected ? { borderColor: skin.color, boxShadow: `0 0 15px ${skin.color}40` } : {}}
                             >
                                {/* Legendary Badge */}
                                {isLegendary && (
                                   <div className="absolute -top-3 -right-3 bg-yellow-500 text-black font-black text-[10px] px-2 py-1 rounded-full shadow-lg border-2 border-white z-10 animate-pulse tracking-widest">
                                      LEGENDARY
                                   </div>
                                )}
                                
                                {/* Preview Circle */}
                                <div className="aspect-square rounded-full mb-4 relative overflow-hidden shadow-inner bg-black/50 flex items-center justify-center">
                                   <div 
                                      className={`w-[70%] h-[70%] rounded-full shadow-[inset_0_-10px_20px_rgba(0,0,0,0.5)] relative
                                         ${isLegendary ? 'animate-pulse' : ''}
                                      `}
                                      style={{ 
                                         backgroundColor: skin.color,
                                         color: skin.color, 
                                         boxShadow: isLegendary ? `0 0 20px ${skin.color}, inset 0 0 20px white` : undefined
                                      }}
                                   >
                                      {isLegendary && (
                                         <div className="absolute inset-0 border-4 border-white/50 rounded-full animate-ping opacity-50"></div>
                                      )}
                                   </div>
                                </div>

                                <div className="text-center">
                                   <h3 className={`font-titan text-xl tracking-wide drop-shadow-md ${isLegendary ? 'text-transparent bg-clip-text' : 'text-white'}`}
                                       style={isLegendary ? { backgroundImage: `linear-gradient(to right, #fff, ${skin.color})`, WebkitBackgroundClip: 'text' } : {}}
                                   >
                                      {skin.name}
                                   </h3>
                                   <div className="mt-2">
                                      {isSelected ? (
                                         <span className="bg-[#4ade80] text-black font-black text-xs px-3 py-1 rounded-full">SELECTED</span>
                                      ) : (
                                         <span className="bg-gray-700 text-gray-300 font-bold text-xs px-3 py-1 rounded-full group-hover:bg-white group-hover:text-black transition-colors">SELECT</span>
                                      )}
                                   </div>
                                </div>
                             </div>
                          );
                       })}
                    </div>
                 </div>
              </div>
           )}

           {/* HALL OF FAME MODAL */}
           {isHallOfFameOpen && (
              <div className="absolute inset-0 z-[70] bg-black/80 backdrop-blur-lg flex items-center justify-center animate-pop">
                 <div className="bg-[#151515] border-4 border-[#333] rounded-3xl w-full max-w-5xl mx-4 shadow-[0_0_60px_rgba(0,0,0,0.8)] overflow-hidden relative">
                    
                    {/* Header */}
                    <div className="bg-gradient-to-r from-[#1e1e2e] to-[#2a2a3e] p-6 flex justify-between items-center border-b-4 border-[#000]/30 shadow-lg relative overflow-hidden">
                       <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-70"></div>
                       <h2 className="text-4xl font-titan text-white tracking-wider drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] transform -rotate-1">
                          <span className="text-[#fbbf24]">HONOR</span> BOARD
                       </h2>
                       <button 
                         onClick={() => toggleHallOfFame(false)}
                         className="bg-red-500 hover:bg-red-600 text-white rounded-xl w-10 h-10 flex items-center justify-center font-black text-xl shadow-[0_4px_0_#991b1b] active:shadow-none active:translate-y-1 transition-all"
                       >
                          ✕
                       </button>
                    </div>

                    {/* ALL TIME BEST SECTION */}
                    <div className="bg-[#121212] pt-8 pb-4 flex justify-center relative overflow-hidden">
                       {/* Background Glow */}
                       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-600/30 blur-[80px] rounded-full pointer-events-none animate-pulse"></div>
                       
                       <div className="relative z-10 text-center flex flex-col items-center">
                          <h3 className="text-purple-400 font-black text-lg tracking-[0.4em] mb-2 uppercase drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">
                             All Time Best
                          </h3>
                          
                          <div className="text-6xl md:text-7xl font-titan text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-yellow-400 to-yellow-600 drop-shadow-[0_4px_0_rgba(161,98,7,0.5)] transform hover:scale-105 transition-transform duration-300 mb-2">
                             {globalHighScore?.score ? globalHighScore.score.toLocaleString() : '0'}
                          </div>
                          
                          <div className="flex items-center justify-center gap-3 bg-black/40 px-6 py-2 rounded-full border border-white/10 backdrop-blur-sm">
                             <span className="text-2xl text-white font-black tracking-wide drop-shadow-md">
                                {globalHighScore?.name || '---'}
                             </span>
                          </div>
                       </div>
                    </div>

                    {/* Table */}
                    <div className="p-6 overflow-x-auto bg-[#121212] border-t border-white/5">
                       <table className="w-full border-separate border-spacing-y-2">
                          <thead>
                             <tr className="text-gray-500 text-xs font-black uppercase tracking-[0.2em]">
                                <th className="px-6 py-3 text-left">Room</th>
                                <th className="px-6 py-3 text-left">Last Winner</th>
                                <th className="px-6 py-3 text-left">High Score</th>
                                <th className="px-6 py-3 text-right">Time Left</th>
                             </tr>
                          </thead>
                          <tbody>
                             {(!honorBoardData || honorBoardData.length === 0) ? (
                                <tr><td colSpan="4" className="text-center p-4 text-gray-500 font-titan">Loading Data...</td></tr>
                             ) : (
                                honorBoardData.map((room, index) => (
                                <tr 
                                   key={index} 
                                   className="group transition-transform hover:-translate-y-1 duration-200"
                                >
                                   <td className="px-6 py-4 bg-[#1e1e1e] rounded-l-xl border-l-4 border-blue-500 group-hover:bg-[#252525] shadow-md">
                                      <span className="font-titan text-blue-400 text-lg tracking-wide">{room.name}</span>
                                   </td>
                                   <td className="px-6 py-4 bg-[#1e1e1e] group-hover:bg-[#252525] shadow-md">
                                      <div className="flex items-center gap-3">
                                         <span className="text-white font-bold text-lg drop-shadow-sm">{room.winner}</span>
                                         <span className="text-xs text-[#4ade80] font-black bg-[#4ade80]/10 px-2 py-1 rounded border border-[#4ade80]/20">
                                            {(room.winnerScore || 0).toLocaleString()}
                                         </span>
                                      </div>
                                   </td>
                                   <td className="px-6 py-4 bg-[#1e1e1e] group-hover:bg-[#252525] shadow-md">
                                      <div className="flex items-center gap-3">
                                         <span className="text-yellow-400 font-bold text-lg drop-shadow-sm">{room.best}</span>
                                         <span className="text-xs text-yellow-500 font-black bg-yellow-500/10 px-2 py-1 rounded border border-yellow-500/20">
                                            {(room.bestScore || 0).toLocaleString()}
                                         </span>
                                      </div>
                                   </td>
                                   <td className="px-6 py-4 bg-[#1e1e1e] rounded-r-xl group-hover:bg-[#252525] text-right shadow-md">
                                      <span className="font-mono text-white/80 font-bold bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
                                         {room.time}
                                      </span>
                                   </td>
                                </tr>
                             )))}
                          </tbody>
                       </table>
                    </div>
                    
                    {/* Footer */}
                    <div className="bg-[#151515] p-4 text-center border-t border-[#333]">
                       <span className="text-xs text-gray-600 font-black uppercase tracking-widest flex items-center justify-center gap-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                          Live Updates • Global Servers
                       </span>
                    </div>
                 </div>
              </div>
           )}
        </>
      )}

      {/* ... PLAYING HUD ... */}
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

      {/* ... TOP RIGHT: LAST WINNER & LEADERBOARD ... */}
      <div className="absolute top-4 right-4 z-10 pointer-events-none flex flex-col items-end gap-2">
        
        {/* LAST WINNER */}
        {lastWinner !== '---' && (
          <div className="text-yellow-400 font-black text-sm md:text-base drop-shadow-[0_3px_3px_rgba(0,0,0,0.9)] bg-black/70 px-4 py-2 rounded-lg border-2 border-yellow-500/60 tracking-wider animate-pulse mb-1 font-titan">
            WINNER: {lastWinner.toUpperCase()}
          </div>
        )}

        {/* LEADERBOARD */}
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

      {/* ... CHAT ... */}
      {!settings.hideChat && (
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
      )}

      {/* ... GAME OVER MODAL ... */}
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
