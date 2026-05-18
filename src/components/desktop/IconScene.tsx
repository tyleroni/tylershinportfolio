import { useMemo } from 'react';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';
import { NAV_ICONS } from '@/config/nav-icons';
import type { NavIcon, NavIconId } from '@/config/nav-icons';
import { TOKENS } from '@/config/design-tokens';
import { lerpEmissive } from '../icon-3d/three-helpers';
import {
  buildMyComputer,
  buildCd,
  buildRecycleBin,
  buildFolder,
} from '../icon-3d/desktop-icons';
import styles from './IconScene.module.scss';

// (Previously this file contained a `CrtRemountSizeFix` helper that tried
//  to recover from R3F's bad sizing when Desktop remounted mid-CRT-
//  transition. The real fix lives in App.tsx: Desktop is now ALWAYS
//  mounted, never re-mounted by route changes, so this hack is no longer
//  needed. The Canvas measures once at fresh page load — when no
//  transform is active — and that measurement stays correct for the
//  whole session.)

/**
 * The Three.js scene rendered into the middle of the desktop.
 *
 * R3F (React Three Fiber) lets us write Three.js code declaratively:
 * - <Canvas> creates the renderer + scene + camera
 * - <mesh>, <group> map to THREE.Mesh, THREE.Group
 * - useFrame runs every animation frame
 *
 * For our complex mesh-building (CRT monitor, CD, etc.), we still use
 * imperative functions that return THREE.Group objects, then mount them
 * with <primitive object={group} />. Best of both worlds.
 *
 * Props:
 *   hoveredId — controlled from the parent so labels can drive hover too
 *   onHoverChange — fires when the mouse enters/leaves an icon
 *   onIconClick — fires when an icon is clicked (parent opens a window)
 */

type Props = {
  hoveredId: NavIconId | null;
  onHoverChange: (id: NavIconId | null) => void;
  onIconClick: (icon: NavIcon, screenPos: { x: number; y: number }) => void;
  onLabelPositionsUpdate: (positions: Map<NavIconId, { x: number; y: number }>) => void;
};

export default function IconScene(props: Props) {
  return (
    <div className={styles.canvasWrap}>
      <Canvas
        // dpr clamps pixel ratio so retina screens don't burn GPU on full 3x rendering
        dpr={[1, 2]}
        // Camera positioned to see all 4 icons in a row
        camera={{ position: [0, 0, 7], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Lighting />
        <Icons {...props} />
      </Canvas>
    </div>
  );
}

/**
 * Lighting setup. Three lights:
 *  - ambient: fills shadows globally so nothing is pitch-black
 *  - key: main directional light from upper-right
 *  - fill: softer light from the left to soften shadows
 */
function Lighting() {
  return (
    <>
      <ambientLight intensity={0.55} />
      <directionalLight position={[5, 5, 5]} intensity={0.9} />
      <directionalLight position={[-3, 2, 3]} intensity={0.3} />
    </>
  );
}

/**
 * The 4 icons. Each is rendered as its own <IconMesh>. They share an
 * animation frame loop driven by useFrame at the parent level so we
 * batch the work efficiently.
 */
function Icons({ hoveredId, onHoverChange, onIconClick, onLabelPositionsUpdate }: Props) {
  // Build the Three.js Groups exactly once (useMemo) so re-renders don't
  // rebuild the geometry every time. The Groups are mutable refs that
  // useFrame animates in place.
  const builders: Record<NavIconId, () => THREE.Group> = {
    'my-computer': buildMyComputer,
    cd: buildCd,
    'recycle-bin': buildRecycleBin,
    folder: buildFolder,
  };

  const icons = useMemo(
    () =>
      NAV_ICONS.map((cfg) => ({
        cfg,
        mesh: builders[cfg.id](),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const { camera, size } = useThree();

  // Per-frame animation loop. Handles rotation, bob, hover scale, hover glow,
  // and reports projected screen positions back to the parent for labels.
  useFrame((_state, _delta) => {
    const t = _state.clock.elapsedTime;
    const positions = new Map<NavIconId, { x: number; y: number }>();

    icons.forEach(({ cfg, mesh }, i) => {
      const isHovered = cfg.id === hoveredId;

      // Bob up and down, phase-offset per icon so they don't sync
      mesh.position.x = cfg.position[0];
      mesh.position.z = cfg.position[2];
      mesh.position.y = cfg.position[1] + Math.sin(t * 0.9 + i) * TOKENS.ICON_BOB_AMPLITUDE;

      // Rotate continuously, slightly different speed per icon
      const speed = TOKENS.ICON_ROTATION_BASE_SPEED + i * 0.08;
      mesh.rotation.y = t * speed;
      mesh.rotation.x = Math.sin(t * 0.5 + i) * 0.08;

      // Hover scale — smoothly approach target
      const targetScale = (isHovered ? TOKENS.ICON_HOVER_SCALE : 1.0) * cfg.scale;
      const cur = mesh.scale.x;
      mesh.scale.setScalar(cur + (targetScale - cur) * TOKENS.HOVER_LERP_RATE);

      // Hover glow — ramp emissive intensity on every material in the group
      const targetEmissive = isHovered ? TOKENS.ICON_HOVER_GLOW : 0;
      lerpEmissive(mesh, targetEmissive, TOKENS.HOVER_LERP_RATE);

      // Project a FIXED point below the icon's REST position to 2D screen
      // coords. Using cfg.position (not mesh.position) means the label
      // anchor doesn't inherit the per-frame bob — labels stay still while
      // the icons gently float above them. Matches the mockup exactly.
      const v = new THREE.Vector3(
        cfg.position[0],
        cfg.position[1] - 1.7, // 1.7 below the rest position; static, not bobbing
        cfg.position[2],
      );
      v.project(camera); // -1..1 NDC
      positions.set(cfg.id, {
        x: ((v.x + 1) / 2) * size.width,
        y: ((-v.y + 1) / 2) * size.height,
      });
    });

    onLabelPositionsUpdate(positions);
  });

  return (
    <>
      {icons.map(({ cfg, mesh }) => (
        <primitive
          key={cfg.id}
          object={mesh}
          onPointerOver={(e: ThreeEvent<PointerEvent>) => {
            e.stopPropagation();
            onHoverChange(cfg.id);
            document.body.style.cursor = 'pointer';
          }}
          onPointerOut={() => {
            onHoverChange(null);
            document.body.style.cursor = '';
          }}
          onClick={(e: ThreeEvent<MouseEvent>) => {
            e.stopPropagation();
            // Report screen position of the click so the parent can fly
            // the window-open animation from this point
            const screenPos = {
              x: e.nativeEvent.clientX,
              y: e.nativeEvent.clientY,
            };
            onIconClick(cfg, screenPos);
          }}
        />
      ))}
    </>
  );
}

// (Removed an unused `useIconHoverState` named export that lived here. It
//  was dead code — never imported anywhere — and its presence broke React
//  Fast Refresh: a file with a default-exported component AND a non-
//  component named export gets HMR-invalidated on every edit instead of
//  hot-reloaded. That meant prior edits to this file didn't actually apply
//  until a full page reload. Desktop manages its hover state inline with
//  plain useState, which is the simpler pattern anyway.)
