import { useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAnimatedNoiseCanvas } from '@/hooks/useNoiseCanvas';
import { useCrtTransition } from '@/hooks/useCrtTransition';
import styles from './PressStart.module.scss';

/**
 * The landing screen. Shows animated TV static behind a blinking "> PRESS START"
 * button. Clicking the button triggers the CRT transition into the desktop.
 *
 * The animated static runs at 60fps and is intentionally aggressive (full
 * 0-255 noise range). Per WCAG 2.3 a rapidly-flickering whole-screen pattern
 * can be a photosensitivity hazard — the global CSS includes a
 * prefers-reduced-motion rule, but the canvas itself doesn't honor it.
 * If you ship this widely consider checking that media query and switching
 * to a static texture for affected users.
 */
export default function PressStart() {
  const staticRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const runCrt = useCrtTransition();

  // The animated static is enabled only while we're actually on '/'.
  // When the user clicks Press Start we navigate to /home, the canvas
  // unmounts, and the animation cleans itself up.
  useAnimatedNoiseCanvas(staticRef, pathname === '/');

  function handleStart() {
    runCrt(() => navigate('/home'));
  }

  return (
    <div className={styles.pressStart}>
      <canvas ref={staticRef} className={styles.staticCanvas} />
      <div className={styles.vignette} />
      <div className={styles.content}>
        <button className={styles.startRow} onClick={handleStart}>
          <span className={styles.arrow}>&gt;</span>
          <span className={styles.text}>PRESS START</span>
        </button>
      </div>
      <div className={styles.copyright}>© 2026 TYLER SHIN</div>
    </div>
  );
}
