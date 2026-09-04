import type { SyntheticEvent } from "react";

// Self-contained SVG data URI so the fallback never depends on network access.
export const PLACEHOLDER_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300">
  <rect width="400" height="300" fill="#e2e8f0"/>
  <g stroke="#94a3b8" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <rect x="130" y="110" width="140" height="95" rx="4"/>
    <circle cx="163" cy="140" r="10" fill="#94a3b8" stroke="none"/>
    <path d="M130 190l38-38 30 28 32-26 40 41" />
  </g>
</svg>
`.trim());

export function handleImageError(e: SyntheticEvent<HTMLImageElement>) {
  const img = e.currentTarget;
  if (img.src !== PLACEHOLDER_IMAGE) {
    img.onerror = null;
    img.src = PLACEHOLDER_IMAGE;
  }
}
