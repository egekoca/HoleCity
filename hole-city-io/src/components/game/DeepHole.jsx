import { memo } from 'react';
import * as THREE from 'three';
import { MeshWobbleMaterial } from '@react-three/drei';
import { HOLE_DEPTH } from '../../utils/constants';

// --- 3D DÜZ SİLİNDİR DELİK ---
const DeepHole = memo(function DeepHole({ scale, color, isPlayer, skinId }) {
  const depth = HOLE_DEPTH;
  const radius = scale;
  const segments = 10;

  const isLegendary = skinId === 'legendary';
  // Eğer oyuncuysa skin rengini kullan, yoksa bot rengi
  const ringColor = isLegendary ? '#00ffff' : (color || "#3498db");

  return (
    <group>
      {/* --- MASKE (Zemin ve Yolların görünmemesi için) --- */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.2, 0]} renderOrder={-999}>
        <circleGeometry args={[radius * 0.99, 64]} />
        <meshBasicMaterial
          colorWrite={false}
          depthWrite={false}
          stencilWrite={true}
          stencilRef={1}
          stencilFunc={THREE.AlwaysStencilFunc}
          stencilZPass={THREE.ReplaceStencilOp}
        />
      </mesh>

      {/* --- ÜST HALKA (SKIN BURADA) --- */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.06, 0]}>
        <ringGeometry args={[radius * 0.92, radius * 1.1, 48]} />
        
        {isLegendary ? (
           // SADECE HALKA ÜZERİNDE EFEKT (Titreme)
           <MeshWobbleMaterial 
              attach="material"
              color="#00ffff" 
              emissive="#00ffff"
              emissiveIntensity={2}
              factor={0.2} 
              speed={3} 
           />
        ) : (
           // STANDART RENK
           <meshStandardMaterial 
             color={ringColor} 
             roughness={0.3}
             metalness={0.5}
           />
        )}
      </mesh>

      {/* --- LEGENDARY EKSTRA EFEKT (SADECE YATAY HALKA) --- */}
      {/* DİKKAT: Asla cylinder kullanma, sadece ring kullan */}
      {isLegendary && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.15, 0]}>
            <ringGeometry args={[radius * 1.15, radius * 1.25, 32]} />
            <meshBasicMaterial 
              color="#e040fb" 
              transparent 
              opacity={0.6} 
              side={THREE.DoubleSide}
            />
        </mesh>
      )}

      {/* --- DELİK GÖVDESİ (STANDART) --- */}
      
      {/* 1. Siyah Ağız */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, 0]}>
        <circleGeometry args={[radius * 0.92, 48]} />
        <meshBasicMaterial color="#050505" />
      </mesh>

      {/* 2. İç Duvar (Siyah) */}
      <mesh position={[0, -depth / 2, 0]}>
        <cylinderGeometry args={[radius, radius, depth, 48, 1, true]} />
        <meshStandardMaterial 
          color="#0a0a0a" 
          side={THREE.BackSide}
          roughness={0.95}
          metalness={0.05}
        />
      </mesh>

      {/* 3. Dış Duvar (Görünmez/Koruma) */}
      <mesh position={[0, -depth / 2, 0]}>
        <cylinderGeometry args={[radius * 1.01, radius * 1.01, depth, 48, 1, true]} />
        <meshStandardMaterial 
          color="#151515" 
          side={THREE.FrontSide}
          roughness={0.9}
        />
      </mesh>

      {/* 4. Derinlik Halkaları (Gri - Standart) */}
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

      {/* 5. Dip (Siyah) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -depth + 0.05, 0]}>
        <circleGeometry args={[radius * 0.98, 48]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
    </group>
  );
});

export default DeepHole;
