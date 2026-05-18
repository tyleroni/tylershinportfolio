/**
 * The rotating "terminal bio" lines that show in the top-left of the desktop.
 * Each entry is one command + its response. The bio types each one out
 * character-by-character, holds, backspaces, then types the next.
 *
 * To add, remove, or change lines, just edit this array. The number of
 * entries doesn't matter — the bio component cycles through them in order.
 */
export type BioLine = {
  cmd: string;
  out: string;
};

export const BIO_LINES: BioLine[] = [
  { cmd: 'whoami', out: 'tyler shin · frontend & creative dev' },
  { cmd: 'location', out: 'los angeles · san diego' },
  { cmd: 'status', out: "open to work — let's build something" },
  { cmd: 'focus', out: 'react · three.js · gsap · motion' },
  { cmd: 'currently', out: 'crafting interfaces that move' },
];
