'use client';

import { TransitionLink } from '@/components/TransitionLink';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 to-pink-500 flex flex-col items-center justify-center p-8">
      <div className="max-w-2xl text-center">
        <h1 className="text-6xl font-bold text-white mb-6">About Page</h1>
        <p className="text-xl text-white/90 mb-8">
          This is the about page with curtain page transitions powered by Three.js physics!
        </p>
        <div className="flex gap-4 justify-center">
          <TransitionLink
            href="/"
            className="inline-block px-8 py-4 bg-white text-purple-600 font-bold rounded-full hover:bg-purple-100 transition-colors"
          >
            Back to Home
          </TransitionLink>
          <TransitionLink
            href="/demo"
            className="inline-block px-8 py-4 bg-white text-purple-600 font-bold rounded-full hover:bg-purple-100 transition-colors"
          >
            Curtain Demo
          </TransitionLink>
        </div>
      </div>
    </div>
  );
}
