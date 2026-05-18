import { useLocation } from 'react-router-dom';
import TvFrame from '@/components/tv-frame/TvFrame';
import PressStart from '@/components/press-start/PressStart';
import Desktop from '@/components/desktop/Desktop';

/**
 * Top-level app component.
 *
 * Layout:
 *   <TvFrame>
 *     <Desktop />                  ← ALWAYS mounted (fills the screen area)
 *     {onPressStart && <PressStart />}  ← overlays on top of Desktop at '/'
 *   </TvFrame>
 *
 * Why Desktop is always mounted (instead of route-switched with PressStart):
 *
 * Previously this file used <Routes>/<Route> to render either PressStart OR
 * Desktop based on the URL. That meant Desktop UNMOUNTED when navigating
 * to '/' and REMOUNTED on the way back to '/home'. The remount happened
 * MID-CRT-TRANSITION, while the parent had `transform: scaleY(0)` applied
 * by GSAP. R3F's <Canvas> measures its parent on mount, and even though
 * CSS transforms don't technically affect layout box dimensions, R3F's
 * initial measurement got latched onto a wrong value somewhere in its
 * pipeline — symptom was all the icon labels collapsing to a single
 * screen position. The user observed that a full page reload fixed it
 * (because reload = fresh mount with no active transform).
 *
 * Solution: stop unmounting the Desktop. It now lives at the top level,
 * always present, with its Canvas measured once at fresh page load (no
 * active transforms). PressStart renders ABOVE it when on '/'.
 * Navigating between '/' and '/home' just toggles whether PressStart
 * overlays — Desktop never re-mounts, so the Canvas never re-measures.
 *
 * Sub-routes (About / Projects / Contact / Resume) are still handled
 * inside Desktop via the Window system, so this restructure doesn't
 * affect them.
 */
export default function App() {
  const { pathname } = useLocation();
  const onPressStart = pathname === '/';

  return (
    <TvFrame>
      <Desktop />
      {onPressStart && <PressStart />}
    </TvFrame>
  );
}
