import Link from 'next/link';

type LogoProps = { size?: number; variant?: 'wordmark' | 'mark' };

export function Logo({ size = 34, variant = 'wordmark' }: LogoProps) {
  return (
    <Link href="/" className="nestora-logo" aria-label="Nestora home">
      <svg width={size} height={size} viewBox="0 0 48 48" role="img" aria-label="Nestora nest mark">
        <path d="M7 32c4 7 11 10 17 10s13-3 17-10" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M10 26c3 6 8 9 14 9s11-3 14-9" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
        <path d="M14 20c2 4 6 6 10 6s8-2 10-6" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
        <circle cx="24" cy="9" r="3" fill="var(--terracotta, #b8764a)" />
      </svg>
      {variant === 'wordmark' && <span>Nestora<span className="logo-period">.</span></span>}
    </Link>
  );
}
