'use client';

import React from 'react';
import { Cylinder, Torus } from '@react-three/drei';

interface CurtainRodProps {
  width?: number;
  height?: number;
  numRings?: number;
}

export function CurtainRod({
  width = 8,
  height = 4,
  numRings = 20
}: CurtainRodProps) {
  const rodRadius = 0.03;
  const rodLength = width + 1;
  const ringRadius = 0.05;
  const ringThickness = 0.01;

  // Generate ring positions evenly spaced along the rod
  const ringPositions = React.useMemo(() => {
    const positions: number[] = [];
    const spacing = width / (numRings - 1);
    for (let i = 0; i < numRings; i++) {
      positions.push(-width / 2 + i * spacing);
    }
    return positions;
  }, [width, numRings]);

  return (
    <group position={[0, height / 2, 0]}>
      {/* Main rod */}
      <Cylinder
        args={[rodRadius, rodRadius, rodLength, 16]}
        rotation={[0, 0, Math.PI / 2]}
      >
        <meshStandardMaterial
          color="#2d2d2d"
          metalness={0.8}
          roughness={0.2}
        />
      </Cylinder>

      {/* End caps */}
      <group position={[-rodLength / 2, 0, 0]}>
        <Cylinder
          args={[rodRadius * 1.5, rodRadius * 1.5, 0.1, 16]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <meshStandardMaterial
            color="#2d2d2d"
            metalness={0.8}
            roughness={0.2}
          />
        </Cylinder>
      </group>

      <group position={[rodLength / 2, 0, 0]}>
        <Cylinder
          args={[rodRadius * 1.5, rodRadius * 1.5, 0.1, 16]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <meshStandardMaterial
            color="#2d2d2d"
            metalness={0.8}
            roughness={0.2}
          />
        </Cylinder>
      </group>

      {/* Curtain rings */}
      {ringPositions.map((x, i) => (
        <group key={i} position={[x, 0, 0]}>
          <Torus
            args={[ringRadius, ringThickness, 8, 16]}
          >
            <meshStandardMaterial
              color="#3d3d3d"
              metalness={0.7}
              roughness={0.3}
            />
          </Torus>
        </group>
      ))}
    </group>
  );
}
