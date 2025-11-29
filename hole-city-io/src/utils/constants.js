// --- OYUN AYARLARI ---
export const GAME_DURATION = 180;
export const MAP_SIZE = 220;
export const MAP_LIMIT = MAP_SIZE / 2 - 5;
export const OBJECT_COUNT = 450;
export const BOT_COUNT = 8;
export const HOLE_DEPTH = 50;
export const HOLE_EXPANSION = 2.0;
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
  building: ['#95a5a6', '#7f8c8d', '#bdc3c7']
};

// Nesne tipleri ve ağırlıkları
export const objectTypes = [
  { type: 'human', weight: 50, points: 10, size: 0.5 }, // Weight artırıldı
  { type: 'dog', weight: 15, points: 8, size: 0.4 },
  { type: 'cone', weight: 20, points: 5, size: 0.3 },
  { type: 'hydrant', weight: 15, points: 12, size: 0.5 },
  { type: 'trash', weight: 15, points: 8, size: 0.4 },
  { type: 'tree', weight: 30, points: 20, size: 0.8 }, // Weight artırıldı
  { type: 'lamp', weight: 20, points: 25, size: 0.9 }, // Weight artırıldı
  { type: 'bench', weight: 15, points: 22, size: 0.7 },
  { type: 'car', weight: 12, points: 50, size: 1.2 },
  { type: 'taxi', weight: 5, points: 55, size: 1.2 },
  { type: 'bus', weight: 4, points: 100, size: 1.8 },
  { type: 'building', weight: 6, points: 200, size: 2.2 }, // Weight artırıldı
  { type: 'apartment', weight: 4, points: 350, size: 2.8 }, // Yeni
  { type: 'tower', weight: 2, points: 500, size: 4.0 }, // Weight artırıldı
  { type: 'skyscraper', weight: 1.5, points: 800, size: 5.0 }, // Yeni (Devasa)
  { type: 'bomb', weight: 0.8, points: -999, size: 2.5 } // Daha da büyük
];

export const totalWeight = objectTypes.reduce((s, t) => s + t.weight, 0);

// Bot isimleri ve renkleri
export const botNames = ['Chaos', 'Vortex', 'Titan', 'Shadow', 'Ghost', 'Venom', 'Omega', 'Hunter'];
export const botColors = ['#FF5252', '#4CAF50', '#FFC107', '#E040FB', '#00BCD4', '#FF5722', '#9C27B0', '#3F51B5'];
