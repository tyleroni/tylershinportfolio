import { useRef, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useNoiseCanvas } from '@/hooks/useNoiseCanvas';
import { useCrtTransition } from '@/hooks/useCrtTransition';
import { useWindowStore } from '@/state/windows';
import { NAV_ICONS } from '@/config/nav-icons';
import { CASE_STUDIES } from '@/config/case-studies';
import type { NavIcon, NavIconId } from '@/config/nav-icons';
import IconScene from './IconScene';
import IconLabels from './IconLabels';
import Header from '../header/Header';
import SystemTray from '../header/SystemTray';
import Window from '../window/Window';
import styles from './Desktop.module.scss';

/**
 * The main desktop view.
 *
 * Renders (bottom → top in z-order):
 *  1. Charcoal gradient background (via CSS on .desktop)
 *  2. Static noise canvas overlay
 *  3. IconScene — the Three.js 4-icon scene (in a width-constrained band)
 *  4. IconLabels — HTML labels over each icon
 *  5. Header — bio + mini icons
 *  6. SystemTray + Footer
 *  7. Window — overlay covering all of the above when a tab is open
 */
export default function Desktop() {
  const noiseRef = useRef<HTMLCanvasElement>(null);
  useNoiseCanvas(noiseRef);

  const [hoveredId, setHoveredId] = useState<NavIconId | null>(null);
  const [labelPositions, setLabelPositions] = useState<Map<NavIconId, { x: number; y: number }>>(
    new Map(),
  );

  const navigate = useNavigate();
  const location = useLocation();
  const openTab = useWindowStore((s) => s.openTab);
  const closeWindow = useWindowStore((s) => s.closeWindow);
  const runCrt = useCrtTransition();

  // (The press-start → desktop sizing fix used to live here as a delayed
  // window resize dispatch. It's been replaced by the <CrtRemountSizeFix>
  // helper that runs INSIDE the R3F Canvas — that approach directly calls
  // R3F's setSize and is both faster and more reliable.)

  // Deep-link support: if the user arrives at /about (etc) directly,
  // open the matching tab on mount. Runs once on first render.
  useEffect(() => {
    const path = location.pathname;
    if (path === '/' || path === '/home') return;

    // Case study deep link: /projects/some-slug
    const caseStudyMatch = path.match(/^\/projects\/(.+)$/);
    if (caseStudyMatch) {
      const slug = caseStudyMatch[1];
      const study = CASE_STUDIES.find((c) => c.slug === slug);
      if (study) {
        openTab({ id: '/projects', title: 'Projects.cd', path: '/projects' });
        openTab({ id: path, title: study.title, path });
        return;
      }
    }

    // Plain page deep link: /about, /projects, /contact, /resume
    const icon = NAV_ICONS.find((i) => i.path === path);
    if (icon) {
      openTab({ id: icon.path, title: icon.name, path: icon.path });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleIconClick(icon: NavIcon, screenPos: { x: number; y: number }) {
    openTab(
      {
        id: icon.path,
        title: icon.name,
        path: icon.path,
      },
      screenPos,
    );
    navigate(icon.path);
  }

  function handlePowerClick() {
    // Power off: close any open window and CRT-transition back to press start.
    closeWindow();
    runCrt(() => navigate('/'));
  }

  return (
    <div className={styles.desktop}>
      <canvas ref={noiseRef} className={styles.noiseCanvas} />

      <Header onPowerClick={handlePowerClick} />

      <div className={styles.contentBand}>
        <IconScene
          hoveredId={hoveredId}
          onHoverChange={setHoveredId}
          onIconClick={handleIconClick}
          onLabelPositionsUpdate={setLabelPositions}
        />
      </div>

      <IconLabels
        positions={labelPositions}
        hoveredId={hoveredId}
        onHoverChange={setHoveredId}
        onLabelClick={handleIconClick}
      />

      <SystemTray />

      <div className={styles.footer}>Tyler Shin · © 2026</div>

      {/* The Window renders ON TOP of everything else when isOpen === true.
          The component handles its own visibility internally. */}
      <Window />
    </div>
  );
}
