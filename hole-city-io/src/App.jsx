import { Canvas } from '@react-three/fiber';
import { initAudio } from './utils/audio';
import Scene from './components/game/Scene';
import UI from './components/ui/UI';
import './App.css';

function App() {
  return (
    <div 
      className="relative w-full h-full" 
      onClick={initAudio} 
      onTouchStart={initAudio}
    >
      <UI />
      <Canvas 
        camera={{ fov: 50, near: 0.1, far: 1500 }} 
        dpr={[1, 1.5]}
      >
        <color attach="background" args={['#87CEEB']} />
        <fog attach="fog" args={['#87CEEB', 100, 300]} />
        <Scene />
      </Canvas>
    </div>
  );
}

export default App;
