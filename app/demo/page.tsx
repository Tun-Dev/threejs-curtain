'use client';

import { useState } from 'react';
import { CurtainScene } from '@/components/CurtainScene';
import { TransitionLink } from '@/components/TransitionLink';

export default function DemoPage() {
  const [segments, setSegments] = useState(25);
  // const [stiffness, setStiffness] = useState(0.9); // COMMENTED OUT - Hardcoded in CurtainPanel.tsx:58
  // const [damping, setDamping] = useState(0.03); // COMMENTED OUT - Hardcoded in CurtainPanel.tsx:59
  const [foldDepth, setFoldDepth] = useState(0.55);
  const [foldWidth, setFoldWidth] = useState(4);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-100">
      {/* Three.js Scene */}
      <div className="w-full h-screen">
        <CurtainScene
          segments={segments}
          foldDepth={foldDepth}
          foldWidth={foldWidth}
          isOpen={isOpen}
          onSegmentsChange={setSegments}
          onFoldDepthChange={setFoldDepth}
          onFoldWidthChange={setFoldWidth}
        />
      </div>

      {/* Open/Close Buttons */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-2xl shadow-2xl p-4">
        <div className="flex gap-3">
          <button
            onClick={() => setIsOpen(false)}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              !isOpen
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Close Curtains
          </button>
          <button
            onClick={() => setIsOpen(true)}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              isOpen
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Open Curtains
          </button>
        </div>
      </div>

      {/* Navigation Link */}
      <div className="absolute top-8 left-8">
        <TransitionLink
          href="/"
          className="px-6 py-3 bg-white/90 backdrop-blur-sm rounded-lg font-medium hover:bg-white transition-all shadow-lg"
        >
          ← Back to Home
        </TransitionLink>
      </div>
    </div>
  );
}
