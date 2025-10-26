"use client";

import { useRef, useMemo, useEffect, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Cloth, ClothConfig } from "@/lib/cloth-physics";

interface CurtainPanelProps {
  side: "left" | "right";
  width: number;
  height: number;
  segments: number;
  // stiffness: number; // COMMENTED OUT - Edit stiffness value in line 58 instead
  // damping: number; // COMMENTED OUT - Edit damping value in line 59 instead
  foldDepth: number;
  foldWidth: number;
  isOpen: boolean;
  onDrag?: (
    particle: { x: number; y: number },
    position: THREE.Vector3
  ) => void;
}

export function CurtainPanel({
  side,
  width,
  height,
  segments,
  // stiffness, // COMMENTED OUT - Not using prop, hardcoded below
  // damping, // COMMENTED OUT - Not using prop, hardcoded below
  foldDepth,
  foldWidth,
  isOpen,
  onDrag,
}: CurtainPanelProps) {
  console.log("🚀 ~ CurtainPanel ~ height:", height);
  const meshRef = useRef<THREE.Mesh>(null);
  const clothRef = useRef<Cloth | null>(null);
  const isDraggingRef = useRef(false);
  const draggedParticleRef = useRef<{ x: number; y: number } | null>(null);
  const { raycaster, camera, gl } = useThree();

  // ANIMATION STATE - Controls curtain position
  // Animation state for opening/closing
  // targetOffsetRef = where the curtain WANTS to be
  // currentOffsetRef = where the curtain CURRENTLY is (animates towards target)

  // ⚠️ EDIT INITIAL POSITION HERE ⚠️
  // To start OFF-SCREEN (then animate IN):
  //   Set based on side: const initialOffset = side === "left" ? -(width * 0.75 + 2) : (width * 0.75 + 2);
  // To start CLOSED (at center):
  //   Set to: const initialOffset = 0;
  const targetOffsetRef = useRef(0);
  const currentOffsetRef = useRef(0); // Current position

  // CLOTH INITIALIZATION - Create the curtain physics simulation
  // Initialize cloth and geometry - only recreate when segments change
  const { cloth, initialGeometry } = useMemo(() => {
    // For vertical folds like the reference image
    // More X segments = smoother curves on the folds
    const config: ClothConfig = {
      width: width / 2 + 2,
      height: height,
      segmentsX: 80, // High segment count for smooth curved folds
      segmentsY: 40, // Fixed vertical segments for consistent draping
      stiffness: 0.01, // HARDCODED - Edit this value directly (0-1, higher = more rigid)
      damping: 0.08, // HARDCODED - Edit this value directly (0-1, higher = less movement/oscillation)
      mass: 0.1,
      // ⚠️ GRAVITY - EDIT THIS TO ENABLE/DISABLE CLOTH PHYSICS ⚠️
      gravity: new THREE.Vector3(0, -2.0, 0), // NO GRAVITY - Set to (0, -9.8, 0) for downward gravity
      // Positive Y = pushes up, Negative Y = pulls down, (0,0,0) = no gravity
    };

    const newCloth = new Cloth(config);

    // Pin the top row (curtain rings)
    newCloth.pinRow(0);

    // CURTAIN POSITION - Edit where curtain is positioned

    // Position the cloth based on side and create vertical folds
    const xOffset = side === "left" ? -width / 4 : width / 4;

    // ⚠️ EDIT THIS LINE TO ADJUST VERTICAL POSITION (TOP OF CURTAIN) ⚠️
    const yOffset = height / 2; // Current: centered + 4 units up
    // Try: height / 2 = centered
    // Try: 0 = align top with screen center
    // Try: height / 2 + (extraHeight/2) = top at screen top
    // Use props for fold parameters instead of hardcoded values

    // Create vertical pleats that run from top to bottom
    // Each vertical pleat goes in and out in the Z direction
    for (let y = 0; y <= config.segmentsY; y++) {
      for (let x = 0; x <= config.segmentsX; x++) {
        const particle = newCloth.particles[y][x];

        // Horizontal offset for left/right panel
        particle.position.x += xOffset;
        particle.previous.x += xOffset;
        particle.original.x += xOffset;

        // Vertical offset to position closer to rod (NO height changes for folds)
        particle.position.y += yOffset;
        particle.previous.y += yOffset;
        particle.original.y += yOffset;

        // CURTAIN FOLD CREATION - THIS IS WHERE THE FOLDS ARE MADE

        // This section creates the vertical pleats/folds in the curtain
        // by displacing particles in the Z direction (depth)

        // Use smooth sine wave for rounded, natural-looking folds
        const normalizedX = x / config.segmentsX;
        const frequency = (Math.PI * 2) / foldWidth; // Controls how many folds
        const zDisplacement =
          Math.sin(normalizedX * config.segmentsX * frequency) * foldDepth;

        particle.position.z += zDisplacement;
        particle.previous.z += zDisplacement;
        particle.original.z += zDisplacement;

        // END OF FOLD CREATION
      }
    }

    return {
      cloth: newCloth,
      initialGeometry: newCloth.getGeometry(),
    };
    // Recreate when segments, foldDepth, or foldWidth change (not stiffness/damping)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height, segments, side, foldDepth, foldWidth]);

  const [geometry] = useState<THREE.BufferGeometry>(initialGeometry);

  // Store cloth in ref for access in event handlers and animation loop
  useEffect(() => {
    clothRef.current = cloth;
  }, [cloth]);

  // DYNAMIC PARAMETER UPDATES - COMMENTED OUT
  // Update cloth parameters smoothly when they change (without recreating cloth)
  // COMMENTED OUT - No longer using dynamic stiffness/damping from props
  // useEffect(() => {
  //   if (clothRef.current) {
  //     clothRef.current.updateStiffness(stiffness);
  //     clothRef.current.updateDamping(damping);
  //   }
  // }, [stiffness, damping]);

  // OPENING/CLOSING ANIMATION - Edit animation behavior here
  // *** VIEWPORT OFFSET CALCULATION - THIS IS WHERE CURTAIN DISTANCE IS SET ***
  //
  // ANIMATION STATES:
  // - isOpen = true  → Curtain OFF-SCREEN (to the sides, hidden)
  // - isOpen = false → Curtain CLOSED (at center, covering screen)
  //
  // ANIMATION FLOW:
  // 1. Start with isOpen = true → curtain starts OFF-SCREEN
  // 2. Set isOpen = false → curtain ANIMATES IN from left/right to center
  // 3. Set isOpen = true → curtain ANIMATES OUT from center to left/right
  //
  useEffect(() => {
    // Calculate offset to push curtains completely off-screen when open
    // Each panel is width/2 wide, positioned at ±width/4
    // To move completely off-screen, we need to move by (width/2 + width/4) = 3*width/4

    //  EDIT THIS LINE TO CHANGE HOW FAR THE CURTAIN MOVES AWAY
    const offScreenOffset = width * 0.75 + 2; // width * 0.75 + extra 2 units
    // Try: width * 1.0 for farther away, or width * 0.5 for closer

    // Set target position based on isOpen state
    targetOffsetRef.current = isOpen
      ? side === "left"
        ? -offScreenOffset // OFF-SCREEN: Move left panel to the left (hidden)
        : offScreenOffset // OFF-SCREEN: Move right panel to the right (hidden)
      : 0; // CLOSED: Center position (covering screen)
  }, [isOpen, side, width]);

  // MOUSE INTERACTION - Drag curtain with mouse
  // Mouse interaction
  useEffect(() => {
    const canvas = gl.domElement;

    const onMouseDown = (event: MouseEvent) => {
      if (!meshRef.current || !clothRef.current) return;

      const rect = canvas.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObject(meshRef.current);

      if (intersects.length > 0) {
        isDraggingRef.current = true;
        const point = intersects[0].point;

        // Find closest particle to intersection point
        let closestParticle = { x: 0, y: 0 };
        let minDist = Infinity;

        for (let y = 0; y <= cloth.config.segmentsY; y++) {
          for (let x = 0; x <= cloth.config.segmentsX; x++) {
            const particle = cloth.particles[y][x];
            const dist = particle.position.distanceTo(point);
            if (dist < minDist) {
              minDist = dist;
              closestParticle = { x, y };
            }
          }
        }

        draggedParticleRef.current = closestParticle;
      }
    };

    const onMouseMove = (event: MouseEvent) => {
      if (
        !isDraggingRef.current ||
        !draggedParticleRef.current ||
        !clothRef.current
      )
        return;

      const rect = canvas.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );

      raycaster.setFromCamera(mouse, camera);

      // Create a plane at the cloth's z position for raycasting
      const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
      const intersectionPoint = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersectionPoint);

      const particle = clothRef.current.getParticle(
        draggedParticleRef.current.x,
        draggedParticleRef.current.y
      );

      if (particle && !particle.isPinned) {
        particle.position.copy(intersectionPoint);
        particle.previous.copy(intersectionPoint);
      }

      if (onDrag) {
        onDrag(draggedParticleRef.current, intersectionPoint);
      }
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
      draggedParticleRef.current = null;
    };

    canvas.addEventListener("mousedown", onMouseDown);
    canvas.addEventListener("mousemove", onMouseMove);
    canvas.addEventListener("mouseup", onMouseUp);
    canvas.addEventListener("mouseleave", onMouseUp);

    return () => {
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("mousemove", onMouseMove);
      canvas.removeEventListener("mouseup", onMouseUp);
      canvas.removeEventListener("mouseleave", onMouseUp);
    };
  }, [cloth, raycaster, camera, gl, onDrag]);

  // ANIMATION LOOP - Runs every frame
  // Controls opening/closing animation
  useFrame((_state, delta) => {
    if (!clothRef.current) return;

    // ⚠️ ANIMATION SPEED - EDIT HERE ⚠️

    // LINEAR animation for identical IN/OUT motion
    const animationSpeed = 7; // Units per second (higher = faster, lower = slower)
    // Current: 5.0 = moderate speed
    // Try: 3.0 for slower, 8.0 for faster

    // Calculate direction and distance
    const distance = targetOffsetRef.current - currentOffsetRef.current;
    const direction = Math.sign(distance);
    const step = animationSpeed * delta;

    // Move at constant speed (linear motion - identical in both directions)
    if (Math.abs(distance) > step) {
      currentOffsetRef.current += direction * step;
    } else {
      currentOffsetRef.current = targetOffsetRef.current; // Snap to target when close
    }

    // UPDATE ALL PARTICLES - With gentle flowing effect

    const offset = currentOffsetRef.current;

    const flowAmount = 0.5; // Controls how much the curtain "flows" (0 = none, higher = more wave)
    const flowSpeed = 2.0; // Controls speed of the wave animation

    // Update ALL particles to move together with a gentle wave effect
    for (let y = 0; y <= clothRef.current.config.segmentsY; y++) {
      for (let x = 0; x <= clothRef.current.config.segmentsX; x++) {
        const particle = clothRef.current.particles[y][x];
        const originalX = particle.original.x;

        // Calculate a gentle wave based on Y position and time
        // This creates a flowing effect as the curtain enters/exits
        const normalizedY = y / clothRef.current.config.segmentsY; // 0 at top, 1 at bottom
        const wave =
          Math.sin(
            _state.clock.elapsedTime * flowSpeed + normalizedY * Math.PI
          ) * flowAmount;

        // Move each particle by the offset amount + gentle wave
        particle.position.x = originalX + offset + wave;
        particle.previous.x = originalX + offset + wave;
      }
    }

    // Physics is DISABLED for stable, smooth animation
    // The wave effect above provides gentle flowing motion
    // UNCOMMENT the line below to enable full cloth physics (may be unstable)
    // clothRef.current.update(Math.min(delta, 0.016));

    // Update geometry (this is needed to render the curtain shape)
    clothRef.current.updateGeometry(geometry);
  });

  // RENDER - Curtain mesh and material
  // Edit color, roughness, metalness below to change appearance
  return (
    <mesh ref={meshRef} geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial
        color="#ff0000" // Curtain color - Edit this hex code
        side={THREE.DoubleSide}
        roughness={0.8} // 0 = shiny, 1 = matte
        metalness={0.1} // 0 = non-metallic, 1 = fully metallic
      />
    </mesh>
  );
}
