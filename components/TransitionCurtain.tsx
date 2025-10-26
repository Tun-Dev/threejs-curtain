"use client";

import { Canvas, useThree } from "@react-three/fiber";
import { CurtainPanel } from "./CurtainPanel";
import { useMemo } from "react";

interface TransitionCurtainProps {
  isOpen: boolean;
  zIndex: number;
}

function ResponsiveCurtainPanels({ isOpen }: { isOpen: boolean }) {
  const { viewport } = useThree();

  // Calculate dimensions to match viewport
  // Each curtain panel is exactly half the viewport width
  // Height is viewport height + extra 600px for full coverage
  const dimensions = useMemo(() => {
    // Convert 600px to Three.js units proportionally
    const extraHeight = (1500 / window.innerHeight) * viewport.height;
    console.log("🚀 ~ ResponsiveCurtainPanels ~ extraHeight:", extraHeight);
    return {
      width: viewport.width, // Full width (each panel will use half)
      height: viewport.height + extraHeight,
    };
  }, [viewport.width, viewport.height]);

  const segments = 25;
  // const stiffness = 0.98; // COMMENTED OUT - Stiffness hardcoded in CurtainPanel.tsx:58
  // const damping = 0.08; // COMMENTED OUT - Damping hardcoded in CurtainPanel.tsx:59
  const foldDepth = 0.1;
  const foldWidth = 8;

  return (
    <>
      {/* Left Curtain Panel - slides in from left */}
      <CurtainPanel
        side="left"
        width={dimensions.width}
        height={dimensions.height}
        segments={segments}
        foldDepth={foldDepth}
        foldWidth={foldWidth}
        isOpen={isOpen}
      />
      {/* Right Curtain Panel - slides in from right */}
      <CurtainPanel
        side="right"
        width={dimensions.width}
        height={dimensions.height}
        segments={segments}
        foldDepth={foldDepth}
        foldWidth={foldWidth}
        isOpen={isOpen}
      />
    </>
  );
}

export function TransitionCurtain({ isOpen, zIndex }: TransitionCurtainProps) {
  // For transitions: isOpen=true means OFF SCREEN, isOpen=false means CLOSED (center)
  return (
    <div
      className="fixed inset-0 pointer-events-none transition-all duration-300"
      style={{ zIndex }}
    >
      <Canvas
        shadows
        camera={{ position: [0, 0, 14], fov: 50 }}
        style={{ background: "transparent", pointerEvents: "none" }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight position={[5, 10, 5]} intensity={1} castShadow />

        <ResponsiveCurtainPanels isOpen={isOpen} />
      </Canvas>
    </div>
  );
}
