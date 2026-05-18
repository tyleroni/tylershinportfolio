import { useNavigate } from 'react-router-dom';
import { useWindowStore } from '@/state/windows';
import styles from './TabBar.module.scss';

/**
 * The tab strip in the window. Lists all open tabs from the Zustand store,
 * highlights the active one, and lets the user switch / close tabs.
 *
 * - Click a tab: focuses it (and updates the URL via React Router)
 * - Click the × on a tab: closes that tab. If it was the last tab,
 *   the window closes too (handled by the store).
 */
export default function TabBar() {
  const tabs = useWindowStore((s) => s.tabs);
  const activeTabId = useWindowStore((s) => s.activeTabId);
  const focusTab = useWindowStore((s) => s.focusTab);
  const closeTab = useWindowStore((s) => s.closeTab);

  const navigate = useNavigate();

  function handleFocus(id: string, path: string) {
    focusTab(id);
    navigate(path);
  }

  function handleClose(e: React.MouseEvent, id: string) {
    e.stopPropagation();
    closeTab(id);

    // If closing the active tab, navigate to wherever the new active tab
    // points. If it was the LAST tab, the store sets activeTabId to null
    // and isOpen to false — the window component will animate close.
    const next = useWindowStore.getState();
    if (next.activeTabId) {
      const nextTab = next.tabs.find((t) => t.id === next.activeTabId);
      if (nextTab) navigate(nextTab.path);
    } else {
      // No tabs left — return to the desktop
      navigate('/home');
    }
  }

  return (
    <div className={styles.tabBar}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`${styles.tab} ${tab.id === activeTabId ? styles.active : ''}`}
          onClick={() => handleFocus(tab.id, tab.path)}
        >
          <span className={styles.title}>{tab.title}</span>
          <span
            className={styles.closeX}
            onClick={(e) => handleClose(e, tab.id)}
            role="button"
            aria-label={`Close ${tab.title}`}
          >
            ×
          </span>
        </button>
      ))}
    </div>
  );
}
