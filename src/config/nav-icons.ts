/**
 * The 4 main navigation icons that appear on the desktop.
 * Single source of truth — to add a new icon (or rename one), edit here.
 *
 * Each entry has:
 *  - id: stable identifier, used for tab keys and animation tracking
 *  - icon: which 3D mesh to render (matches keys in src/components/icon-3d)
 *  - name: the bold UPPERCASE label below the icon
 *  - sub: the muted descriptor below the name
 *  - path: which page to open when clicked
 */
export type NavIconId = 'my-computer' | 'cd' | 'recycle-bin' | 'folder';

export type NavIcon = {
  id: NavIconId;
  name: string;
  sub: string;
  path: string;
  /** Initial 3D position on the desktop, in scene units. */
  position: [number, number, number];
  /** Per-icon scale multiplier (some shapes need to be tweaked to look right). */
  scale: number;
};

export const NAV_ICONS: NavIcon[] = [
  {
    id: 'my-computer',
    name: 'My Computer',
    sub: 'About',
    path: '/about',
    position: [-4.5, 0.5, 0],
    scale: 1.0,
  },
  {
    id: 'cd',
    name: 'Projects.cd',
    sub: 'Projects',
    path: '/projects',
    position: [-1.5, 0.5, 0],
    scale: 0.88,
  },
  {
    id: 'recycle-bin',
    name: 'Recycle Bin',
    sub: 'Contact',
    path: '/contact',
    position: [1.5, 0.5, 0],
    scale: 0.85,
  },
  {
    id: 'folder',
    name: 'My Documents',
    sub: 'Resume',
    path: '/resume',
    position: [4.5, 0.5, 0],
    scale: 0.95,
  },
];
