import { useEffect, useState } from 'react';

export interface LoadingSpinnerProps {
  isLoading: boolean;
  label?: string;
}

const SEGMENTS = Array.from({ length: 8 }, (_, index) => index);
const SEGMENT_COLORS = ['#e2e8f0', '#cbd5e1', '#94a3b8', '#64748b', '#475569', '#334155', '#1e293b', '#0f172a'];

export default function LoadingSpinner({ isLoading, label = 'Đang tải dữ liệu' }: LoadingSpinnerProps) {
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    if (isLoading) {
      return undefined;
    }

    const fadeInTimer = window.setTimeout(() => setIsFading(true), 0);
    const fadeOutTimer = window.setTimeout(() => setIsFading(false), 300);
    return () => {
      window.clearTimeout(fadeInTimer);
      window.clearTimeout(fadeOutTimer);
    };
  }, [isLoading]);

  const isVisible = isLoading || isFading;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'}`}
      role="status"
      aria-live="polite"
      aria-label={label}
      aria-hidden={!isVisible}
    >
      <div className="flex h-14 w-14 items-center justify-center">
        <svg className="loading-spinner h-14 w-14" viewBox="0 0 56 56" fill="none" aria-hidden="true">
          {SEGMENTS.map((segment) => (
            <g key={segment} transform={`rotate(${segment * 45} 28 28)`}>
              <rect x="25" y="3" width="6" height="13" rx="3" fill={SEGMENT_COLORS[segment]} />
            </g>
          ))}
        </svg>
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}
