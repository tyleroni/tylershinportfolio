import { useCallback } from 'react';
import { gsap } from 'gsap';
import { TOKENS } from '@/config/design-tokens';

/**
 * Hook that returns a function to play the CRT transition.
 *
 * Use it like:
 *   const runCrt = useCrtTransition();
 *   runCrt(() => navigate('/home'));  // navigate happens at the midpoint
 *
 * The animation has 6 phases:
 *  1. Pinch the current picture vertically into nothing
 *  2. Bright horizontal line snaps to full width at the center
 *  3. Run the swap callback (navigate to new route, etc.)
 *  4. Hold the bright line briefly
 *  5. Bright line shrinks back to nothing
 *  6. New picture expands back out (simultaneously with #5)
 *
 * The IDs 'crt-content' and 'crt-line' must exist in the DOM — they're
 * rendered by TvFrame.
 */
export function useCrtTransition() {
  return useCallback((swapCallback: () => void) => {
    const content = document.getElementById('crt-content');
    const line = document.getElementById('crt-line');
    if (!content || !line) {
      // Fallback — just run the callback if elements aren't ready
      swapCallback();
      return;
    }

    const tl = gsap.timeline();
    tl.to(content, { scaleY: 0, duration: TOKENS.CRT_PINCH_DURATION, ease: 'expo.in' });
    tl.to(line, { scaleY: 1, duration: TOKENS.CRT_LINE_FLASH_DURATION, ease: 'power2.out' }, '<');
    tl.call(() => swapCallback());
    tl.to({}, { duration: TOKENS.CRT_LINE_HOLD_DURATION });
    tl.to(line, { scaleY: 0, duration: TOKENS.CRT_LINE_FLASH_DURATION, ease: 'power2.in' });
    tl.to(content, { scaleY: 1, duration: TOKENS.CRT_EXPAND_DURATION, ease: 'expo.out' }, '<');
  }, []);
}
