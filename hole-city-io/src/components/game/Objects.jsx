import { memo, useMemo } from 'react';
import { Box, Cylinder, Sphere, Cone } from '@react-three/drei';
import * as THREE from 'three';

// --- İNSAN ---
export const Human = memo(function Human({ color, size }) {
  return (
    <group scale={size}>
      {/* Gövde */}
      <mesh position={[0, 0.25, 0]}>
        <boxGeometry args={[0.2, 0.25, 0.1]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Kafa */}
      <mesh position={[0, 0.45, 0]}>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#f1c27d" />
      </mesh>
      {/* Bacaklar */}
      <mesh position={[-0.05, 0.06, 0]}>
        <boxGeometry args={[0.06, 0.12, 0.06]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[0.05, 0.06, 0]}>
        <boxGeometry args={[0.06, 0.12, 0.06]} />
        <meshStandardMaterial color="#333" />
      </mesh>
    </group>
  );
});

// --- KÖPEK ---
export const Dog = memo(function Dog({ size }) {
  return (
    <group scale={size}>
      {/* Gövde */}
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[0.15, 0.12, 0.3]} />
        <meshStandardMaterial color="#8d6e63" />
      </mesh>
      {/* Kafa */}
      <mesh position={[0, 0.25, 0.15]}>
        <boxGeometry args={[0.12, 0.12, 0.12]} />
        <meshStandardMaterial color="#8d6e63" />
      </mesh>
      {/* Kulaklar */}
      <mesh position={[-0.05, 0.32, 0.15]}>
        <boxGeometry args={[0.03, 0.05, 0.03]} />
        <meshStandardMaterial color="#5d4037" />
      </mesh>
      <mesh position={[0.05, 0.32, 0.15]}>
        <boxGeometry args={[0.03, 0.05, 0.03]} />
        <meshStandardMaterial color="#5d4037" />
      </mesh>
      {/* Kuyruk */}
      <mesh position={[0, 0.2, -0.15]} rotation={[0.5, 0, 0]}>
        <boxGeometry args={[0.03, 0.1, 0.03]} />
        <meshStandardMaterial color="#5d4037" />
      </mesh>
    </group>
  );
});

// --- AĞAÇ ---
export const Tree = memo(function Tree({ size }) {
  return (
    <group scale={size}>
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 0.4, 6]} />
        <meshStandardMaterial color="#5d4037" />
      </mesh>
      <mesh position={[0, 0.5, 0]}>
        <coneGeometry args={[0.4, 0.6, 8]} />
        <meshStandardMaterial color="#2d6a4f" />
      </mesh>
      <mesh position={[0, 0.8, 0]}>
        <coneGeometry args={[0.3, 0.5, 8]} />
        <meshStandardMaterial color="#40916c" />
      </mesh>
    </group>
  );
});

// --- ARABA ---
export const Car = memo(function Car({ color, size }) {
  return (
    <group scale={size}>
      <mesh position={[0, 0.15, 0]}>
        <boxGeometry args={[0.9, 0.2, 0.4]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[-0.05, 0.3, 0]}>
        <boxGeometry args={[0.5, 0.15, 0.35]} />
        <meshStandardMaterial color="#333" roughness={0.2} />
      </mesh>
      {[
        [-0.25, 0.08, 0.2], [0.25, 0.08, 0.2],
        [-0.25, 0.08, -0.2], [0.25, 0.08, -0.2]
      ].map((pos, i) => (
        <mesh key={i} position={pos} rotation={[Math.PI/2, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.05, 8]} />
          <meshStandardMaterial color="#111" />
        </mesh>
      ))}
      <mesh position={[0.46, 0.18, 0.12]}>
        <boxGeometry args={[0.02, 0.06, 0.08]} />
        <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0.46, 0.18, -0.12]}>
        <boxGeometry args={[0.02, 0.06, 0.08]} />
        <meshStandardMaterial color="#fff" emissive="#fff" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[-0.46, 0.18, 0.12]}>
        <boxGeometry args={[0.02, 0.06, 0.08]} />
        <meshStandardMaterial color="#ff0000" />
      </mesh>
      <mesh position={[-0.46, 0.18, -0.12]}>
        <boxGeometry args={[0.02, 0.06, 0.08]} />
        <meshStandardMaterial color="#ff0000" />
      </mesh>
    </group>
  );
});

