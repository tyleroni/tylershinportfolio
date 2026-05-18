import * as THREE from 'three';
import { SVGLoader } from 'three/examples/jsm/loaders/SVGLoader.js';

/**
 * Shared 3D building blocks used by all the icon components.
 *
 * These helpers exist as plain functions (not React components) because
 * Three.js geometry is created imperatively. We use them inside our
 * R3F-based components but they don't need to live inside React.
 */

/**
 * Factory for our standard 3D material.
 *
 * Every icon uses MeshStandardMaterial because it responds to lighting
 * (gives shapes a sense of dimension) and supports emissive glow on
 * hover. The emissive color matches the base color, so when we ramp
 * emissiveIntensity to 0.5 on hover, the icon brightens in its own hue.
 */
export function makeMaterial(
  color: number,
  options: { metalness?: number; roughness?: number; side?: THREE.Side } = {},
): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color,
    metalness: options.metalness ?? 0.1,
    roughness: options.roughness ?? 0.6,
    side: options.side ?? THREE.FrontSide,
    // Same color as emissive so hover glow tints in the icon's own hue
    emissive: color,
    emissiveIntensity: 0, // 0 = no glow; bumped to ICON_HOVER_GLOW on hover
  });
}

/**
 * Build a rounded rectangle shape (the background "tile" the mini icons sit on).
 * Used as the base behind the GitHub mark, LinkedIn "in", etc.
 */
export function makeRoundedBase(color: number, width = 1.6, height = 1.6, radius = 0.25): THREE.Mesh {
  // ExtrudeGeometry needs a 2D Shape with rounded corners
  const shape = new THREE.Shape();
  const x = -width / 2;
  const y = -height / 2;
  shape.moveTo(x, y + radius);
  shape.lineTo(x, y + height - radius);
  shape.quadraticCurveTo(x, y + height, x + radius, y + height);
  shape.lineTo(x + width - radius, y + height);
  shape.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
  shape.lineTo(x + width, y + radius);
  shape.quadraticCurveTo(x + width, y, x + width - radius, y);
  shape.lineTo(x + radius, y);
  shape.quadraticCurveTo(x, y, x, y + radius);

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: 0.3,
    bevelEnabled: false, // bevels are slow on complex shapes; not needed here
  });
  geometry.center(); // recenter so the mesh's origin is at its geometric center

  return new THREE.Mesh(geometry, makeMaterial(color, { roughness: 0.5 }));
}

/**
 * Extrude an SVG path into 3D geometry. Used for the brand logos (GitHub
 * Octocat, LinkedIn "in", envelope) so they appear as 3D objects on top
 * of the rounded background tiles.
 *
 * IMPORTANT: A logo may be composed of MANY disjoint paths/shapes (the
 * GitHub Octocat is one big path with sub-paths; LinkedIn has the "in"
 * letterforms plus a separate dot). We must compute the UNION bounding
 * box across ALL pieces first, then translate each one so that the union
 * is centered at the group's origin. If we centered each piece
 * individually (calling geometry.center() per-shape), every piece would
 * sit on its own local origin and the logo would be scrambled.
 *
 * The math:
 *   1. Build all extruded geometries (still in raw SVG coordinates)
 *   2. Compute union bbox of all geometries
 *   3. Translate each geometry by -unionCenter, then scale uniformly so
 *      the larger dimension becomes 1.0 (so the logo fits a unit tile)
 *   4. The group's origin is now the visual center of the whole logo,
 *      which means rotating the group 180° on Y for the back face mirrors
 *      it cleanly in place instead of flinging it off-center.
 *
 * Note we depend on the caller's `depth` and any size adjustments through
 * `scale`. The scale option is now a MULTIPLIER on the auto-fit-to-unit
 * scale (so scale=1 fills a unit, scale=0.7 fits within 70% of a unit).
 */
export function makeLogoFromSVG(
  svgString: string,
  color: number,
  options: { scale?: number; depth?: number } = {},
): THREE.Group {
  const userScale = options.scale ?? 1.0;
  const depth = options.depth ?? 0.12;

  const loader = new SVGLoader();
  const data = loader.parse(svgString);
  const group = new THREE.Group();
  const material = makeMaterial(color, { roughness: 0.4 });
  // SVG paths are filled regions; rendering both sides lets thin extrusions
  // look right at any angle even if a face normal flips.
  material.side = THREE.DoubleSide;

  // ----- Pass 1: build all extruded geometries
  // We flip Y here (SVGs are Y-down, Three.js is Y-up) but DON'T scale
  // yet — we need the union bbox in flipped-Y space first.
  const geometries: THREE.ExtrudeGeometry[] = [];
  for (const path of data.paths) {
    const shapes = SVGLoader.createShapes(path);
    for (const shape of shapes) {
      const geo = new THREE.ExtrudeGeometry(shape, {
        depth,
        bevelEnabled: false, // bevels on complex paths are very slow
        curveSegments: 6,
      });
      geo.scale(1, -1, 1); // flip SVG Y-down → Three.js Y-up
      geometries.push(geo);
    }
  }

  if (geometries.length === 0) {
    return group; // empty SVG → empty group, don't crash
  }

  // ----- Pass 2: compute union bbox across every piece
  const unionBox = new THREE.Box3();
  for (const geo of geometries) {
    geo.computeBoundingBox();
    if (geo.boundingBox) unionBox.union(geo.boundingBox);
  }
  const size = new THREE.Vector3();
  unionBox.getSize(size);
  const center = new THREE.Vector3();
  unionBox.getCenter(center);

  // Uniform scale so the larger of (width, height) becomes 1.0, then apply
  // any user-supplied scale multiplier. Math.max guards against zero.
  const autoScale = 1.0 / Math.max(size.x, size.y, 1e-6);
  const finalScale = autoScale * userScale;

  // ----- Pass 3: bake center-and-scale into vertex data
  // Translating + scaling the GEOMETRY (not the mesh) means the resulting
  // mesh's local origin truly is the logo's visual center. That's what
  // makes back-face mirroring (group.rotation.y = PI) work cleanly.
  for (const geo of geometries) {
    geo.translate(-center.x, -center.y, -center.z);
    geo.scale(finalScale, finalScale, finalScale);
    group.add(new THREE.Mesh(geo, material));
  }

  return group;
}

/**
 * Walk a mesh tree and set emissiveIntensity on every material that supports it.
 * Used by the hover-glow animation: we ramp this from 0 → ICON_HOVER_GLOW
 * when hovered.
 *
 * The smoothing is a simple lerp (linear interpolation) — each frame the
 * current value moves a fraction of the way toward the target. Result: a
 * soft eased transition without needing GSAP for every icon.
 */
export function lerpEmissive(group: THREE.Object3D, target: number, rate: number): void {
  group.traverse((child) => {
    if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshStandardMaterial) {
      const cur = child.material.emissiveIntensity;
      child.material.emissiveIntensity = cur + (target - cur) * rate;
    }
  });
}
