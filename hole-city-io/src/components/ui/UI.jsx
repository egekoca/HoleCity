import { useEffect, useState } from 'react';
import { useStore } from '../../store/gameStore';
import { formatTime } from '../../utils/helpers';

function UI() {
  const score = useStore((s) => s.score);
  const timeLeft = useStore((s) => s.timeLeft);
  const holeScale = useStore((s) => s.holeScale);
  const isGameOver = useStore((s) => s.isGameOver);
  const gameOverReason = useStore((s) => s.gameOverReason);
  const startGame = useStore((s) => s.startGame);
  const tick = useStore((s) => s.tick);
  const getLeaderboard = useStore((s) => s.getLeaderboard);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    if (isGameOver) return;
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [isGameOver, tick]);

  useEffect(() => {
    const timer = setInterval(() => setLeaderboard(getLeaderboard()), 800);
    return () => clearInterval(timer);
  }, [getLeaderboard]);

  return (
    <>
      {/* Sol üst - Skor Paneli */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none flex flex-col gap-4">
        <div className="panel-glass px-6 py-3 flex flex-col items-start bg-yellow-300 min-w-[180px]">
          <div className="text-xs font-black text-black/60 font-nunito mb-1 tracking-wider">SCORE</div>
          <div className="text-4xl text-white text-bubble drop-shadow-md">{score}</div>
        </div>
        <div className="panel-glass px-4 py-2 bg-white/90 scale-95 origin-top-left inline-flex items-center gap-2">
          <span className="text-black/70 font-bold font-nunito text-sm uppercase">Size:</span>
          <span className="text-blue-500 font-black text-xl">{holeScale.toFixed(2)}x</span>
        </div>
      </div>

      {/* Üst orta - Süre */}
      <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        <div className={`panel-glass px-8 py-3 flex flex-col items-center min-w-[160px] transition-colors duration-300 ${timeLeft < 30 ? 'bg-red-400' : 'bg-white'}`}>
          <div className="text-[10px] font-black text-black/40 mb-[-4px] tracking-widest">TIME LEFT</div>
          <span className={`text-5xl text-bubble tracking-widest ${timeLeft < 30 ? 'text-white animate-pulse' : 'text-gray-800'}`}>
            {formatTime(timeLeft)}
          </span>
        </div>
      </div>

      {/* Sağ üst - Lider Tablosu */}
      <div className="absolute top-6 right-6 z-10 pointer-events-none">
        <div className="panel-glass p-4 w-64 bg-white/95">
          <div className="flex justify-between items-center border-b-2 border-black/10 pb-2 mb-3">
            <span className="text-xs font-black text-black/70 font-nunito tracking-wider">LEADERBOARD</span>
            <span className="text-lg opacity-80">🏆</span>
          </div>
          <div className="flex flex-col gap-2">
            {leaderboard.map((entry, i) => (
              <div
                key={entry.id}
                className={`flex justify-between items-center text-sm px-3 py-1.5 rounded-lg font-bold font-nunito transition-all ${
                  entry.isMe 
                    ? 'bg-yellow-100 border-2 border-black text-black scale-105 shadow-sm' 
                    : 'text-gray-700 hover:bg-black/5'
                }`}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <span className={`w-5 text-center ${i < 3 ? 'text-lg drop-shadow-sm' : 'text-xs opacity-50'}`}>
                    {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                  </span>
                  <span className={`truncate ${entry.isMe ? 'text-black font-black' : ''}`}>
                    {entry.name}
                  </span>
                </div>
                <span className={`font-mono ${entry.isMe ? 'text-black' : 'text-gray-500'}`}>
                  {entry.score}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Alt - Kontrol İpucu */}
      <div className="absolute bottom-10 w-full text-center pointer-events-none animate-float">
        <span className="panel-glass px-8 py-3 bg-white/90 text-black font-black text-sm font-nunito tracking-wider shadow-lg backdrop-blur-md">
          👆 DRAG TO MOVE
        </span>
      </div>

      {/* Oyun Sonu Modalı */}
      {isGameOver && (
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50">
          <div className="bg-white border-[4px] border-black rounded-[32px] p-10 text-center max-w-sm mx-4 animate-pop shadow-[12px_12px_0px_rgba(0,0,0,0.4)] relative overflow-hidden transform hover:scale-105 transition-transform duration-300">
            
            {/* Dekoratif Arkaplan */}
            <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-blue-400 to-blue-300 -z-10 rounded-b-[100%] translate-y-[-40%]"></div>

            {/* İkon */}
            <div className="text-7xl mb-6 drop-shadow-xl animate-bounce mt-4">
              {gameOverReason.includes('TIME') ? '⏰' : '💀'}
            </div>

            {/* Başlık */}
            <h2 className="text-4xl text-white text-bubble mb-3 drop-shadow-[2px_2px_0_#000] tracking-wide">
              {gameOverReason.includes('TIME') ? 'TIME UP!' : 'GAME OVER'}
            </h2>
            
            {/* Sebep */}
            <p className="text-gray-700 font-bold font-nunito mb-8 text-lg px-4 leading-tight">
              {gameOverReason}
            </p>

            {/* Skor Kartı */}
            <div className="bg-yellow-50 border-2 border-black rounded-2xl p-5 mb-8 transform rotate-1 shadow-sm">
              <div className="text-yellow-700 text-xs font-black font-nunito tracking-[0.2em] mb-1 uppercase">FINAL SCORE</div>
              <div className="text-6xl text-yellow-500 text-bubble drop-shadow-sm">{score}</div>
            </div>

            {/* Buton */}
            <button
              onClick={startGame}
              className="w-full btn-3d btn-green py-5 text-xl cursor-pointer pointer-events-auto hover:-translate-y-1 hover:shadow-[0_6px_0_#000] active:translate-y-1 active:shadow-none transition-all"
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