// --- OTOBÜS ---
export const Bus = memo(function Bus({ color, size }) {
  return (
    <group scale={size}>
      <mesh position={[0, 0.3, 0]}>
        <boxGeometry args={[1.6, 0.5, 0.5]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[1.62, 0.2, 0.52]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      {[
        [-0.5, 0.1, 0.25], [0.5, 0.1, 0.25],
        [-0.5, 0.1, -0.25], [0.5, 0.1, -0.25]
      ].map((pos, i) => (
        <mesh key={i} position={pos} rotation={[Math.PI/2, 0, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.1, 12]} />
          <meshStandardMaterial color="#111" />
        </mesh>
      ))}
    </group>
  );
});

// --- BİNA ---
export const Building = memo(function Building({ color, size }) {
  return (
    <group scale={size}>
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[0.8, 1.0, 0.8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0, 1.02, 0]}>
        <boxGeometry args={[0.85, 0.05, 0.85]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[0, 0.15, 0.41]}>
        <planeGeometry args={[0.2, 0.3]} />
        <meshStandardMaterial color="#222" />
      </mesh>
      <mesh position={[0, 0.6, 0]}>
         <boxGeometry args={[0.82, 0.6, 0.82]} />
         <meshStandardMaterial color="#add8e6" roughness={0.1} metalness={0.5} opacity={0.8} transparent />
      </mesh>
    </group>
  );
});

// --- BASİT MODELLER ---
export const Trash = memo(({ size }) => (
  <group scale={size}>
    <mesh position={[0, 0.25, 0]}>
      <cylinderGeometry args={[0.15, 0.12, 0.5, 8]} />
      <meshStandardMaterial color="silver" metalness={0.6} roughness={0.4} />
    </mesh>
  </group>
));

export const Lamp = memo(({ size }) => (
  <group scale={size}>
    <mesh position={[0, 0.75, 0]}>
      <cylinderGeometry args={[0.03, 0.05, 1.5, 6]} />
      <meshStandardMaterial color="#2c3e50" />
    </mesh>
    <mesh position={[0.15, 1.4, 0]}>
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshStandardMaterial color="#f1c40f" emissive="#f1c40f" emissiveIntensity={0.8} />
    </mesh>
  </group>
));

export const Bench = memo(({ size }) => (
  <group scale={size}>
    <mesh position={[0, 0.15, 0]}>
      <boxGeometry args={[0.8, 0.05, 0.3]} />
      <meshStandardMaterial color="#8d6e63" />
    </mesh>
    <mesh position={[-0.3, 0.07, 0]}>
      <boxGeometry args={[0.05, 0.15, 0.25]} />
      <meshStandardMaterial color="#3e2723" />
    </mesh>
    <mesh position={[0.3, 0.07, 0]}>
      <boxGeometry args={[0.05, 0.15, 0.25]} />
      <meshStandardMaterial color="#3e2723" />
    </mesh>
  </group>
));

export const TrafficCone = memo(({ size }) => (
  <group scale={size}>
    <mesh position={[0, 0.25, 0]}>
      <coneGeometry args={[0.15, 0.5, 16]} />
      <meshStandardMaterial color="#ff6b6b" />
    </mesh>
    <mesh position={[0, 0.02, 0]}>
      <boxGeometry args={[0.3, 0.05, 0.3]} />
      <meshStandardMaterial color="#333" />
    </mesh>
  </group>
));

export const Hydrant = memo(({ size }) => (
  <group scale={size}>
    <mesh position={[0, 0.2, 0]}>
      <cylinderGeometry args={[0.1, 0.12, 0.4, 8]} />
      <meshStandardMaterial color="#e74c3c" />
    </mesh>
    <mesh position={[0, 0.45, 0]}>
      <sphereGeometry args={[0.1, 8, 8]} />
      <meshStandardMaterial color="#e74c3c" />
    </mesh>
    <mesh position={[0.12, 0.35, 0]} rotation={[0, 0, -0.5]}>
      <cylinderGeometry args={[0.04, 0.04, 0.1, 8]} />
      <meshStandardMaterial color="#bdc3c7" />
    </mesh>
  </group>
));

export const Tower = memo(({ size }) => (
  <group scale={size}>
    <mesh position={[0, 1.5, 0]}>
      <boxGeometry args={[0.8, 3.0, 0.8]} />
      <meshStandardMaterial color="#34495e" />
    </mesh>
    <mesh position={[0, 3.2, 0]}>
      <coneGeometry args={[0.6, 1.0, 4]} />
      <meshStandardMaterial color="#2c3e50" />
    </mesh>
    {[0.5, 1.5, 2.5].map((y, i) => (
      <mesh key={i} position={[0, y, 0.41]}>
        <planeGeometry args={[0.4, 0.6]} />
        <meshStandardMaterial color="#f1c40f" emissive="#f1c40f" emissiveIntensity={0.2} />
      </mesh>
    ))}
  </group>
));

export const ModelComponents = {
  human: Human,
  dog: Dog,
  cone: TrafficCone,
  hydrant: Hydrant,
  trash: Trash,
  tree: Tree,
  lamp: Lamp,
  bench: Bench,
  car: Car,
  taxi: ({size}) => <Car size={size} color="#f1c40f" />,
  bus: Bus,
  building: Building,
  tower: Tower
};
