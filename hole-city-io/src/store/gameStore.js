import { create } from 'zustand';
import { GAME_DURATION, OBJECT_COUNT, ROOMS, botNames } from '../utils/constants';
import { generateObjects, generateBots, createObject } from '../utils/helpers';
import { playSound, playExplosion } from '../utils/audio';
import { gameState } from '../utils/gameState';
import { supabase } from '../utils/supabase';

export const useStore = create((set, get) => ({
  // Oyun Durumu
  gameStatus: 'lobby', 
  currentRoomId: 'FFA-1',
  playerName: 'Guest',
  lastWinner: '---',
  
  // Web3 / Cüzdan
  walletAddress: null,
  isWalletConnected: false,

  // Global Duyurular ve Veriler
  globalAnnouncements: [],
  isHallOfFameOpen: false,
  honorBoardData: [], 

  // Skin
  selectedSkin: 'default',
  setSkin: (skinId) => set({ selectedSkin: skinId }),

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

  // Yardımcı: Oda zamanını hesapla
  getRoomTime: (roomId) => {
     const now = Math.floor(Date.now() / 1000);
     const room = ROOMS.find(r => r.id === roomId);
     if (!room) return 0;
     const cycle = (now + room.offset) % GAME_DURATION;
     return GAME_DURATION - cycle;
  },

  // İlk Yükleme
  initGame: () => {
    set({
      objects: generateObjects(),
      bots: generateBots(),
      timeLeft: GAME_DURATION,
      chatMessages: [{ id: 1, sender: 'System', text: 'Welcome to WHOLECITY FFA!', color: '#ffff00' }],
      isHallOfFameOpen: false
    });
    get().fetchHonorBoard();
  },

  toggleHallOfFame: (isOpen) => {
    if (isOpen) get().fetchHonorBoard();
    set({ isHallOfFameOpen: isOpen });
  },

  connectWallet: async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];
        
        await supabase
          .from('players')
          .upsert({ wallet_address: account, last_seen: new Date() }, { onConflict: 'wallet_address' });

        const savedNick = localStorage.getItem(`nick_${account}`);
        
        set({ 
          walletAddress: account, 
          isWalletConnected: true, 
          playerName: savedNick || '' 
        });

        get().fetchHonorBoard();

      } catch (error) {
        console.error("Connection Error", error);
      }
    } else {
      alert("Please install MetaMask!");
    }
  },

  saveGameResult: async () => {
     const state = get();
     if (!state.walletAddress) return;

     const { error } = await supabase
        .from('game_results')
        .insert({
           wallet_address: state.walletAddress,
           nickname: state.playerName,
           score: state.score,
           room_id: state.currentRoomId
        });
        
     if (!error) get().fetchHonorBoard();
  },

  fetchHonorBoard: async () => {
     const promises = ROOMS.map(async (room) => {
        // 1. Last Winner
        const { data: lastGame } = await supabase
           .from('game_results')
           .select('*')
           .eq('room_id', room.id)
           .order('created_at', { ascending: false })
           .limit(1);

        // 2. High Score
        const { data: highScore } = await supabase
           .from('game_results')
           .select('*')
           .eq('room_id', room.id)
           .order('score', { ascending: false })
           .limit(1);

        return {
           id: room.id,
           name: room.id,
           winner: lastGame?.[0]?.nickname || '---',
           winnerScore: lastGame?.[0]?.score || 0,
           best: highScore?.[0]?.nickname || '---',
           bestScore: highScore?.[0]?.score || 0,
        };
     });

     const results = await Promise.all(promises);
     results.sort((a, b) => a.id.localeCompare(b.id));
     
     set({ honorBoardData: results });
  },

  joinGame: (name, roomId = 'FFA-1') => {
    gameState.playerScale = 1;
    gameState.playerPos.set(0, 0, 0); 
    
    const state = get();
    if (state.walletAddress) {
       localStorage.setItem(`nick_${state.walletAddress}`, name);
    }

    const timeLeft = state.getRoomTime(roomId);

    set({
      gameStatus: 'playing',
      playerName: name || 'Guest',
      currentRoomId: roomId,
      timeLeft: timeLeft,
      score: 400,
      holeScale: 1 + 400 * 0.0005,
      isGameOver: false,
      bombHitTime: 0,
    });
  },

  returnToLobby: () => set({
    gameStatus: 'lobby',
    isGameOver: false
  }),

  resetRound: () => {
    const state = get();
    
    const allPlayers = [
      { name: state.playerName, score: state.score, active: state.gameStatus === 'playing' },
      ...state.bots
    ];
    const winner = allPlayers.sort((a, b) => b.score - a.score)[0];
    
    if (winner.active && state.walletAddress) {
        get().saveGameResult();
    }

    get().addGlobalAnnouncement(`${state.currentRoomId} WINNER: ${winner.name} [SCORE: ${winner.score.toLocaleString()}]`);

    set({
      lastWinner: winner.name,
      objects: generateObjects(),
      bots: generateBots(),
      timeLeft: GAME_DURATION,
      isGameOver: false,
      score: 400,
      holeScale: 1 + 400 * 0.0005,
      gameStatus: 'lobby',
      objectsToRemove: new Set()
    });
  },

  addGlobalAnnouncement: (text) => set(state => ({
    globalAnnouncements: [
      { id: Date.now(), text, color: '#4ade80' },
      ...state.globalAnnouncements
    ].slice(0, 3)
  })),

  addMessage: (sender, text, color = '#fff') => set((state) => {
    const newMsg = { id: Date.now() + Math.random(), sender, text, color };
    return { chatMessages: [...state.chatMessages.slice(-14), newMsg] };
  }),

  endGame: (reason) => {
    const state = get();
    if (state.gameStatus === 'playing' && state.walletAddress) {
        get().saveGameResult();
    }
    set({ isGameOver: true, gameOverReason: reason });
  },

  tick: () => {
     const state = get();
     const now = Math.floor(Date.now() / 1000);

     // 1. Mevcut Odanın Kontrolü
     const currentTimeLeft = state.getRoomTime(state.currentRoomId);
     
     if (currentTimeLeft <= 1 && state.gameStatus === 'playing' && !state.isGameOver) { 
        state.resetRound();
        return { timeLeft: GAME_DURATION };
     }

     // 2. Diğer Odaların Kontrolü (Global Duyuru ve Bot Kaydı)
     ROOMS.forEach(room => {
        if (room.id === state.currentRoomId) return;

        const cycle = (now + room.offset) % GAME_DURATION;
        if (cycle === GAME_DURATION - 1) {
           const winnerName = botNames[Math.floor(Math.random() * botNames.length)];
           const score = Math.floor(Math.random() * 220000) + 30000;
           
           supabase.from('game_results').insert({
              wallet_address: `bot_${Date.now()}_${room.id}`, 
              nickname: winnerName,
              score: score,
              room_id: room.id,
              created_at: new Date()
           }).then(() => {
              state.fetchHonorBoard();
           });

           state.addGlobalAnnouncement(`${room.id} WINNER: ${winnerName} [SCORE: ${score.toLocaleString()}]`);
        }
     });

     return { timeLeft: currentTimeLeft };
  },

  addPlayerScore: (pts, objId) => {
    playSound(500);
    set((state) => {
          const newScore = state.score + pts;
          const newScale = 1 + newScore * 0.0005;
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
          const newScale = 1 + newScore * 0.0005;
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
          const newScale = Math.max(1, 1 + newScore * 0.0005);
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
                const newScale = Math.max(1, 1 + newScore * 0.0005);
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
           const newScale = 1 + newScore * 0.0005;
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
               const newScale = 1 + newScore * 0.0005;
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
