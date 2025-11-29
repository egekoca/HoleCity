import { colors, objectTypes, totalWeight, OBJECT_COUNT, MAP_SIZE, BOT_COUNT, botNames, botColors, BLOCK_SIZE, ROAD_WIDTH, SIDEWALK_WIDTH } from './constants';

// Rastgele değer üretici
export const rnd = (range) => (Math.random() - 0.5) * range;
export const randomRange = (min, max) => Math.random() * (max - min) + min;

// Grid başlangıcı (Roads.jsx ile uyumlu olmalı)
const GRID_START = -MAP_SIZE / 2;

// Koordinatın en yakın yola mesafesini hesapla
function getDistToRoad(coord) {
  const relative = coord - GRID_START;
  // Hangi grid çizgisine yakınız?
  const gridIndex = Math.round(relative / BLOCK_SIZE);
  // O grid çizgisinin gerçek koordinatı
  const gridCoord = GRID_START + gridIndex * BLOCK_SIZE;
  // Mesafe
  return Math.abs(coord - gridCoord);
}

// En yakın grid merkezini bul (Bina için)
function getNearestBlockCenter(coord) {
  const relative = coord - GRID_START;
  // Hangi aralıktayız?
  const blockIndex = Math.floor(relative / BLOCK_SIZE);
  // Blok merkezi: Başlangıç + index*boyut + yarım boyut
  return GRID_START + blockIndex * BLOCK_SIZE + BLOCK_SIZE / 2;
}

// En yakın yol koordinatını bul (Araç için)
function getNearestRoadCoord(coord) {
  const relative = coord - GRID_START;
  const gridIndex = Math.round(relative / BLOCK_SIZE);
  return GRID_START + gridIndex * BLOCK_SIZE;
}

// Nesne tipi seçici
function getRandomType(category) {
  let filtered = objectTypes;
  if (category === 'building') {
    filtered = objectTypes.filter(t => ['building', 'tower'].includes(t.type));
  } else if (category === 'road') {
    filtered = objectTypes.filter(t => ['car', 'taxi', 'bus'].includes(t.type));
  } else if (category === 'sidewalk') {
    filtered = objectTypes.filter(t => ['human', 'dog', 'trash', 'hydrant', 'cone'].includes(t.type));
  } else if (category === 'decoration') {
    filtered = objectTypes.filter(t => ['tree', 'lamp', 'bench'].includes(t.type));
  }
  
  const total = filtered.reduce((s, t) => s + t.weight, 0);
  let r = Math.random() * total;
  for (const t of filtered) {
    r -= t.weight;
    if (r <= 0) return t;
  }
  return filtered[0];
}

