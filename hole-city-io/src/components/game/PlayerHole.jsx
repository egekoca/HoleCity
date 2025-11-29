import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../../store/gameStore';
import { gameState } from '../../utils/gameState';
import { MAP_LIMIT } from '../../utils/constants';
import DeepHole from './DeepHole';

function PlayerHole() {
  const ref = useRef();
  const { camera } = useThree();
  const holeScale = useStore((s) => s.holeScale);
  const isGameOver = useStore((s) => s.isGameOver);
  const endGame = useStore((s) => s.endGame);
  const eatBot = useStore((s) => s.eatBot);
  const bots = useStore((s) => s.bots);

  useFrame((state, dt) => {
    if (!ref.current || isGameOver) return;

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

    gameState.playerPos.set(pos.x, 0, pos.z);
    gameState.playerScale = holeScale;

    // Kamera
    const camHeight = 30 + holeScale * 6;
    const camDist = 18 + holeScale * 4;
    camera.position.lerp(new THREE.Vector3(pos.x, camHeight, pos.z + camDist), 0.05);
    camera.lookAt(pos.x, -10, pos.z);

    // Bot yeme
    for (const bot of bots) {
      const b = gameState.bots[bot.id];
      if (!b) continue;
      const dx = pos.x - b.x;
      const dz = pos.z - b.z;
      const dist = Math.sqrt(dx * dx + dz * dz);

      if (holeScale > bot.scale * 1.2 && dist < holeScale * 0.8) {
        eatBot(bot.id);
      } else if (bot.scale > holeScale * 1.2 && dist < bot.scale * 0.8) {
        endGame(bot.name + " swallowed you!");
      }
    }
  });

  return (
    <group ref={ref} position={[0, 0, 0]}>
      <Text
        position={[0, 3, 0]}
        fontSize={0.9}
        color="#fff"
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.08}
        outlineColor="#2980b9"
      >
        YOU
      </Text>
      <group scale={[holeScale, 1, holeScale]}>
        <DeepHole scale={1} color="#2980b9" isPlayer={true} />
      </group>
    </group>
  );
}

export default PlayerHole;
