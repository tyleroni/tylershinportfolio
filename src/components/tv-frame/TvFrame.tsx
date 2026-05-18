import type { ReactNode } from 'react';
import styles from './TvFrame.module.scss';

type Props = {
  children: ReactNode;
};

/**
 * The cream-colored CRT TV frame that wraps the entire interface.
 *
 * The "screen" area in the middle is transparent (via the 9-sliced PNG
 * border-image trick) — that's where the press-start screen and desktop
 * render through.
 *
 * Two stable element IDs ('crt-content' and 'crt-line') are exposed for
 * the CRT transition hook. The hook uses document.getElementById to
 * animate them with GSAP.
 */
export default function TvFrame({ children }: Props) {
  return (
    <div className={styles.stage}>
      <div className={styles.tv}>
        <div className={styles.screen}>
          {/* crt-content wraps whatever's currently visible (press-start or desktop).
              GSAP scales this on Y during the transition. */}
          <div id="crt-content" className={styles.crtContent}>
            {children}
          </div>

          {/* crt-line is the bright horizontal flash at the midpoint of the
              transition. GSAP scales its Y from 0 to 1 and back. */}
          <div id="crt-line" className={styles.crtLine} />

          <div className={styles.crtOverlay} />
          <div className={styles.crtVignette} />
        </div>
      </div>
    </div>
  );
}
