'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePageTransition } from './PageTransition';
import { ReactNode, MouseEvent } from 'react';

interface TransitionLinkProps {
  href: string;
  children: ReactNode;
  className?: string;
}

export function TransitionLink({ href, children, className }: TransitionLinkProps) {
  const router = useRouter();
  const { startTransition, isAnimating } = usePageTransition();

  const handleClick = async (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    // Don't do anything if transition is already in progress
    if (isAnimating) {
      return;
    }

    await startTransition(() => {
      router.push(href);
    });
  };

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={className}
      style={{
        // Visual feedback during transition
        opacity: isAnimating ? 0.5 : 1,
        pointerEvents: isAnimating ? 'none' : 'auto',
        cursor: isAnimating ? 'not-allowed' : 'pointer'
      }}
    >
      {children}
    </Link>
  );
}
