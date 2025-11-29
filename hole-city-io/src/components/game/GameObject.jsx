import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useStore } from '../../store/gameStore';
import { gameState } from '../../utils/gameState';
import { playSound } from '../../utils/audio';
import { GRAVITY_STRENGTH, HOLE_DEPTH, BOUNCE_DAMPING, WALL_FRICTION, CAR_SPEED, MAP_SIZE, MAP_LIMIT } from '../../utils/constants';
import { ModelComponents, Human } from './Objects';

function GameObject({ data }) {
  const ref = useRef();
  const physics = useRef({
    vx: 0, vy: 0, vz: 0,
    wx: 0, wy: 0, wz: 0,
    consumed: false,
    currentHole: null,
    bounceCount: 0,
    lastBounceTime: 0
  });

  const addPlayerScore = useStore((s) => s.addPlayerScore);
  const addBotScore = useStore((s) => s.addBotScore);

  useFrame((_, dt) => {
    if (!ref.current || physics.current.consumed) return;

    const p = physics.current;
    const pos = ref.current.position;
    const rot = ref.current.rotation;
    const objSize = data.size;
    
    // Delta time sabitleme
    const deltaTime = Math.min(dt, 0.02); 

    // ============================================
    // 0. TRAFİK VE HAREKET (SADECE ZEMİNDEYKEN)
    // ============================================
    
    // Eğer araçsa ve delik etkisinde değilse hareket et
    if (data.direction && pos.y >= 0 && Math.abs(p.vx) < 0.1 && Math.abs(p.vz) < 0.1) {
      // Hareket
      pos.x += data.direction.x * data.speed * deltaTime;
      pos.z += data.direction.z * data.speed * deltaTime;

      // Yönüne göre döndür
      if (data.direction.x !== 0) {
         rot.y = data.direction.x > 0 ? Math.PI / 2 : -Math.PI / 2;
      } else {
         rot.y = data.direction.z > 0 ? 0 : Math.PI;
      }

      // Harita sınırından dön (sonsuz trafik)
      if (pos.x > MAP_LIMIT) pos.x = -MAP_LIMIT;
      if (pos.x < -MAP_LIMIT) pos.x = MAP_LIMIT;
      if (pos.z > MAP_LIMIT) pos.z = -MAP_LIMIT;
      if (pos.z < -MAP_LIMIT) pos.z = MAP_LIMIT;
    }

    // ============================================
    // 1. DELİK TESPİTİ
    // ============================================
    let bestHole = null;
    let distToBestHole = Infinity;
    
    // Oyuncu deliği
    const pPos = gameState.playerPos;
    const pScale = gameState.playerScale;
    const distPlayer = Math.sqrt((pos.x - pPos.x)**2 + (pos.z - pPos.z)**2);
    
    if (distPlayer < pScale * 2.0) { 
      bestHole = { 
        type: 'player', 
        x: pPos.x, 
        z: pPos.z, 
        radius: pScale,
        id: 'player'
      };
      distToBestHole = distPlayer;
    }

    // Bot delikleri
    if (!bestHole) {
      for (const botId in gameState.bots) {
        const bot = gameState.bots[botId];
        if (!bot) continue;
        const distBot = Math.sqrt((pos.x - bot.x)**2 + (pos.z - bot.z)**2);
        
        if (distBot < bot.scale * 2.0) {
          bestHole = { 
            type: 'bot', 
            x: bot.x, 
            z: bot.z, 
            radius: bot.scale,
            id: botId 
          };
          distToBestHole = distBot;
          break;
        }
      }
    }

    // ============================================
    // 2. FİZİK DURUMU VE DESTEK
    // ============================================
    
    let supportFactor = 1.0; 
    let holeCenter = null;
    let holeRadius = 0;
    
    if (bestHole) {
      holeCenter = { x: bestHole.x, z: bestHole.z };
      holeRadius = bestHole.radius;
      
      const canSwallow = bestHole.radius > objSize * 0.35;
      
      if (canSwallow) {
        const distFromEdge = distToBestHole - bestHole.radius;
        const objectRadius = objSize * 0.4;
        
        if (distFromEdge < -objectRadius * 0.2) {
          supportFactor = 0.0;
        } else if (distFromEdge > objectRadius) {
          supportFactor = 1.0;
        } else {
          supportFactor = (distFromEdge + objectRadius * 0.2) / (objectRadius * 1.2);
          supportFactor = Math.pow(Math.max(0, Math.min(1, supportFactor)), 3);
        }
      }
    }

    const isFalling = supportFactor < 0.3 || pos.y < -0.1;
    
    // ============================================
    // 3. KUVVETLER
    // ============================================

    // --- YERÇEKİMİ ---
    if (pos.y > 0.01 || supportFactor < 1.0) {
       p.vy -= GRAVITY_STRENGTH * (1 - supportFactor * 0.8) * deltaTime;
    }

    // --- KENAR KAYMASI ---
    if (bestHole && supportFactor < 0.9 && supportFactor > 0.0 && pos.y > -0.5) {
      const relX = holeCenter.x - pos.x;
      const relZ = holeCenter.z - pos.z;
      const dist = Math.sqrt(relX*relX + relZ*relZ);
      const dirX = relX / dist;
      const dirZ = relZ / dist;

      const slipSpeed = 20 * (1 - supportFactor);
      p.vx += dirX * slipSpeed * deltaTime;
      p.vz += dirZ * slipSpeed * deltaTime;
      
      if (supportFactor < 0.5) {
        p.vy -= 10 * deltaTime;
      }
    }

    // --- ZEMİN TEPKİSİ ---
    if (pos.y < 0 && supportFactor > 0.0) {
      if (!isFalling) {
        const targetY = 0;
        const penetration = targetY - pos.y;
        
        const springForce = penetration * 400 * supportFactor;
        const dampingForce = p.vy * 40 * supportFactor;
        
        const totalUpForce = Math.max(0, springForce - dampingForce);
        
        p.vy += totalUpForce * deltaTime;
        
        const friction = 0.8 * supportFactor;
        p.vx *= friction;
        p.vz *= friction;
        
        p.wx *= 0.8;
        p.wz *= 0.8;
      }
    }

    // --- HAREKET ---
    pos.x += p.vx * deltaTime;
    pos.y += p.vy * deltaTime;
    pos.z += p.vz * deltaTime;
    
    if (isFalling) {
        if (Math.abs(p.wx) < 1) p.wx += (Math.random()-0.5) * 5 * deltaTime;
        if (Math.abs(p.wz) < 1) p.wz += (Math.random()-0.5) * 5 * deltaTime;
        
        rot.x += p.wx * deltaTime;
        rot.y += p.wy * deltaTime;
        rot.z += p.wz * deltaTime;
    } else {
       // Zeminde dönüşü sadece araç değilse düzelt (araçlar dönmeli)
       if (!data.direction) {
          rot.x *= 0.9;
          rot.z *= 0.9;
       }
    }

    // --- SİLİNDİR ÇEPER ÇARPIŞMASI ---
    if (pos.y < -0.2 && holeCenter) {
       const relX = pos.x - holeCenter.x;
       const relZ = pos.z - holeCenter.z;
       const distFromCenter = Math.sqrt(relX*relX + relZ*relZ);
       const wallRadius = holeRadius * 0.9;

       if (distFromCenter > wallRadius) {
         const normX = relX / distFromCenter;
         const normZ = relZ / distFromCenter;
         const vNormal = p.vx * normX + p.vz * normZ;
         
         if (vNormal > 0) {
           p.vx -= vNormal * (1.0 + BOUNCE_DAMPING) * normX;
           p.vz -= vNormal * (1.0 + BOUNCE_DAMPING) * normZ;
           p.wy += vNormal * 0.5;

           if (vNormal > 1 && Date.now() - p.lastBounceTime > 100) {
             playSound(100 + vNormal * 50);
             p.lastBounceTime = Date.now();
           }
         }
         
         pos.x = holeCenter.x + normX * wallRadius;
         pos.z = holeCenter.z + normZ * wallRadius;
         p.vy *= 0.98;
       }
    }

    // --- SÖNÜMLEME ---
    p.vx *= 0.995;
    p.vz *= 0.995;
    p.vy *= 0.999;
    
    // --- YUTULMA ---
    if (pos.y < -HOLE_DEPTH && bestHole) {
      physics.current.consumed = true;
      playSound(400);
      if (bestHole.type === 'player') {
        addPlayerScore(data.points, data.id);
      } else {
        addBotScore(bestHole.id, data.points, data.id);
      }
    }
    
    if (pos.y < -HOLE_DEPTH * 2) physics.current.consumed = true;
  });

  if (physics.current.consumed) return null;

  const Model = ModelComponents[data.type] || Human;

  // Araçlar için doğru rotasyon
  return (
    <group ref={ref} position={[data.x, 0, data.z]} rotation={[0, data.direction && !physics.current.vx ? (data.direction.x > 0 ? Math.PI/2 : data.direction.z > 0 ? 0 : Math.PI) : 0, 0]}>
      <Model color={data.color} size={data.size} />
    </group>
  );
}

export default GameObject;
