/**
 * Design tokens — all tunable constants for the portfolio in one place.
 * If you want to change how the icons feel, how fast the bio types, or
 * how the CRT transition plays, this is the file to edit.
 *
 * These map 1:1 to the CONFIG object from the mockup.
 */

export const TOKENS = {
  // ----- Main desktop nav icons (My Computer, CD, Recycle Bin, Folder)
  ICON_ROTATION_BASE_SPEED: 0.4, // base rad/s; each icon adds (0.08 * index)
  ICON_BOB_AMPLITUDE: 0.15, // 3D units the icon drifts up/down
  ICON_HOVER_SCALE: 1.15, // hover scale multiplier
  ICON_HOVER_GLOW: 0.5, // emissive intensity on hover (0 = off)
  HOVER_LERP_RATE: 0.15, // smoothing factor for scale + glow transitions

  // ----- Mini header icons (GitHub / LinkedIn / Email / Power)
  MINI_ROTATION_SPEED: 0.6, // constant rad/s; does NOT change on hover
  MINI_HOVER_SCALE: 1.15,
  MINI_HOVER_GLOW: 0.5,

  // ----- CRT transition (press-start <-> desktop)
  CRT_PINCH_DURATION: 0.28, // seconds for picture to collapse to a line
  CRT_LINE_FLASH_DURATION: 0.12, // seconds for the line to flash in/out
  CRT_LINE_HOLD_DURATION: 0.06, // seconds the line holds before expanding
  CRT_EXPAND_DURATION: 0.4, // seconds for new picture to expand back out

  // ----- Window open/close animation (case study windows)
  WINDOW_OPEN_DURATION: 0.45, // seconds for the wireframe-zoom open animation
  WINDOW_CLOSE_DURATION: 0.3, // seconds for the close animation
  WINDOW_OPEN_EASE: 'expo.out', // GSAP ease for opening
  WINDOW_CLOSE_EASE: 'expo.in', // GSAP ease for closing

  // ----- Layout constraints (these prevent the desktop content from
  //       spreading too wide on big monitors. The TV frame itself is
  //       constrained separately in CSS.)
  CONTENT_MAX_WIDTH: 1200, // max px the inner content (icons, windows) can be
} as const;

// Brand colors for the 3D icons (matches mockup)
export const BRAND_COLORS = {
  GITHUB: 0x1c1c1c,
  LINKEDIN: 0x0a66c2,
  EMAIL: 0x3a4150,
  POWER: 0xc63030,
} as const;
