import { useRef } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useWindowStore } from '@/state/windows';
import { useWindowOpenAnimation } from '@/hooks/useWindowAnimation';
import TabBar from './TabBar';
import WindowControlButton from './WindowControlButton';
import About from '@/pages/About';
import Projects from '@/pages/Projects';
import Contact from '@/pages/Contact';
import Resume from '@/pages/Resume';
import CaseStudy from '@/pages/case-study/CaseStudy';
import styles from './Window.module.scss';

/**
 * The Window component — a Win95-style window that holds the tabs and
 * page content. Fills the entire TV screen (edge-to-edge inside the frame).
 *
 * Visible only when the windowing store says isOpen === true. Animates
 * open from the position of the icon that was clicked.
 *
 * Internal routing: the React Router routes inside this component decide
 * which page to render based on the current URL. We rely on the URL being
 * in sync with the active tab (the TabBar handles that via navigate()).
 *
 * Structure:
 *   ┌────────────────────────────────────────────────────────┐
 *   │  [tab1] [tab2 ×] [tab3 ×] ...           [─][▢][×]      │  ← title bar
 *   ├────────────────────────────────────────────────────────┤
 *   │                                                        │
 *   │            (the active page renders here)              │
 *   │                                                        │
 *   └────────────────────────────────────────────────────────┘
 */
export default function Window() {
  const isOpen = useWindowStore((s) => s.isOpen);
  const openFrom = useWindowStore((s) => s.openFrom);
  const closeWindow = useWindowStore((s) => s.closeWindow);
  const activeTabId = useWindowStore((s) => s.activeTabId);
  const closeTab = useWindowStore((s) => s.closeTab);

  const ref = useRef<HTMLDivElement>(null);

  // Drive the open animation when isOpen flips
  useWindowOpenAnimation(ref, isOpen, openFrom);

  if (!isOpen) return null;

  function handleClose() {
    // Closing the WINDOW (× in the title bar's top-right cluster) closes
    // every tab and the window itself. The store handles that.
    closeWindow();
  }

  function handleCloseActiveTab() {
    if (activeTabId) closeTab(activeTabId);
  }

  return (
    <div className={styles.window} ref={ref}>
      <header className={styles.titleBar}>
        <TabBar />
        <div className={styles.controls}>
          <WindowControlButton variant="minimize" onClick={() => {}} disabled />
          <WindowControlButton variant="maximize" onClick={() => {}} disabled />
          <WindowControlButton variant="close" onClick={handleClose} />
        </div>
      </header>

      <main className={styles.content}>
        <Routes>
          <Route path="/about" element={<About />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:slug" element={<CaseStudy />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/resume" element={<Resume />} />
          {/* Fallback: any other path inside the window just shows the active tab.
              If we got here without a matching route, close-active-tab to recover. */}
          <Route path="*" element={<PageNotFound onClose={handleCloseActiveTab} />} />
        </Routes>
      </main>
    </div>
  );
}

function PageNotFound({ onClose }: { onClose: () => void }) {
  return (
    <div style={{ padding: 64, textAlign: 'center' }}>
      <p style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-terminal)' }}>
        404 — page not found
      </p>
      <button
        onClick={onClose}
        style={{
          marginTop: 24,
          padding: '8px 16px',
          background: 'rgba(255,255,255,0.06)',
          color: 'white',
          fontFamily: 'var(--font-label)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: 4,
          cursor: 'pointer',
        }}
      >
        Close tab
      </button>
    </div>
  );
}
