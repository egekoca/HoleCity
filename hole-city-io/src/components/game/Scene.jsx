import { useEffect } from 'react';
import { useStore } from '../../store/gameStore';
import { MAP_SIZE } from '../../utils/constants';
import Roads from './Roads';
import Spawner from './Spawner';
import PlayerHole from './PlayerHole';
import BotHole from './BotHole';
import GameObject from './GameObject';

function Scene() {
  const objects = useStore((s) => s.objects);
  const bots = useStore((s) => s.bots);
  const startGame = useStore((s) => s.startGame);

  useEffect(() => {
    startGame();
  }, [startGame]);

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[50, 80, 50]} intensity={0.9} />

      {/* Çim (En altta) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.15, 0]}>
        <planeGeometry args={[MAP_SIZE + 80, MAP_SIZE + 80]} />
        <meshBasicMaterial color="#4a7c59" />
      </mesh>

      {/* Kaldırım (Çimin üstünde) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[MAP_SIZE, MAP_SIZE]} />
        <meshBasicMaterial color="#8e9196" />
      </mesh>

      <Roads />
      <Spawner />
      <PlayerHole />

      {bots.map((b) => (
        <BotHole key={b.id} bot={b} />
      ))}
      
      {objects.map((o) => (
        <GameObject key={o.id} data={o} />
      ))}
    </>
  );
}

export default Scene;
