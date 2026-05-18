import { create } from 'zustand';

/**
 * WINDOWS STORE
 *
 * This is the central state for the windowing system. One Zustand store
 * holds everything about which tabs are open, which one is focused, and
 * whether the window itself is showing.
 *
 * WHY ZUSTAND (vs Context)?
 * - No provider boilerplate. We just import `useWindowStore` anywhere.
 * - Selector-based subscriptions: components rerender only when the
 *   slice of state they read actually changes. With Context, every
 *   consumer rerenders on every state change.
 * - The store is a plain object — you can import it outside React
 *   (in event handlers, etc.) which we use for the icon click handlers.
 *
 * SHAPE:
 * - tabs: array of currently-open tabs in left-to-right order
 * - activeTabId: which tab is currently focused (null = no tab focused)
 * - isOpen: whether the window itself is visible (covers desktop)
 * - openFrom: the screen position the open animation should fly out from
 *
 * The window is "open" iff isOpen === true. Closing the last tab closes
 * the window. Re-opening an icon focuses its existing tab if present, or
 * creates a new tab if not.
 */

/** A single tab — represents one page (or one case study) open in the window. */
export type Tab = {
  /** Stable id — usually the route path (e.g., '/about', '/projects/proj-one'). */
  id: string;
  /** Display name shown in the tab strip. */
  title: string;
  /** The route path React Router should render. */
  path: string;
};

/** Optional "fly from" coordinates so the open animation knows where to start. */
export type OpenOrigin = {
  x: number;
  y: number;
} | null;

type WindowsState = {
  tabs: Tab[];
  activeTabId: string | null;
  isOpen: boolean;
  openFrom: OpenOrigin;

  /** Open a tab. If a tab with this id already exists, just focus it. */
  openTab: (tab: Tab, origin?: OpenOrigin) => void;

  /** Close a single tab. If it was the last one, the window closes entirely. */
  closeTab: (id: string) => void;

  /** Make a tab the active/visible one. */
  focusTab: (id: string) => void;

  /** Close the entire window. */
  closeWindow: () => void;
};

export const useWindowStore = create<WindowsState>((set, get) => ({
  tabs: [],
  activeTabId: null,
  isOpen: false,
  openFrom: null,

  openTab: (tab, origin = null) => {
    const existing = get().tabs.find((t) => t.id === tab.id);
    if (existing) {
      // Already open — just bring it to focus.
      set({ activeTabId: tab.id, isOpen: true });
      return;
    }
    // New tab — append and focus.
    set((state) => ({
      tabs: [...state.tabs, tab],
      activeTabId: tab.id,
      isOpen: true,
      openFrom: origin,
    }));
  },

  closeTab: (id) => {
    const { tabs, activeTabId } = get();
    const remainingTabs = tabs.filter((t) => t.id !== id);

    // If closing the last tab, close the entire window.
    if (remainingTabs.length === 0) {
      set({ tabs: [], activeTabId: null, isOpen: false });
      return;
    }

    // If we closed the active tab, focus the one to its left (or first remaining).
    let newActiveId = activeTabId;
    if (activeTabId === id) {
      const closedIndex = tabs.findIndex((t) => t.id === id);
      const newIndex = Math.max(0, closedIndex - 1);
      newActiveId = remainingTabs[newIndex]?.id ?? null;
    }

    set({ tabs: remainingTabs, activeTabId: newActiveId });
  },

  focusTab: (id) => set({ activeTabId: id }),

  closeWindow: () => set({ tabs: [], activeTabId: null, isOpen: false }),
}));
