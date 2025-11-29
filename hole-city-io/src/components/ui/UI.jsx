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

  // Zamanlayıcı
  useEffect(() => {
    if (isGameOver) return;
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [isGameOver, tick]);

  // Lider tablosu güncelleme
  useEffect(() => {
    const timer = setInterval(() => setLeaderboard(getLeaderboard()), 800);
    return () => clearInterval(timer);
  }, [getLeaderboard]);

  return (
    <>
      {/* Sol üst - Skor */}
      <div className="absolute top-4 left-4 z-10 pointer-events-none flex flex-col gap-2">
        <div className="bg-white/90 backdrop-blur rounded-xl p-3 shadow-lg">
          <div className="text-xs text-gray-500 font-bold">SKOR</div>
          <div className="text-3xl font-black text-gray-800">{score}</div>
        </div>
        <div className="bg-black/50 rounded-lg px-3 py-1">
          <span className="text-white/70 text-sm">Boyut: </span>
          <span className="text-white font-bold">{holeScale.toFixed(2)}x</span>
        </div>
      </div>

      {/* Üst orta - Süre */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 pointer-events-none">
        <div className={`bg-black/60 rounded-xl px-6 py-2 ${timeLeft < 30 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
          <span className="text-4xl font-mono font-black">{formatTime(timeLeft)}</span>
        </div>
      </div>

      {/* Sağ üst - Lider tablosu */}
      <div className="absolute top-4 right-4 bg-black/60 p-3 rounded-xl w-44 z-10 pointer-events-none">
        <div className="text-white text-xs font-bold mb-2 border-b border-white/20 pb-1">
          🏆 LİDER TABLOSU
        </div>
        {leaderboard.map((entry, i) => (
          <div
            key={entry.id}
            className={`flex justify-between text-sm ${entry.isMe ? 'text-blue-400 font-bold' : 'text-white/80'}`}
          >
            <span>{i === 0 ? '👑' : `#${i + 1}`} {entry.name}</span>
            <span>{entry.score}</span>
          </div>
        ))}
      </div>

      {/* Alt - Kontrol ipucu */}
      <div className="absolute bottom-6 w-full text-center pointer-events-none">
        <span className="bg-black/30 text-white/60 px-4 py-1 rounded-full text-sm">
          👆 HAREKET ETMEK İÇİN SÜRÜKLE
        </span>
      </div>

      {/* Oyun sonu ekranı */}
      {isGameOver && (
        <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 text-center max-w-sm mx-4 animate-pop-in">
            <div className="text-5xl mb-2">
              {gameOverReason.includes('SÜRE') ? '⏰' : '💀'}
            </div>
            <h2 className="text-2xl font-black text-gray-800 mb-1">{gameOverReason}</h2>
            <p className="text-gray-500 mb-6">Oyun Bitti</p>
            <div className="bg-blue-500 rounded-xl p-4 mb-6">
              <div className="text-blue-100 text-sm">TOPLAM SKOR</div>
              <div className="text-5xl font-black text-white">{score}</div>
            </div>
            <button
              onClick={startGame}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl text-lg active:scale-95 transition-all"
            >
              🔄 TEKRAR OYNA
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default UI;

