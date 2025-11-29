import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../../store/gameStore';
import { gameState } from '../../utils/gameState';
import { MAP_LIMIT, SKINS } from '../../utils/constants';
import DeepHole from './DeepHole';

function PlayerHole() {
  const ref = useRef();
  const holeGroupRef = useRef();
  const cameraTarget = useRef(new THREE.Vector3(0, 0, 0)); // Smooth lookAt target
  const targetPosRef = useRef(new THREE.Vector3()); // Reusable target pos
  const targetLookAtRef = useRef(new THREE.Vector3()); // Reusable target lookAt
  const { camera } = useThree();
  
  // Re-render'a sebep olacak stateleri al
  const isGameOver = useStore((s) => s.isGameOver);
  const endGame = useStore((s) => s.endGame);
  const eatEntity = useStore((s) => s.eatEntity);
  const bots = useStore((s) => s.bots);
  const bombHitTime = useStore((s) => s.bombHitTime); 
  const selectedSkin = useStore((s) => s.selectedSkin); // Skin bilgisini al
  const skins = useStore.getState().skins; // veya constants'tan alabiliriz ama store daha temiz olur

  useFrame((state, dt) => {
    if (!ref.current || isGameOver) return;

    // Store'dan anlık scale değerini al (re-render beklemeden)
    const currentScale = useStore.getState().holeScale;

    // Scale'i doğrudan uygula (Anlık Tepki)
    if (holeGroupRef.current) {
        holeGroupRef.current.scale.set(currentScale, 1, currentScale);
    }

    const pos = ref.current.position;
    const px = state.pointer.x;
    const py = -state.pointer.y;

    if (Math.abs(px) > 0.05 || Math.abs(py) > 0.05) {
      const len = Math.sqrt(px * px + py * py);
      const speed = 12;
      pos.x += (px / len) * speed * dt;
      pos.z += (py / len) * speed * dt;
    }

    pos.x = THREE.MathUtils.clamp(pos.x, -MAP_LIMIT, MAP_LIMIT);
    pos.z = THREE.MathUtils.clamp(pos.z, -MAP_LIMIT, MAP_LIMIT);

    // --- Bomba Efekti (Titreme) ---
    const timeSinceBomb = Date.now() - bombHitTime;
    let shakeX = 0;
    let shakeZ = 0;
    
    if (timeSinceBomb < 1000) { 
       const intensity = 1 - (timeSinceBomb / 1000);
       shakeX = (Math.random() - 0.5) * intensity * 0.5;
       shakeZ = (Math.random() - 0.5) * intensity * 0.5;
    }

    gameState.playerPos.set(pos.x, 0, pos.z);
    gameState.playerScale = currentScale;

    // Kamera
    const camHeight = 30 + currentScale * 6;
    const camDist = 18 + currentScale * 4;
    
    targetPosRef.current.set(pos.x + shakeX, camHeight, pos.z + camDist + shakeZ);
    targetLookAtRef.current.set(pos.x + shakeX, -10, pos.z + shakeZ);

    const smoothFactor = 1 - Math.pow(0.001, dt);

    camera.position.lerp(targetPosRef.current, smoothFactor);
    cameraTarget.current.lerp(targetLookAtRef.current, smoothFactor);
    camera.lookAt(cameraTarget.current);

    // Bot yeme
    for (const bot of bots) {
      const b = gameState.bots[bot.id];
      if (!b) continue;
      const dx = pos.x - b.x;
      const dz = pos.z - b.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (currentScale > bot.scale * 1.2 && dist < currentScale * 0.8) {
        eatEntity('player', bot.id);
      } else if (bot.scale > currentScale * 1.2 && dist < bot.scale * 0.8) {
        endGame(bot.name + " swallowed you!");
      }
    }
  });

  const isHit = Date.now() - bombHitTime < 1000;
  const selectedSkinData = SKINS.find(s => s.id === selectedSkin);
  const baseColor = selectedSkinData ? selectedSkinData.color : "#2980b9";
  const holeColor = isHit ? "#ff0000" : baseColor; 

  return (
    <group ref={ref} position={[0, 0, 0]}>
      <Text
        position={[0, 3, 0]}
        fontSize={0.9}
        color={isHit ? "#ff0000" : "#fff"} 
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.08}
        outlineColor={isHit ? "#000" : "#2980b9"}
      >
        YOU
      </Text>
      <group ref={holeGroupRef}>
        <DeepHole scale={1} color={holeColor} isPlayer={true} skinId={selectedSkin} />
      </group>
    </group>
  );
}

export default PlayerHole;
