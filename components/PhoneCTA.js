// Pure presentation — thin wrapper around the `tel:1` placeholder anchor
// pattern used site-wide (the literal string "tel:1" is required: pages/_app.js
// swaps it client-side for the real tracking number). Centralizing this wrapper
// means the placeholder-swap contract only has to be understood in one place,
// while every call site keeps its own exact className/label/tracking behavior.
export function PhoneCTA({
  href = 'tel:1',
  className,
  ariaLabel = 'Call emergency dispatch',
  dataTrack,
  onClick,
  children,
}) {
  return (
    <a
      href={href}
      className={className}
      aria-label={ariaLabel}
      data-track={dataTrack}
      onClick={onClick}
    >
      {children}
    </a>
  );
}
