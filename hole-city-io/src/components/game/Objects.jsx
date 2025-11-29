import { memo } from 'react';
import { Box, Cylinder, Sphere, Cone } from '@react-three/drei';

// --- İNSAN ---
export const Human = memo(function Human({ color, size }) {
  return (
    <group scale={size}>
      <Cylinder args={[0.12, 0.14, 0.5, 8]} position={[0, 0.25, 0]}>
        <meshLambertMaterial color={color} />
      </Cylinder>
      <Sphere args={[0.14, 8, 8]} position={[0, 0.58, 0]}>
        <meshLambertMaterial color="#deb887" />
      </Sphere>
    </group>
  );
});

// --- KÖPEK ---
export const Dog = memo(function Dog({ size }) {
  return (
    <group scale={size}>
      <Box args={[0.35, 0.18, 0.16]} position={[0, 0.12, 0]}>
        <meshLambertMaterial color="#8B4513" />
      </Box>
      <Sphere args={[0.08, 6, 6]} position={[0.18, 0.18, 0]}>
        <meshLambertMaterial color="#8B4513" />
      </Sphere>
    </group>
  );
});

// --- KONİ ---
export const TrafficCone = memo(function TrafficCone({ size }) {
  return (
    <group scale={size}>
      <Cone args={[0.14, 0.35, 8]} position={[0, 0.18, 0]}>
        <meshLambertMaterial color="#e67e22" />
      </Cone>
    </group>
  );
});

// --- YANGIN MUSLUĞU ---
export const Hydrant = memo(function Hydrant({ size }) {
  return (
    <group scale={size}>
      <Cylinder args={[0.1, 0.12, 0.4, 8]} position={[0, 0.2, 0]}>
        <meshLambertMaterial color="#c0392b" />
      </Cylinder>
      <Sphere args={[0.1, 6, 6]} position={[0, 0.42, 0]}>
        <meshLambertMaterial color="#c0392b" />
      </Sphere>
    </group>
  );
});

// --- ÇÖP KUTUSU ---
export const Trash = memo(function Trash({ size }) {
  return (
    <group scale={size}>
      <Cylinder args={[0.16, 0.14, 0.4, 8]} position={[0, 0.2, 0]}>
        <meshLambertMaterial color="#27ae60" />
      </Cylinder>
    </group>
  );
});

// --- AĞAÇ ---
export const Tree = memo(function Tree({ size }) {
  return (
    <group scale={size}>
      <Cylinder args={[0.06, 0.08, 0.4, 6]} position={[0, 0.2, 0]}>
        <meshLambertMaterial color="#5d4037" />
      </Cylinder>
      <Cone args={[0.35, 0.5, 8]} position={[0, 0.6, 0]}>
        <meshLambertMaterial color="#27ae60" />
      </Cone>
      <Cone args={[0.25, 0.4, 8]} position={[0, 0.95, 0]}>
        <meshLambertMaterial color="#2ecc71" />
      </Cone>
    </group>
  );
});

// --- SOKAK LAMBASI ---
export const Lamp = memo(function Lamp({ size }) {
  return (
    <group scale={size}>
      <Cylinder args={[0.03, 0.04, 1.4, 6]} position={[0, 0.7, 0]}>
        <meshLambertMaterial color="#34495e" />
      </Cylinder>
      <Sphere args={[0.08, 6, 6]} position={[0.12, 1.35, 0]}>
        <meshLambertMaterial color="#f39c12" />
      </Sphere>
    </group>
  );
});

// --- BANK ---
export const Bench = memo(function Bench({ size }) {
  return (
    <group scale={size}>
      <Box args={[0.7, 0.05, 0.25]} position={[0, 0.22, 0]}>
        <meshLambertMaterial color="#8B4513" />
      </Box>
      <Box args={[0.7, 0.2, 0.03]} position={[0, 0.35, -0.12]}>
        <meshLambertMaterial color="#8B4513" />
      </Box>
    </group>
  );
});

// --- ARABA ---
export const Car = memo(function Car({ color, size }) {
  return (
    <group scale={size}>
      <Box args={[0.9, 0.22, 0.4]} position={[0, 0.15, 0]}>
        <meshLambertMaterial color={color} />
      </Box>
      <Box args={[0.45, 0.16, 0.38]} position={[-0.05, 0.33, 0]}>
        <meshLambertMaterial color="#1a1a2e" />
      </Box>
    </group>
  );
});

// --- TAKSİ ---
export const Taxi = memo(function Taxi({ size }) {
  return (
    <group scale={size}>
      <Box args={[0.9, 0.22, 0.4]} position={[0, 0.15, 0]}>
        <meshLambertMaterial color="#f1c40f" />
      </Box>
      <Box args={[0.45, 0.16, 0.38]} position={[-0.05, 0.33, 0]}>
        <meshLambertMaterial color="#222" />
      </Box>
    </group>
  );
});

// --- OTOBÜS ---
export const Bus = memo(function Bus({ color, size }) {
  return (
    <group scale={size}>
      <Box args={[1.6, 0.45, 0.5]} position={[0, 0.3, 0]}>
        <meshLambertMaterial color={color} />
      </Box>
    </group>
  );
});

// --- BİNA ---
export const Building = memo(function Building({ color, size }) {
  return (
    <group scale={size}>
      <Box args={[0.8, 0.9, 0.8]} position={[0, 0.45, 0]}>
        <meshLambertMaterial color={color} />
      </Box>
    </group>
  );
});

// --- KULE ---
export const Tower = memo(function Tower({ size }) {
  return (
    <group scale={size}>
      <Box args={[0.7, 4.5, 0.7]} position={[0, 2.25, 0]}>
        <meshLambertMaterial color="#34495e" />
      </Box>
      <Cylinder args={[0.02, 0.02, 0.5, 6]} position={[0, 4.75, 0]}>
        <meshLambertMaterial color="#e74c3c" />
      </Cylinder>
    </group>
  );
});

// Model seçici
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
  taxi: Taxi,
  bus: Bus,
  building: Building,
  tower: Tower
};

