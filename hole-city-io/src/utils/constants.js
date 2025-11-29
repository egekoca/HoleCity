// --- OYUN AYARLARI ---
export const GAME_DURATION = 180; // 3 Dakika
export const ROOM_OFFSET = 60; // Odalar arası 1 dakika fark

export const ROOMS = [
  { id: 'FFA-1', offset: 0 },
  { id: 'FFA-2', offset: ROOM_OFFSET },
  { id: 'FFA-3', offset: ROOM_OFFSET * 2 },
];

export const MAP_SIZE = 220;
export const MAP_LIMIT = MAP_SIZE / 2 - 5;
export const OBJECT_COUNT = 600; 
export const BOT_COUNT = 8;
export const HOLE_DEPTH = 50;
export const BOUNCE_DAMPING = 0.5;
export const WALL_FRICTION = 0.92;
export const GRAVITY_STRENGTH = 25;
export const CAR_SPEED = 8;

// Şehir Düzeni
export const BLOCK_SIZE = 50;
export const ROAD_WIDTH = 12;
export const SIDEWALK_WIDTH = 5;

// Renkler
export const colors = {
  human: ['#e74c3c', '#3498db', '#f1c40f', '#9b59b6', '#1abc9c'],
  car: ['#2c3e50', '#c0392b', '#2980b9', '#8e44ad'],
  bus: ['#c0392b', '#e67e22', '#27ae60'],
  building: ['#95a5a6', '#7f8c8d', '#bdc3c7'],
  apartment: ['#b0c4de', '#a9a9a9'],
  skyscraper: ['#6a5acd', '#4682b4']
};

// Nesne tipleri ve ağırlıkları
// Başlangıç nesneleri (yemler) ciddi oranda artırıldı
export const objectTypes = [
  { type: 'human', weight: 100, points: 10, size: 1.2 }, 
  { type: 'dog', weight: 40, points: 8, size: 1.0 },
  { type: 'cone', weight: 80, points: 5, size: 0.9 },
  { type: 'hydrant', weight: 50, points: 12, size: 1.1 },
  { type: 'trash', weight: 60, points: 8, size: 1.0 },
  { type: 'tree', weight: 30, points: 15, size: 1.1 }, 
  { type: 'lamp', weight: 25, points: 20, size: 1.4 },
  { type: 'bench', weight: 20, points: 18, size: 1.3 },
  
  // Araçlar
  { type: 'car', weight: 10, points: 50, size: 1.4 },
  { type: 'taxi', weight: 5, points: 55, size: 1.4 },
  { type: 'bus', weight: 3, points: 100, size: 2.0 },
  // Ara Nesne: Otobüs (Büyük)
  { type: 'double_decker', weight: 5, points: 150, size: 2.2 },
  
  // Yeni Orta Seviye Nesneler (Puanlar dengelendi)
  { type: 'kiosk', weight: 5, points: 120, size: 1.8 }, 
  { type: 'fountain', weight: 4, points: 130, size: 2.0 },

  // Binalar
  { type: 'building', weight: 6, points: 200, size: 2.2 }, 
  { type: 'apartment', weight: 4, points: 350, size: 3.0 },
  { type: 'tower', weight: 2, points: 500, size: 4.5 },
  { type: 'skyscraper', weight: 1.5, points: 800, size: 6.0 },
  // Devasa Mega Yapı (Boss)
  { type: 'colossus', weight: 0, points: 2500, size: 10.0 },
  
  // Bomba
  { type: 'bomb', weight: 3.0, points: -500, size: 2.5 } 
];

export const totalWeight = objectTypes.reduce((s, t) => s + t.weight, 0);

// Bot isimleri ve renkleri
export const botNames = ['Chaos', 'Vortex', 'Titan', 'Shadow', 'Ghost', 'Venom', 'Omega', 'Hunter'];
export const botColors = ['#FF5252', '#4CAF50', '#FFC107', '#E040FB', '#00BCD4', '#FF5722', '#9C27B0', '#3F51B5'];

// Skin Galerisi
export const SKINS = [
  { id: 'default', name: 'Classic', color: '#2980b9', type: 'standard', price: 0 },
  { id: 'red', name: 'Crimson', color: '#e74c3c', type: 'standard', price: 0 },
  { id: 'green', name: 'Emerald', color: '#2ecc71', type: 'standard', price: 0 },
  { id: 'purple', name: 'Void', color: '#9b59b6', type: 'standard', price: 0 },
  { id: 'gold', name: 'Midas', color: '#f1c40f', type: 'standard', price: 0 },
  { id: 'legendary', name: 'ZEUS', color: '#00ffff', type: 'legendary', price: 0 } // Elektrikli
];
