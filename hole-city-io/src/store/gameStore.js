import { create } from 'zustand';
import { GAME_DURATION, OBJECT_COUNT } from '../utils/constants';
import { generateObjects, generateBots, createObject } from '../utils/helpers';
import { playSound, playExplosion } from '../utils/audio';
import { gameState } from '../utils/gameState';

export const useStore = create((set, get) => ({
  score: 0,
  holeScale: 1,
  timeLeft: GAME_DURATION,
  isGameOver: false,
  gameOverReason: '',
  objects: [],
  bots: [],
  objectsToRemove: new Set(),
  bombHitTime: 0,
  
  // Chat State
  chatMessages: [],

  startGame: () => {
    gameState.playerScale = 1;
    gameState.bots = {};
    set({
      score: 0,
      holeScale: 1,
      timeLeft: GAME_DURATION,
      isGameOver: false,
      gameOverReason: '',
      objects: generateObjects(),
      bots: generateBots(),
      objectsToRemove: new Set(),
      bombHitTime: 0,
      chatMessages: [{ id: 1, sender: 'System', text: 'Welcome to Hole City FFA!', color: '#ffff00' }]
    });
  },

  addMessage: (sender, text, color = '#fff') => set((state) => {
    const newMsg = { id: Date.now() + Math.random(), sender, text, color };
    // Son 15 mesajı tut
    return { chatMessages: [...state.chatMessages.slice(-14), newMsg] };
  }),

  endGame: (reason) => set({ isGameOver: true, gameOverReason: reason }),

  tick: () => set((state) => {
    if (state.timeLeft <= 1) {
      return { isGameOver: true, timeLeft: 0, gameOverReason: "TIME'S UP!" };
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
    const all = [
      { id: 'player', name: 'YOU', score: state.score, isMe: true },
      ...state.bots.map((b) => ({ ...b, isMe: false }))
    ];
    return all.sort((a, b) => b.score - a.score).slice(0, 10);
  }
}));
