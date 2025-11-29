import { memo } from 'react';
import * as THREE from 'three';
import { MAP_SIZE, BLOCK_SIZE, ROAD_WIDTH } from '../../utils/constants';

const Roads = memo(function Roads() {
  const roads = [];
  const start = -MAP_SIZE / 2;
  const end = MAP_SIZE / 2;

  // Grid yollar
  for (let i = start; i <= end; i += BLOCK_SIZE) {
    // Dikey yollar
    roads.push(
      <group key={`v${i}`}>
        {/* Yol Zemini */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[i, 0.01, 0]}>
          <planeGeometry args={[ROAD_WIDTH, MAP_SIZE]} />
          <meshBasicMaterial 
            color="#2a2a2a" 
            stencilWrite={true}
            stencilRef={1}
            stencilFunc={THREE.NotEqualStencilFunc}
            stencilFail={THREE.KeepStencilOp}
            stencilZFail={THREE.KeepStencilOp}
            stencilZPass={THREE.KeepStencilOp}
          />
        </mesh>
        {/* Yol Şeridi (Biraz daha yukarıda) */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[i, 0.03, 0]}>
          <planeGeometry args={[0.5, MAP_SIZE]} />
          <meshBasicMaterial 
            color="#f1c40f" 
            stencilWrite={true}
            stencilRef={1}
            stencilFunc={THREE.NotEqualStencilFunc}
            stencilFail={THREE.KeepStencilOp}
            stencilZFail={THREE.KeepStencilOp}
            stencilZPass={THREE.KeepStencilOp}
          />
        </mesh>
      </group>
    );

    // Yatay yollar
    roads.push(
      <group key={`h${i}`}>
        {/* Yol Zemini */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, i]}>
          <planeGeometry args={[MAP_SIZE, ROAD_WIDTH]} />
          <meshBasicMaterial 
            color="#2a2a2a" 
            stencilWrite={true}
            stencilRef={1}
            stencilFunc={THREE.NotEqualStencilFunc}
            stencilFail={THREE.KeepStencilOp}
            stencilZFail={THREE.KeepStencilOp}
            stencilZPass={THREE.KeepStencilOp}
          />
        </mesh>
        {/* Yol Şeridi */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.03, i]}>
          <planeGeometry args={[MAP_SIZE, 0.5]} />
          <meshBasicMaterial 
            color="#f1c40f" 
            stencilWrite={true}
            stencilRef={1}
            stencilFunc={THREE.NotEqualStencilFunc}
            stencilFail={THREE.KeepStencilOp}
            stencilZFail={THREE.KeepStencilOp}
            stencilZPass={THREE.KeepStencilOp}
          />
        </mesh>
      </group>
    );
  }

  return <group>{roads}</group>;
});

export default Roads;
