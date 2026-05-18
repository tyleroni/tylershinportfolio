import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { TOKENS } from '@/config/design-tokens';

/**
 * Animates a window element opening from a given screen position.
 *
 * Classic Win95 "minimize-in-reverse" effect: the window appears to
 * fly out from a small box near the source icon, scaling and translating
 * up to its full-size resting position.
 *
 * We use GSAP because:
 *  - Timeline orchestration (multiple properties + delays in sequence)
 *  - Better easing curves than CSS for this kind of motion
 *  - We're already using it for the CRT transition
 *
 * Strategy:
 *  1. Set initial transform-origin to the icon's screen position
 *  2. Start at scale 0.05 (tiny dot) + opacity 0
 *  3. Animate to scale 1 + opacity 1 with an expo.out ease
 */
export function useWindowOpenAnimation(
  ref: React.RefObject<HTMLElement>,
  isOpen: boolean,
  openFrom: { x: number; y: number } | null,
) {
  // Track previous open state so we only animate on transitions, not every render
  const wasOpen = useRef(isOpen);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Going from closed → open: play open animation
    if (isOpen && !wasOpen.current) {
      const rect = el.getBoundingClientRect();
      const originX = openFrom ? ((openFrom.x - rect.left) / rect.width) * 100 : 50;
      const originY = openFrom ? ((openFrom.y - rect.top) / rect.height) * 100 : 50;

      gsap.set(el, {
        transformOrigin: `${originX}% ${originY}%`,
        scale: 0.05,
        opacity: 0,
      });
      gsap.to(el, {
        scale: 1,
        opacity: 1,
        duration: TOKENS.WINDOW_OPEN_DURATION,
        ease: TOKENS.WINDOW_OPEN_EASE,
      });
    }
    // Going from open → closed is handled by the parent (it keeps the window
    // mounted during the close anim, then unmounts after).

    wasOpen.current = isOpen;
  }, [ref, isOpen, openFrom]);
}
