import { useEffect, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useStore } from '../../store/gameStore';
import { MAP_SIZE } from '../../utils/constants';
import Roads from './Roads';
import Spawner from './Spawner';
import PlayerHole from './PlayerHole';
import BotHole from './BotHole';
import GameObject from './GameObject';

function SpectatorCamera() {
  const { camera } = useThree();
  
  useFrame(() => {
    // İzleyici Kamerası: Haritanın ortasında dönüyor
    const time = Date.now() * 0.0001;
    const radius = 80;
    camera.position.x = Math.sin(time) * radius;
    camera.position.z = Math.cos(time) * radius;
    camera.position.y = 60;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

function Scene() {
  const objects = useStore((s) => s.objects);
  const bots = useStore((s) => s.bots);
  const gameStatus = useStore((s) => s.gameStatus); // 'lobby' or 'playing'

  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[50, 80, 50]} intensity={0.9} />

      {/* Çim (En altta) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.15, 0]}>
        <planeGeometry args={[MAP_SIZE + 80, MAP_SIZE + 80]} />
        <meshBasicMaterial 
          color="#4a7c59"
          stencilWrite={true}
          stencilRef={1}
          stencilFunc={THREE.NotEqualStencilFunc}
          stencilFail={THREE.KeepStencilOp}
          stencilZFail={THREE.KeepStencilOp}
          stencilZPass={THREE.KeepStencilOp}
        />
      </mesh>

      {/* Kaldırım (Çimin üstünde) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]}>
        <planeGeometry args={[MAP_SIZE, MAP_SIZE]} />
        <meshBasicMaterial 
          color="#8e9196" 
          stencilWrite={true}
          stencilRef={1}
          stencilFunc={THREE.NotEqualStencilFunc}
          stencilFail={THREE.KeepStencilOp}
          stencilZFail={THREE.KeepStencilOp}
          stencilZPass={THREE.KeepStencilOp}
        />
      </mesh>

      <Roads />
      <Spawner />
      
      {/* Oyun durumuna göre PlayerHole veya Kamera */}
      {gameStatus === 'playing' ? <PlayerHole /> : <SpectatorCamera />}

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
