import { useEffect } from 'react';
import { BIO_LINES } from '@/config/bio-lines';
import { TOKENS } from '@/config/design-tokens';

/**
 * Custom hook that drives the terminal-style typing animation.
 *
 * Takes two refs (for the command line text and the output line text)
 * and types/backspaces through BIO_LINES forever.
 *
 * WHY A HOOK?
 * - Encapsulates a piece of effectful logic with cleanup
 * - Easier to reason about than a useEffect with 50 lines inline
 * - Can be tested or replaced independently of the component using it
 *
 * CLEANUP IS CRITICAL: the async loop runs forever. If we didn't track
 * a `cancelled` flag and check it after every sleep, the loop would
 * keep running after the component unmounted — leaking memory and
 * trying to write to detached DOM nodes. The cleanup function flips
 * the flag, and the next sleep() returns to a loop iteration that
 * sees `cancelled` and exits.
 */
export function useTypingBio(
  cmdRef: React.RefObject<HTMLElement>,
  outRef: React.RefObject<HTMLElement>,
) {
  useEffect(() => {
    let cancelled = false;

    const sleep = (ms: number) =>
      new Promise<void>((resolve) => setTimeout(resolve, ms));

    async function backspace(el: HTMLElement) {
      while (el.textContent && el.textContent.length > 0 && !cancelled) {
        el.textContent = el.textContent.slice(0, -1);
        await sleep(TOKENS.BIO_BACKSPACE_SPEED + Math.random() * TOKENS.BIO_TYPE_JITTER);
      }
    }

    async function typeText(el: HTMLElement, text: string) {
      el.textContent = '';
      for (const ch of text) {
        if (cancelled) return;
        el.textContent += ch;
        await sleep(TOKENS.BIO_TYPE_SPEED + Math.random() * TOKENS.BIO_TYPE_JITTER);
      }
    }

    async function run() {
      const cmdEl = cmdRef.current;
      const outEl = outRef.current;
      if (!cmdEl || !outEl) return;

      let idx = 0;
      // Initial state: the first line is already rendered in JSX, so just
      // wait for the hold duration before starting the cycle.
      while (!cancelled) {
        await sleep(TOKENS.BIO_HOLD_DURATION);
        if (cancelled) return;

        // Erase the output first, then the command (feels like the user
        // "ran the command" and is now starting over).
        await backspace(outEl);
        await sleep(120);
        await backspace(cmdEl);
        await sleep(180);

        idx = (idx + 1) % BIO_LINES.length;
        await typeText(cmdEl, BIO_LINES[idx].cmd);
        await sleep(TOKENS.BIO_PAUSE_AFTER_CMD);
        await typeText(outEl, BIO_LINES[idx].out);
      }
    }

    run();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
