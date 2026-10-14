// components/DesignerAvatar.tsx
'use client';

import Image from 'next/image';
import { useState } from 'react';

type Props = {
  name: string | null | undefined;
  src: string | null | undefined;
  size?: number;
  className?: string;
};

function safeName(name: string | null | undefined): string {
  if (!name) return 'Nestora designer';
  const trimmed = name.trim();
  return trimmed.length > 0 ? trimmed : 'Nestora designer';
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'ND';
}

export default function DesignerAvatar({
  name,
  src,
  size = 88,
  className,
}: Props) {
  const [failed, setFailed] = useState(false);
  const displayName = safeName(name);
  const hasSrc = typeof src === 'string' && src.trim().length > 0;
  const showImage = hasSrc && !failed;

  return (
    <div
      className={className ?? 'designer-avatar'}
      style={{ width: size, height: size }}
    >
      {showImage ? (
        <Image
          src={src as string}
          alt={`${displayName} profile photo`}
          fill
          sizes={`${size}px`}
          style={{ objectFit: 'cover' }}
          onError={() => setFailed(true)}
        />
      ) : (
        <span aria-hidden="true">{initials(displayName)}</span>
      )}
    </div>
  );
}
