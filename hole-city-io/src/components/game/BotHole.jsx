import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { useStore } from '../../store/gameStore';
import { gameState } from '../../utils/gameState';
import { MAP_SIZE, MAP_LIMIT } from '../../utils/constants';
import { rnd } from '../../utils/helpers';
import DeepHole from './DeepHole';

function BotHole({ bot }) {
  const ref = useRef();
  const target = useRef({ x: rnd(MAP_SIZE - 40), z: rnd(MAP_SIZE - 40) });
  const bots = useStore((s) => s.bots);
  const currentBot = bots.find((b) => b.id === bot.id);
  const scale = currentBot?.scale || 1;

  useEffect(() => {
    gameState.bots[bot.id] = { x: bot.x, z: bot.z, scale: 1 };
    return () => {
      delete gameState.bots[bot.id];
    };
  }, [bot.id, bot.x, bot.z]);

  useFrame((_, dt) => {
    if (!ref.current) return;

    const pos = ref.current.position;
    const tx = target.current.x;
    const tz = target.current.z;
    const dx = tx - pos.x;
    const dz = tz - pos.z;
    const dist = Math.sqrt(dx * dx + dz * dz);

    if (dist < 3) {
      target.current = { x: rnd(MAP_SIZE - 40), z: rnd(MAP_SIZE - 40) };
    } else {
      const speed = 6;
      pos.x += (dx / dist) * speed * dt;
      pos.z += (dz / dist) * speed * dt;
    }

    pos.x = THREE.MathUtils.clamp(pos.x, -MAP_LIMIT, MAP_LIMIT);
    pos.z = THREE.MathUtils.clamp(pos.z, -MAP_LIMIT, MAP_LIMIT);

    if (gameState.bots[bot.id]) {
      gameState.bots[bot.id].x = pos.x;
      gameState.bots[bot.id].z = pos.z;
      gameState.bots[bot.id].scale = scale;
    }
  });

  return (
    <group ref={ref} position={[bot.x, 0, bot.z]}>
      <Text
        position={[0, 3, 0]}
        fontSize={0.9}
        color={bot.color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.05}
        outlineColor="#000"
      >
        {bot.name}
      </Text>
      <group scale={[scale, 1, scale]}>
        <DeepHole scale={1} color={bot.color} isPlayer={false} />
      </group>
    </group>
  );
}

export default BotHole;
