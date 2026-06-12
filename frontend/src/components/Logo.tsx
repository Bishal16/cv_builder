interface LogoProps {
  /** Pixel size of the square mark */
  size?: number;
  /**
   * Colour scheme of the surface the logo sits on:
   * - 'auto'  — theme-aware (black tile in light mode, white tile in dark mode)
   * - 'dark'  — for permanently dark surfaces (white tile)
   * - 'light' — for permanently light surfaces (black tile)
   */
  variant?: 'auto' | 'dark' | 'light';
  className?: string;
}

/**
 * CV Builder logo — "Resume Sheet" mark.
 * A miniature resume (name bar + text lines + blue accent) on a rounded tile.
 */
export function Logo({ size = 28, variant = 'auto', className = '' }: LogoProps) {
  const tile =
    variant === 'dark' ? 'fill-white'
    : variant === 'light' ? 'fill-[#111111]'
    : 'fill-[#111111] dark:fill-white';
  const sheet =
    variant === 'dark' ? 'fill-[#111111]'
    : variant === 'light' ? 'fill-white'
    : 'fill-white dark:fill-[#111111]';
  const name =
    variant === 'dark' ? 'fill-white'
    : variant === 'light' ? 'fill-[#111111]'
    : 'fill-[#111111] dark:fill-white';
  const line =
    variant === 'dark' ? 'fill-[#555555]'
    : variant === 'light' ? 'fill-[#c7c7c7]'
    : 'fill-[#c7c7c7] dark:fill-[#555555]';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={`flex-shrink-0 ${className}`}
      aria-label="CV Builder"
      role="img"
    >
      <rect className={tile} width="64" height="64" rx="14" />
      <rect className={sheet} x="18" y="14" width="28" height="36" rx="3" />
      <rect className={name} x="22" y="20" width="12" height="3.5" rx="1.75" />
      <rect className={line} x="22" y="27" width="20" height="2.5" rx="1.25" />
      <rect className={line} x="22" y="32" width="20" height="2.5" rx="1.25" />
      <rect className={line} x="22" y="37" width="14" height="2.5" rx="1.25" />
      <rect x="22" y="43" width="9" height="2.5" rx="1.25" fill="#2563eb" />
    </svg>
  );
}
