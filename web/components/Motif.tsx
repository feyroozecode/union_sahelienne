/** Sahel-inspired woven diamond motif — decorative, tileable. */
export function Motif({
  className,
  color = "currentColor",
  opacity = 1,
}: {
  className?: string;
  color?: string;
  opacity?: number;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 40"
      fill="none"
      aria-hidden="true"
      style={{ opacity }}
    >
      <g stroke={color} strokeWidth="1.3">
        {[0, 40, 80].map((x) => (
          <g key={x}>
            <path d={`M${x} 20 L${x + 20} 4 L${x + 40} 20 L${x + 20} 36 Z`} />
            <path d={`M${x + 20} 14 L${x + 26} 20 L${x + 20} 26 L${x + 14} 20 Z`} />
          </g>
        ))}
      </g>
      <g fill={color}>
        {[20, 60, 100].map((x) => (
          <circle key={x} cx={x} cy="20" r="1.6" />
        ))}
      </g>
    </svg>
  );
}

/** Single diamond — used as a bullet / seal. */
export function Diamond({ className, color = "currentColor" }: { className?: string; color?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 1 L23 12 L12 23 L1 12 Z" stroke={color} strokeWidth="1.4" />
      <path d="M12 7 L17 12 L12 17 L7 12 Z" fill={color} opacity="0.9" />
    </svg>
  );
}