export function createObject(forceType = null, overrideX = null, overrideZ = null) {
  let x = overrideX !== null ? overrideX : rnd(MAP_SIZE - 20);
  let z = overrideZ !== null ? overrideZ : rnd(MAP_SIZE - 20);
  
  // Mesafeleri hesapla
  const distX = getDistToRoad(x);
  const distZ = getDistToRoad(z);
  
  const roadThreshold = ROAD_WIDTH / 2;
  const sidewalkThreshold = (ROAD_WIDTH / 2) + SIDEWALK_WIDTH;

  let category = 'sidewalk';
  
  // --- YOL (ARAÇ) ---
  if (distX < roadThreshold || distZ < roadThreshold) {
    if (overrideX === null) {
        // Rastgele üretimde araç yoğunluğunu azalt (%15)
        if (Math.random() > 0.15) {
           category = Math.random() > 0.5 ? 'sidewalk' : 'decoration';
           // Yoldan uzaklaştır (Kaldırıma at)
           // X yolundaysak (distX küçük), Z yönünde değil X yönünde kaldırıma itmeliyiz? 
           // Hayır, X yolundaysak yol dikey (Z boyunca) gidiyor. X koordinatını değiştirmeliyiz.
           if (distX < roadThreshold) {
              // Yolun sağına veya soluna at
              const sign = Math.random() > 0.5 ? 1 : -1;
              x = getNearestRoadCoord(x) + sign * (roadThreshold + 2 + Math.random() * 3);
           } else {
              const sign = Math.random() > 0.5 ? 1 : -1;
              z = getNearestRoadCoord(z) + sign * (roadThreshold + 2 + Math.random() * 3);
           }
        } else {
           category = 'road';
           // Yola tam oturt
           if (distX < roadThreshold) x = getNearestRoadCoord(x);
           if (distZ < roadThreshold) z = getNearestRoadCoord(z);
        }
    } else {
        category = 'road';
    }
  } 
  // --- KALDIRIM ---
  else if (distX < sidewalkThreshold || distZ < sidewalkThreshold) {
    category = Math.random() > 0.5 ? 'decoration' : 'sidewalk';
  } 
  // --- BİNA ---
  else {
    category = 'building';
  }

  const selected = forceType ? objectTypes.find(t => t.type === forceType) : getRandomType(category);
  
  // --- GÜVENLİK KONTROLLERİ ---
  
  // 1. Bina yolda olmasın
  if (['building', 'tower'].includes(selected.type)) {
     const currentDistX = getDistToRoad(x);
     const currentDistZ = getDistToRoad(z);
     
     if (currentDistX < sidewalkThreshold || currentDistZ < sidewalkThreshold) {
       // En yakın blok merkezine taşı
       x = getNearestBlockCenter(x);
       z = getNearestBlockCenter(z);
     }
  }
  
  // 2. Araç yolda olsun
  let direction = null;
  if (['car', 'taxi', 'bus'].includes(selected.type)) {
    const dX = getDistToRoad(x);
    const dZ = getDistToRoad(z);
    
    // Eğer araç yoldan saptıysa (yukarıdaki kaldırıma atma işleminden sonra tipi değişmediyse)
    if (dX >= roadThreshold && dZ >= roadThreshold) {
        // En yakın yola çek
        if (dX < dZ) {
            x = getNearestRoadCoord(x);
            direction = { x: 0, z: 1 };
        } else {
            z = getNearestRoadCoord(z);
            direction = { x: 1, z: 0 };
        }
    } else {
        // Zaten yolda, yön belirle
        if (dX < roadThreshold) {
            direction = { x: 0, z: 1 }; // Dikey yol
        } else {
            direction = { x: 1, z: 0 }; // Yatay yol
        }
    }
  }

  return {
    id: Math.random().toString(36).substr(2, 9),
    x,
    z,
    type: selected.type,
    points: selected.points,
    size: selected.size,
    color: colors[selected.type]?.[Math.floor(Math.random() * (colors[selected.type]?.length || 1))] || '#888',
    direction, 
    speed: direction ? (Math.random() * 5 + 5) * (Math.random() > 0.5 ? 1 : -1) : 0
  };
}

export function generateObjects() {
  const objects = [];
  
  // 1. Binaları yerleştir
  // Grid çizgileri üzerinde döngü
  for (let x = GRID_START; x < MAP_SIZE/2; x += BLOCK_SIZE) {
    for (let z = GRID_START; z < MAP_SIZE/2; z += BLOCK_SIZE) {
      if (Math.random() > 0.3) { 
        // Blok merkezi = Grid çizgisi + yarım blok
        const centerX = x + BLOCK_SIZE / 2;
        const centerZ = z + BLOCK_SIZE / 2;
        
        // Hafif rastgelelik (blok içinde)
        const building = createObject('building', centerX + rnd(5), centerZ + rnd(5));
        objects.push(building);
      }
    }
  }
  
  // 2. Diğer nesneler
  const remainingCount = OBJECT_COUNT - objects.length;
  for (let i = 0; i < remainingCount; i++) {
    objects.push(createObject());
  }
  
  return objects;
}

export function generateBots() {
  return botNames.slice(0, BOT_COUNT).map((name, i) => ({
    id: `bot_${i}`,
    name,
    x: rnd(MAP_SIZE - 50),
    z: rnd(MAP_SIZE - 50),
    score: 0,
    scale: 1,
    color: botColors[i]
  }));
}

export const formatTime = (seconds) => {
  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
};
