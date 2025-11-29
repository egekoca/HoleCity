import { useFrame } from '@react-three/fiber';
import { useStore } from '../../store/gameStore';

function Spawner() {
  const spawnNew = useStore((s) => s.spawnNew);
  
  useFrame(() => {
    spawnNew();
  });
  
  return null;
}

export default Spawner;

