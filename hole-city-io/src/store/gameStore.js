import { create } from 'zustand';
import { GAME_DURATION, OBJECT_COUNT } from '../utils/constants';
import { generateObjects, generateBots, createObject } from '../utils/helpers';
import { playSound, playExplosion } from '../utils/audio';
import { gameState } from '../utils/gameState';

export const useStore = create((set, get) => ({
  // Oyun Durumu
  gameStatus: 'lobby', 
  playerName: 'Guest',
  lastWinner: '---', // Bu odanın (FFA-1) son kazananı
  
  // Global Duyurular (Diğer odalar)
  globalAnnouncements: [],
  isHallOfFameOpen: false, // New: Onur Tablosu

  // Standart State
  score: 0,
  holeScale: 1,
  timeLeft: GAME_DURATION,
  isGameOver: false,
  gameOverReason: '',
  objects: [],
  bots: [],
  objectsToRemove: new Set(),
  bombHitTime: 0,
  chatMessages: [],

  // İlk Yükleme
  initGame: () => {
    set({
      objects: generateObjects(),
      bots: generateBots(),
      timeLeft: GAME_DURATION,
      chatMessages: [{ id: 1, sender: 'System', text: 'Welcome to WHOLECITY FFA!', color: '#ffff00' }],
      isHallOfFameOpen: false
    });
  },

  toggleHallOfFame: (isOpen) => set({ isHallOfFameOpen: isOpen }),

  // Oyuncunun Odaya Girişi
  joinGame: (name) => {
    gameState.playerScale = 1;
    gameState.playerPos.set(0, 0, 0); 
    
    set({
      gameStatus: 'playing',
      playerName: name || 'Guest',
      score: 0,
      holeScale: 1,
      isGameOver: false,
      bombHitTime: 0,
    });
  },

  // Lobiye Dönüş
  returnToLobby: () => set({
    gameStatus: 'lobby',
    isGameOver: false
  }),

  // Tur Bittiğinde Reset
  resetRound: () => {
    const state = get();
    
    const allPlayers = [
      { name: state.playerName, score: state.score, active: state.gameStatus === 'playing' },
      ...state.bots
    ];
    const winner = allPlayers.sort((a, b) => b.score - a.score)[0];
    
    set({
      lastWinner: winner.name,
      objects: generateObjects(),
      bots: generateBots(),
      timeLeft: GAME_DURATION,
      isGameOver: false,
      score: 0,
      holeScale: 1,
      gameStatus: 'lobby',
      objectsToRemove: new Set()
    });
  },

  // Global Olay Simülasyonu (Dışarıdan çağrılacak)
  addGlobalAnnouncement: (text) => set(state => ({
    globalAnnouncements: [
      { id: Date.now(), text, color: '#4ade80' }, // Yeşil
      ...state.globalAnnouncements
    ].slice(0, 3) // Sadece en yeni 3 tanesini tut
  })),

  addMessage: (sender, text, color = '#fff') => set((state) => {
    const newMsg = { id: Date.now() + Math.random(), sender, text, color };
    return { chatMessages: [...state.chatMessages.slice(-14), newMsg] };
  }),

  endGame: (reason) => set({ isGameOver: true, gameOverReason: reason }),

  tick: () => set((state) => {
    if (state.timeLeft <= 1) {
      get().resetRound();
      return { timeLeft: GAME_DURATION };
    }
    return { timeLeft: state.timeLeft - 1 };
  }),

  addPlayerScore: (pts, objId) => {
    playSound(500);
    set((state) => {
      const newScore = state.score + pts;
      const newScale = 1 + newScore * 0.0004;
      gameState.playerScale = newScale;
      const newRemove = new Set(state.objectsToRemove);
      newRemove.add(objId);
      return { score: newScore, holeScale: newScale, objectsToRemove: newRemove };
    });
  },

  addBotScore: (botId, pts, objId) => {
    set((state) => {
      const newRemove = new Set(state.objectsToRemove);
      newRemove.add(objId);
      const newBots = state.bots.map((b) => {
        if (b.id === botId) {
          const newScore = b.score + pts;
          const newScale = 1 + newScore * 0.0004;
          if (gameState.bots[botId]) {
            gameState.bots[botId].scale = newScale;
          }
          return { ...b, score: newScore, scale: newScale };
        }
        return b;
      });
      return { bots: newBots, objectsToRemove: newRemove };
    });
  },

  applyBombPenalty: (entityId) => {
    playExplosion();
    set((state) => {
       if (entityId === 'player') {
          const newScore = Math.floor(state.score * 0.6);
          const newScale = Math.max(1, 1 + newScore * 0.0004);
          gameState.playerScale = newScale;
          return { 
            score: newScore, 
            holeScale: newScale, 
            bombHitTime: Date.now() 
          };
       }
       else {
          const newBots = state.bots.map(b => {
             if (b.id === entityId) {
                const newScore = Math.floor(b.score * 0.6);
                const newScale = Math.max(1, 1 + newScore * 0.0004);
                if (gameState.bots[entityId]) {
                   gameState.bots[entityId].scale = newScale;
                }
                return { ...b, score: newScore, scale: newScale };
             }
             return b;
          });
          return { bots: newBots };
       }
    });
  },

  eatEntity: (predatorId, preyId) => {
    set((state) => {
      const preyBot = state.bots.find((b) => b.id === preyId);
      
      if (preyBot) {
        const bonus = preyBot.score + 100;
        
        if (predatorId === 'player') {
           playSound(600);
           const newScore = state.score + bonus;
           const newScale = 1 + newScore * 0.0004;
           gameState.playerScale = newScale;
           delete gameState.bots[preyId];
           
           return {
             score: newScore,
             holeScale: newScale,
             bots: state.bots.filter((b) => b.id !== preyId)
           };
        } else {
           const newBots = state.bots.map(b => {
             if (b.id === predatorId) {
               const newScore = b.score + bonus;
               const newScale = 1 + newScore * 0.0004;
               if (gameState.bots[predatorId]) {
                 gameState.bots[predatorId].scale = newScale;
               }
               return { ...b, score: newScore, scale: newScale };
             }
             return b;
           }).filter(b => b.id !== preyId);
           
           delete gameState.bots[preyId];
           return { bots: newBots };
        }
      }
      return {};
    });
  },

  spawnNew: () => {
    set((state) => {
      if (state.objectsToRemove.size === 0) return {};
      const remaining = state.objects.filter((o) => !state.objectsToRemove.has(o.id));
      const toAdd = Math.min(state.objectsToRemove.size, OBJECT_COUNT - remaining.length);
      const newObjs = [];
      for (let i = 0; i < toAdd; i++) {
        newObjs.push(createObject());
      }
      return { objects: [...remaining, ...newObjs], objectsToRemove: new Set() };
    });
  },

  getLeaderboard: () => {
    const state = get();
    const playerEntry = state.gameStatus === 'playing' 
      ? [{ id: 'player', name: state.playerName, score: state.score, isMe: true }]
      : []; 
      
    const all = [
      ...playerEntry,
      ...state.bots.map((b) => ({ ...b, isMe: false }))
    ];
    return all.sort((a, b) => b.score - a.score).slice(0, 10);
  }
}));
