import { useId } from "react";
import {
  ArrowUpDown,
  BotMessageSquare,
  Bug,
  CircleQuestionMark,
  ContactRound,
  Headset,
  LifeBuoy,
  LucideIcon,
  Send,
  Ticket,
  Wrench,
  Zap,
} from "lucide-react";

// Decorative tile of the New Issue form's icons mixed with support icons, repeated
// with an SVG <pattern>. Icons draw in currentColor, so colour and opacity come from
// the className, and the radial mask fades it out before the wrapper's edges.
// Place it inside a `relative isolate` wrapper. It is absolute, not fixed: a fixed
// full-screen layer inside #main-content is recomposited on every scroll frame
// (see .claude/skills/PERFORMANCE_4K.md)
const TILE = 240;
const ICON = 22;

// Hand-placed [icon, x, y, rotation] so the repeat doesn't look like a grid
const ICONS: [LucideIcon, number, number, number][] = [
  [Ticket, 14, 18, -12],
  [Send, 96, 10, 8],
  [LifeBuoy, 182, 34, -6],
  [ContactRound, 52, 84, 14],
  [Bug, 136, 76, -10],
  [Zap, 206, 112, 6],
  [CircleQuestionMark, 12, 146, 8],
  [Headset, 94, 152, -14],
  [ArrowUpDown, 170, 172, 10],
  [Wrench, 44, 208, -8],
  [BotMessageSquare, 128, 214, 12],
];

const IconPattern = ({
  className = "text-neutral-900 opacity-[0.1] dark:text-neutral-100 dark:opacity-[0.08]",
}: {
  className?: string;
}) => {
  // useId output contains characters (":" / "«»") that aren't safe in url(#…)
  const id = `icon-pattern-${useId().replace(/[^\w-]/g, "")}`;

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className={`pointer-events-none absolute inset-0 -z-10 h-full w-full [mask-image:radial-gradient(ellipse_at_center,black_50%,transparent_75%)] ${className}`}
    >
      <defs>
        <pattern
          id={id}
          width={TILE}
          height={TILE}
          patternUnits="userSpaceOnUse"
        >
          {ICONS.map(([Icon, x, y, rotate], i) => (
            <g
              key={i}
              transform={`rotate(${rotate} ${x + ICON / 2} ${y + ICON / 2})`}
            >
              <Icon x={x} y={y} width={ICON} height={ICON} strokeWidth={1.5} />
            </g>
          ))}
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
};

export default IconPattern;
