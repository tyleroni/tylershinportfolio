import { NAV_ICONS } from '@/config/nav-icons';
import type { NavIcon, NavIconId } from '@/config/nav-icons';
import styles from './IconLabels.module.scss';

type Props = {
  positions: Map<NavIconId, { x: number; y: number }>;
  hoveredId: NavIconId | null;
  onHoverChange: (id: NavIconId | null) => void;
  onLabelClick: (icon: NavIcon, screenPos: { x: number; y: number }) => void;
};

/**
 * HTML labels that float below each 3D icon.
 *
 * Why HTML and not 3D text? HTML text is sharper (subpixel-rendered) and
 * easier to style at a glance. We just compute the screen position of
 * each icon's 3D origin and absolutely-position the corresponding label.
 *
 * Hover behavior is bidirectional:
 *  - Hovering the 3D icon → label gets the .hovered class
 *  - Hovering the label → reports hover up so the icon glows + scales
 */
export default function IconLabels({ positions, hoveredId, onHoverChange, onLabelClick }: Props) {
  return (
    <div className={styles.layer}>
      {NAV_ICONS.map((icon) => {
        const pos = positions.get(icon.id);
        if (!pos) return null;

        const isHovered = hoveredId === icon.id;

        return (
          <button
            key={icon.id}
            className={`${styles.label} ${isHovered ? styles.hovered : ''}`}
            style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
            onPointerEnter={() => onHoverChange(icon.id)}
            onPointerLeave={() => onHoverChange(null)}
            onClick={(e) => {
              const screenPos = { x: e.clientX, y: e.clientY };
              onLabelClick(icon, screenPos);
            }}
          >
            <span className={styles.name}>{icon.name}</span>
            <span className={styles.sub}>{icon.sub}</span>
          </button>
        );
      })}
    </div>
  );
}
