// The Hotpoint mark as an inline SVG (traced from the old 512px PNG), so it needs no
// image request and follows the text colour: set it with text-* classes, no dark:invert.
export const HotpointLogo = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 512 512"
    fill="currentColor"
    role="img"
    aria-label="HelpDesk Logo"
    className={`shrink-0 ${className}`}
  >
    <path d="M13 477V203A175 175 0 0 1 188 28H327V146H192A55 55 0 0 0 137 201V477Z" />
    <path d="M368 28H495V300C495 411.5 430.25 477 320 477H179V354H323A45 45 0 0 0 368 309V28Z" />
    <path
      stroke="currentColor"
      strokeWidth="8"
      strokeLinejoin="round"
      d="M214 191H291L318 218V286L291 313H214L187 286V218Z"
    />
  </svg>
);
