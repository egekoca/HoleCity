import * as THREE from 'three';

// --- GLOBAL GAME STATE (refs for performance) ---
export const gameState = {
  playerPos: new THREE.Vector3(0, 0, 0),
  playerScale: 1,
  bots: {}
};

