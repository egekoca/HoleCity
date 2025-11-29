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
  // Hedef ve durum
  const aiState = useRef({
    target: { x: rnd(MAP_SIZE - 40), z: rnd(MAP_SIZE - 40) },
    mode: 'wander', // 'wander', 'chase', 'flee', 'feed'
    changeTime: 0
  });
  
  const bots = useStore((s) => s.bots);
  const objects = useStore((s) => s.objects); 
  const eatEntity = useStore((s) => s.eatEntity);
  const endGame = useStore((s) => s.endGame);
  const applyBombPenalty = useStore((s) => s.applyBombPenalty);
  
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
    const ai = aiState.current;
    const now = Date.now();

    // --- AI MANTIĞI ---
    
    // 1. Çevreyi Tara (Tehlike ve Av)
    let nearestPrey = null;
    let nearestDanger = null;
    let minPreyDist = Infinity;
    let minDangerDist = Infinity;

    // a) Oyuncuyu kontrol et
    const pDist = Math.sqrt((pos.x - gameState.playerPos.x)**2 + (pos.z - gameState.playerPos.z)**2);
    const pScale = gameState.playerScale;
    
    if (pScale > scale * 1.2) {
      // Oyuncu tehlikeli
      if (pDist < minDangerDist) {
        minDangerDist = pDist;
        nearestDanger = { x: gameState.playerPos.x, z: gameState.playerPos.z };
      }
    } else if (scale > pScale * 1.2) {
      // Oyuncu av
      if (pDist < minPreyDist) {
        minPreyDist = pDist;
        nearestPrey = { x: gameState.playerPos.x, z: gameState.playerPos.z, type: 'player' };
      }
    }

    // b) Diğer botları kontrol et
    for (const otherBotId in gameState.bots) {
      if (otherBotId === bot.id) continue;
      const b = gameState.bots[otherBotId];
      const dist = Math.sqrt((pos.x - b.x)**2 + (pos.z - b.z)**2);
      
      if (b.scale > scale * 1.2) {
        if (dist < minDangerDist) {
          minDangerDist = dist;
          nearestDanger = b;
        }
      } else if (scale > b.scale * 1.2) {
        if (dist < minPreyDist) {
          minPreyDist = dist;
          nearestPrey = { ...b, id: otherBotId, type: 'bot' };
        }
      }
    }

    // c) Bomba Kontrolü
    if (minDangerDist > scale * 3) {
       for (const obj of objects) {
          if (obj.type === 'bomb') {
             const dist = Math.sqrt((pos.x - obj.x)**2 + (pos.z - obj.z)**2);
             if (dist < scale * 3 && scale > obj.size) {
                if (dist < minDangerDist) {
                   minDangerDist = dist;
                   nearestDanger = { x: obj.x, z: obj.z }; 
                }
             }
          }
       }
    }

    // 2. Karar Ver
    
    // KAÇMA (Öncelikli)
    if (minDangerDist < scale * 4 + 5) {
      ai.mode = 'flee';
      const dx = pos.x - nearestDanger.x;
      const dz = pos.z - nearestDanger.z;
      const len = Math.sqrt(dx*dx + dz*dz);
      ai.target.x = pos.x + (dx/len) * 30;
      ai.target.z = pos.z + (dz/len) * 30;
      ai.changeTime = now; // Kararı hemen uygula
    }
    // KOVALAMA
    else if (minPreyDist < scale * 5 + 15) {
      ai.mode = 'chase';
      ai.target.x = nearestPrey.x;
      ai.target.z = nearestPrey.z;
      ai.changeTime = now;
    }
    // BESLENME (Yiyecek Ara)
    else {
      // Hedef güncelleme (sık sık değil)
      if (!ai.target || now - ai.changeTime > 1500) {
         ai.changeTime = now;
         
         let bestFood = null;
         let bestScore = -Infinity;
         
         // Yakındaki değerli ve yenebilir nesneleri bul
         for (const obj of objects) {
            if (obj.type === 'bomb') continue;

            // Yenebilir mi? (GameObject mantığı: radius > size * 0.8)
            if (scale > obj.size * 0.8) {
               const dx = pos.x - obj.x;
               const dz = pos.z - obj.z;
               const distSq = dx*dx + dz*dz; 
               
               if (distSq < 3600) { // 60 birim yarıçap
                  // Puan / Mesafe^2 (Yakın ve değerli olanı seç)
                  const score = obj.points / (distSq + 1);
                  if (score > bestScore) {
                     bestScore = score;
                     bestFood = obj;
                  }
               }
            }
         }

         if (bestFood) {
            ai.mode = 'feed';
            ai.target = { x: bestFood.x, z: bestFood.z };
         } else {
            ai.mode = 'wander';
            // Rastgele ama harita içinde kalacak bir nokta
            ai.target = { x: rnd(MAP_SIZE - 40), z: rnd(MAP_SIZE - 40) };
         }
      }
    }

    // 3. Hareket
    const tx = ai.target.x;
    const tz = ai.target.z;
    const dx = tx - pos.x;
    const dz = tz - pos.z;
    const dist = Math.sqrt(dx*dx + dz*dz);
    
    // Hızlandırma (Hard Mode)
    const speed = 9; 
    
    if (dist > 0.1) {
      pos.x += (dx / dist) * speed * dt;
      pos.z += (dz / dist) * speed * dt;
    }

    // Sınırları koru
    pos.x = THREE.MathUtils.clamp(pos.x, -MAP_LIMIT, MAP_LIMIT);
    pos.z = THREE.MathUtils.clamp(pos.z, -MAP_LIMIT, MAP_LIMIT);

    // 4. Yeme Kontrolü (Bot yiyor mu?)
    if (ai.mode === 'chase' && minPreyDist < scale * 0.8) {
      if (nearestPrey.type === 'player') {
        endGame(bot.name + " swallowed you!");
      } else if (nearestPrey.type === 'bot') {
        eatEntity(bot.id, nearestPrey.id);
      }
    }

    // Global state güncelle
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
