'use client';

import { TransitionLink } from '@/components/TransitionLink';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-cyan-500 flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        <h1 className="text-6xl font-bold text-white mb-6">Home Page</h1>
        <p className="text-xl text-white/90 mb-8">
          Click the buttons below to navigate with a curtain transition effect!
        </p>
        <div className="flex gap-4 justify-center">
          <TransitionLink
            href="/about"
            className="inline-block px-8 py-4 bg-white text-blue-600 font-bold rounded-full hover:bg-blue-100 transition-colors"
          >
            Go to About
          </TransitionLink>
          <TransitionLink
            href="/demo"
            className="inline-block px-8 py-4 bg-white text-blue-600 font-bold rounded-full hover:bg-blue-100 transition-colors"
          >
            Curtain Demo
          </TransitionLink>
        </div>
      </div>
    </div>
  );
}
