"use client";

import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { TransitionCurtain } from "./TransitionCurtain";

interface PageTransitionContextType {
  startTransition: (callback: () => void) => Promise<void>;
  isAnimating: boolean; // Expose animation state for visual feedback
}

const PageTransitionContext = createContext<PageTransitionContextType | null>(
  null
);

export function usePageTransition() {
  const context = useContext(PageTransitionContext);
  if (!context) {
    throw new Error(
      "usePageTransition must be used within PageTransitionProvider"
    );
  }
  return context;
}

interface PageTransitionProviderProps {
  children: ReactNode;
}

export function PageTransitionProvider({
  children,
}: PageTransitionProviderProps) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [zIndex, setZIndex] = useState(-10);
  const [isAnimating, setIsAnimating] = useState(false); // Guard to prevent concurrent transitions

  const startTransition = useCallback(
    async (callback: () => void) => {
      // ⚠️ PREVENT CONCURRENT TRANSITIONS - Ignore clicks during animation
      if (isAnimating) {
        console.log("Transition already in progress, ignoring...");
        return;
      }

      // Mark as animating to block other transitions
      setIsAnimating(true);

      try {
        // Bring curtain to front
        setZIndex(1000);

        // Close curtains
        setIsTransitioning(true);

        // Wait for curtain to close (animation duration) - slower for smoother feel
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Navigate
        callback();

        // Wait a bit before opening
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Open curtains
        setIsTransitioning(false);

        // Wait for curtain to fully open before hiding
        await new Promise((resolve) => setTimeout(resolve, 3000));

        // Send curtain back below
        setZIndex(-10);
      } finally {
        // Always mark as done - allow new transitions (even if error occurred)
        setIsAnimating(false);
      }
    },
    [isAnimating]
  );

  return (
    <PageTransitionContext.Provider value={{ startTransition, isAnimating }}>
      {children}
      {/* Curtain overlay - starts at z-0, goes to z-1000 during transition */}
      <TransitionCurtain isOpen={!isTransitioning} zIndex={zIndex} />
    </PageTransitionContext.Provider>
  );
}
