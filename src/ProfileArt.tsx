import { BookOpen, Clock, Flame, Music2, Network, Feather, Bookmark, Sigma, Command, Landmark, Globe2 } from "lucide-react";
import type { Subject } from "./model";
export function BadgeIcon({ kind, size = 24 }: { kind: string; size?: number }) {
  const icons = { book: BookOpen, clock: Clock, flame: Flame, music: Music2, network: Network, pen: Feather, bookmark: Bookmark, algebra: Sigma };
  const Icon = icons[kind as keyof typeof icons] ?? Flame;
  return <Icon size={size} strokeWidth={1.7} aria-hidden="true" />;
}
export function SubjectIcon({ subject, size = 22, x, y }: { subject: Subject; size?: number; x?: number; y?: number }) {
  const Icon = { math: Sigma, cs: Command, history: Landmark, politics: Globe2 }[subject];
  return <Icon size={size} x={x} y={y} strokeWidth={1.7} aria-hidden="true" />;
}
export function Avatar({ variant }: { variant: number }) {
  return <svg viewBox="0 0 100 100" fill="none" aria-hidden="true" className="avatar-art">
    <circle cx="50" cy="50" r="43" stroke="currentColor" opacity=".2" />
    {variant === 0 ? <><path d="M22 63L29 31L43 39L57 39L71 31L78 63L50 80Z" fill="currentColor" opacity=".18" /><path d="M22 63L29 31L43 39L57 39L71 31L78 63L50 80ZM32 53L44 58M68 53L56 58M44 68L50 72L56 68" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" /></> :
    variant === 1 ? <><circle cx="50" cy="48" r="25" stroke="currentColor" strokeWidth="2" /><rect x="31" y="37" width="38" height="23" rx="10" fill="currentColor" opacity=".22" /><path d="M37 48H63M27 76Q50 65 73 76M46 16H54" stroke="currentColor" strokeWidth="3" /><circle cx="40" cy="47" r="2" fill="currentColor" /><circle cx="60" cy="47" r="2" fill="currentColor" /></> :
    variant === 2 ? <><path d="M50 18L78 68L50 83L22 68Z" stroke="currentColor" strokeWidth="2" /><path d="M50 18V83M22 68L50 48L78 68M36 43L64 43" stroke="currentColor" opacity=".65" /><path d="M50 18L50 48L78 68Z" fill="currentColor" opacity=".2" /></> :
    <><ellipse cx="50" cy="50" rx="34" ry="14" transform="rotate(-35 50 50)" stroke="currentColor" strokeWidth="2" /><circle cx="50" cy="50" r="21" fill="currentColor" opacity=".18" /><path d="M31 40Q50 26 69 40M30 52Q50 38 70 52M36 64Q50 54 64 64" stroke="currentColor" strokeWidth="2" /><circle cx="77" cy="28" r="3" fill="currentColor" /></>}
  </svg>;
}
