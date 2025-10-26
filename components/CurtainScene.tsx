'use client';

import { useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { CurtainPanel } from './CurtainPanel';
import { CurtainRod } from './CurtainRod';
import { GUI } from 'lil-gui';

interface CurtainSceneProps {
  segments: number;
  // stiffness: number; // COMMENTED OUT - Stiffness hardcoded in CurtainPanel.tsx:58
  // damping: number; // COMMENTED OUT - Damping hardcoded in CurtainPanel.tsx:59
  foldDepth: number;
  foldWidth: number;
  isOpen: boolean;
  onSegmentsChange: (value: number) => void;
  // onStiffnessChange: (value: number) => void; // COMMENTED OUT
  // onDampingChange: (value: number) => void; // COMMENTED OUT
  onFoldDepthChange: (value: number) => void;
  onFoldWidthChange: (value: number) => void;
}

export function CurtainScene({
  segments,
  // stiffness, // COMMENTED OUT
  // damping, // COMMENTED OUT
  foldDepth,
  foldWidth,
  isOpen,
  onSegmentsChange,
  // onStiffnessChange, // COMMENTED OUT
  // onDampingChange, // COMMENTED OUT
  onFoldDepthChange,
  onFoldWidthChange
}: CurtainSceneProps) {
  const width = 4;
  const height = 5;
  const guiRef = useRef<GUI | null>(null);

  // Setup lil-gui controls only once
  useEffect(() => {
    // Only create GUI if it doesn't exist
    if (!guiRef.current) {
      const gui = new GUI();
      gui.title('Curtain Physics');
      guiRef.current = gui;

      const params = {
        // stiffness, // COMMENTED OUT
        // damping, // COMMENTED OUT
        foldDepth,
        foldWidth
      };

      // COMMENTED OUT - Stiffness GUI control
      // gui
      //   .add(params, 'stiffness', 0.1, 1.0, 0.01)
      //   .name('Stiffness')
      //   .onChange((value: number) => {
      //     onStiffnessChange(value);
      //   });

      // COMMENTED OUT - Damping GUI control
      // gui
      //   .add(params, 'damping', 0.01, 0.1, 0.001)
      //   .name('Damping')
      //   .onChange((value: number) => {
      //     onDampingChange(value);
      //   });

      gui
        .add(params, 'foldDepth', 0.1, 2.0, 0.05)
        .name('Fold Depth')
        .onChange((value: number) => {
          onFoldDepthChange(value);
        });

      gui
        .add(params, 'foldWidth', 2, 15, 0.5)
        .name('Fold Width')
        .onChange((value: number) => {
          onFoldWidthChange(value);
        });
    }

    return () => {
      if (guiRef.current) {
        guiRef.current.destroy();
        guiRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Canvas
      shadows
      camera={{ position: [0, 2, 8], fov: 50 }}
      style={{ background: '#f5f5f0' }}
    >
      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[5, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={50}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />
      <directionalLight
        position={[-5, 5, -5]}
        intensity={0.3}
      />

      {/* Curtain Rod */}
      <CurtainRod width={width} height={height} numRings={20} />

      {/* Curtain Panels */}
      <CurtainPanel
        side="left"
        width={width}
        height={height}
        segments={segments}
        foldDepth={foldDepth}
        foldWidth={foldWidth}
        isOpen={isOpen}
      />
      <CurtainPanel
        side="right"
        width={width}
        height={height}
        segments={segments}
        foldDepth={foldDepth}
        foldWidth={foldWidth}
        isOpen={isOpen}
      />

      {/* Floor for shadow receiving */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -height / 2 - 0.5, 0]}
        receiveShadow
      >
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#e8e8e0" />
      </mesh>

      {/* Window behind curtains */}
      <mesh position={[0, 0, -0.5]}>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial color="#d0e8ff" />
      </mesh>

      {/* Camera controls */}
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={3}
        maxDistance={15}
        maxPolarAngle={Math.PI / 2}
      />
    </Canvas>
  );
}
