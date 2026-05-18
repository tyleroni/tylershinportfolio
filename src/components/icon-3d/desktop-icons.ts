import * as THREE from 'three';
import { makeMaterial } from './three-helpers';

/**
 * The 4 main desktop nav icons. Each is a hand-built composite of primitives
 * — there's no shared "base" the way the mini icons have, because each
 * icon has a fundamentally different shape (monitor, disc, bin, folder).
 */

/**
 * My Computer — a cute CRT monitor + base + tower stack.
 * Used for navigating to the About page.
 *
 * NOTE on vertical centering: this icon is taller than the others (monitor
 * + stand + tower spans ~1.75 units, mostly DOWNWARD from the group origin).
 * If we just placed it at the same position as the other icons, its visual
 * center would sit ~0.35 units below the other icons' centers and it would
 * appear to "dip" lower than its siblings. We compensate by lifting every
 * mesh by VISUAL_LIFT (constant below) so the icon's visual center matches
 * the other icons' visual centers. The group origin still represents the
 * icon's anchor point, so animations (bob, hover scale) keep working.
 */
const MY_COMPUTER_VISUAL_LIFT = 0.35;
export function buildMyComputer(): THREE.Group {
  const g = new THREE.Group();
  const L = MY_COMPUTER_VISUAL_LIFT;

  // Monitor body — beige plastic
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(1.4, 1.1, 1.0),
    makeMaterial(0xe4dcc0, { roughness: 0.6 }),
  );
  body.position.y = L;
  g.add(body);

  // Screen — dark blue, slightly reflective like real CRT glass
  const screen = new THREE.Mesh(
    new THREE.BoxGeometry(1.0, 0.75, 0.05),
    makeMaterial(0x1a2233, { metalness: 0.3, roughness: 0.15 }),
  );
  screen.position.set(0, 0.05 + L, 0.52);
  g.add(screen);

  // Tiny green power LED
  const led = new THREE.Mesh(
    new THREE.SphereGeometry(0.04, 12, 12),
    makeMaterial(0x00ff66, { roughness: 0.2 }),
  );
  led.position.set(0.55, -0.45 + L, 0.52);
  g.add(led);

  // Base (the thicker block the monitor sits on)
  const stand = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.18, 0.6),
    makeMaterial(0xd4ccb0),
  );
  stand.position.set(0, -0.7 + L, 0);
  g.add(stand);

  // Tower below — like a thin desktop PC under the monitor
  const tower = new THREE.Mesh(
    new THREE.BoxGeometry(1.3, 0.35, 0.85),
    makeMaterial(0xe4dcc0, { roughness: 0.6 }),
  );
  tower.position.set(0, -1.05 + L, 0);
  g.add(tower);

  // Floppy slot
  const slot = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, 0.06, 0.05),
    makeMaterial(0x222222),
  );
  slot.position.set(0.35, -1.05 + L, 0.43);
  g.add(slot);

  return g;
}

/**
 * CD / Disc — the projects icon.
 * Dark iridescent disc with a metallic silver hub ring on BOTH faces,
 * and a center hole that matches the desktop bg so it reads as see-through.
 */
export function buildCd(): THREE.Group {
  const g = new THREE.Group();

  // Main disc body — dark, very reflective
  const disc = new THREE.Mesh(
    new THREE.CylinderGeometry(0.95, 0.95, 0.05, 64),
    makeMaterial(0x222428, { metalness: 0.9, roughness: 0.18 }),
  );
  disc.rotation.x = Math.PI / 2;
  g.add(disc);

  // Silver hub ring on BOTH faces (mirrored on z so it shows from either side)
  const hubMat = makeMaterial(0xc8ccd0, { metalness: 0.4, roughness: 0.45 });
  for (const z of [0.026, -0.026]) {
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.14, 0.3, 48), hubMat);
    ring.position.z = z;
    if (z < 0) ring.rotation.y = Math.PI; // flip back-side normal
    g.add(ring);
  }

  // Center hole — colored to match the desktop bg
  const hole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.13, 0.13, 0.08, 24),
    makeMaterial(0x1a1a1c, { roughness: 0.9 }),
  );
  hole.rotation.x = Math.PI / 2;
  g.add(hole);

  return g;
}

/**
 * Recycle Bin — the contact icon.
 * A simple trash can: cylinder body + lid + small handle.
 */
export function buildRecycleBin(): THREE.Group {
  const g = new THREE.Group();

  // Tapered cylinder body (top wider than bottom)
  const bin = new THREE.Mesh(
    new THREE.CylinderGeometry(0.65, 0.55, 1.4, 24, 1, true),
    makeMaterial(0xa8b0b8, { roughness: 0.5, side: THREE.DoubleSide }),
  );
  g.add(bin);

  // Lid — slightly wider disc on top
  const lid = new THREE.Mesh(
    new THREE.CylinderGeometry(0.72, 0.72, 0.08, 24),
    makeMaterial(0x98a0a8),
  );
  lid.position.y = 0.74;
  g.add(lid);

  // Small handle on top
  const handle = new THREE.Mesh(
    new THREE.BoxGeometry(0.15, 0.18, 0.08),
    makeMaterial(0x98a0a8),
  );
  handle.position.y = 0.87;
  g.add(handle);

  // Recycle symbol on the front (small green triangle)
  const recyclePart = new THREE.Mesh(
    new THREE.SphereGeometry(0.12, 16, 16),
    makeMaterial(0x44aa44),
  );
  recyclePart.position.set(0, 0, 0.55);
  recyclePart.scale.set(1, 1, 0.3);
  g.add(recyclePart);

  return g;
}

/**
 * Folder — the resume icon.
 * Classic manila folder: bottom flat piece + folded tab + slight angle.
 */
export function buildFolder(): THREE.Group {
  const g = new THREE.Group();

  // Main folder body
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(1.5, 1.1, 0.12),
    makeMaterial(0xe4b950, { roughness: 0.6 }),
  );
  g.add(body);

  // Tab sticking up on the top
  const tab = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.2, 0.12),
    makeMaterial(0xe4b950, { roughness: 0.6 }),
  );
  tab.position.set(-0.4, 0.65, 0);
  g.add(tab);

  // Slight tilt so it has dimension
  g.rotation.y = -0.1;

  return g;
}
