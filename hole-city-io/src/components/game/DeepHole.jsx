import { memo } from 'react';
import * as THREE from 'three';
import { HOLE_DEPTH } from '../../utils/constants';

// --- 3D DÜZ SİLİNDİR DELİK ---
const DeepHole = memo(function DeepHole({ scale, color, isPlayer }) {
  const depth = HOLE_DEPTH;
  const radius = scale;
  const segments = 10;

  return (
    <group>
      {/* Üst kenar - parlak halka */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
        <ringGeometry args={[radius * 0.92, radius * 1.1, 48]} />
        <meshStandardMaterial 
          color={isPlayer ? "#3498db" : color} 
          roughness={0.3}
          metalness={0.5}
        />
      </mesh>

      {/* Üst ağız - siyah delik girişi */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <circleGeometry args={[radius * 0.92, 48]} />
        <meshBasicMaterial color="#050505" />
      </mesh>

      {/* Deliğin iç duvarı - DÜZ SİLİNDİR */}
      <mesh position={[0, -depth / 2, 0]}>
        <cylinderGeometry args={[radius, radius, depth, 48, 1, true]} />
        <meshStandardMaterial 
          color="#0a0a0a" 
          side={THREE.BackSide}
          roughness={0.95}
          metalness={0.05}
        />
      </mesh>

      {/* Dış duvar - hafif kenar */}
      <mesh position={[0, -depth / 2, 0]}>
        <cylinderGeometry args={[radius * 1.01, radius * 1.01, depth, 48, 1, true]} />
        <meshStandardMaterial 
          color="#151515" 
          side={THREE.FrontSide}
          roughness={0.9}
        />
      </mesh>

      {/* Derinlik halkaları - düz silindir için eşit aralıklı */}
      {Array.from({ length: segments }, (_, i) => {
        const d = (i + 1) / (segments + 1);
        const brightness = Math.floor(30 - d * 25);
        return (
          <mesh key={i} rotation={[-Math.PI / 2, 0, 0]} position={[0, -depth * d, 0]}>
            <ringGeometry args={[radius * 0.93, radius * 0.97, 48]} />
            <meshBasicMaterial color={`rgb(${brightness}, ${brightness}, ${brightness})`} />
          </mesh>
        );
      })}

      {/* Dikey çizgiler */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i / 8) * Math.PI * 2;
        const x = Math.cos(angle) * radius * 0.98;
        const z = Math.sin(angle) * radius * 0.98;
        return (
          <mesh key={`line${i}`} position={[x, -depth / 2, z]}>
            <boxGeometry args={[0.05, depth, 0.05]} />
            <meshBasicMaterial color="#1a1a1a" />
          </mesh>
        );
      })}

      {/* Dip */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -depth + 0.05, 0]}>
        <circleGeometry args={[radius * 0.98, 48]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
    </group>
  );
});

export default DeepHole;
