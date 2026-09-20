export function Logo({ size = 24, wordmark = true, className = "" }: { size?: number; wordmark?: boolean; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg viewBox="0 0 32 32" width={size} height={size} aria-hidden="true">
        <rect x="2" y="4" width="18" height="6" fill="currentColor" />
        <rect x="8" y="13" width="18" height="6" fill="currentColor" />
        <rect x="14" y="22" width="16" height="6" fill="#ec3013" />
      </svg>
      {wordmark && <span className="font-extrabold tracking-[-0.02em]" style={{ fontSize: size * 0.72 }}>Stackflow</span>}
    </span>
  );
}
