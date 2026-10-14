// components/DesignImage.tsx
'use client';

import Image from 'next/image';
import { useState } from 'react';

type Props = {
  src: string | null | undefined;
  alt: string | null | undefined;
  priority?: boolean;
  className?: string;
};

const FALLBACK = '/images/hero-living.jpg';

function safeAlt(alt: string | null | undefined, src: string | null | undefined): string {
  const a = (alt ?? '').trim();
  if (a.length > 0) return a;
  // Derive a readable fallback from the filename if possible.
  if (src) {
    const filename = src.split('/').pop()?.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ');
    if (filename && filename.length > 0) return `Interior design: ${filename}`;
  }
  return 'Interior design';
}

export default function DesignImage({
  src,
  alt,
  priority = false,
  className,
}: Props) {
  const [currentSrc, setCurrentSrc] = useState<string>(src || FALLBACK);

  return (
    <Image
      src={currentSrc}
      alt={safeAlt(alt, src)}
      width={800}
      height={1000}
      sizes="(max-width: 640px) calc(100vw - 28px), (max-width: 900px) calc(100vw - 48px), (max-width: 1180px) calc((100vw - 48px - 36px) / 2), 380px"
      quality={90}
      priority={priority}
      placeholder="empty"
      style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      className={className}
      onError={() => {
        if (currentSrc !== FALLBACK) setCurrentSrc(FALLBACK);
      }}
    />
  );
}
