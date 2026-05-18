import * as THREE from 'three';
import { makeRoundedBase, makeLogoFromSVG } from './three-helpers';
import { GITHUB_SVG, LINKEDIN_SVG, EMAIL_SVG, POWER_SVG } from './svg-paths';
import { BRAND_COLORS } from '@/config/design-tokens';

/**
 * Each mini-icon builder returns a Three.js Group containing the meshes
 * for one header icon. Same pattern for all 4: a rounded background tile
 * with the brand logo extruded on BOTH faces (so the icon looks correct
 * no matter which way it's facing during the rotation).
 *
 * EXCEPTION: the power icon is a single shape (ring + bar), no logo to
 * mirror — just the geometry on its own.
 */

function buildIconWithLogo(svg: string, bgColor: number, logoColor = 0xffffff): THREE.Group {
  const group = new THREE.Group();
  const base = makeRoundedBase(bgColor);
  base.position.z = -0.15;
  group.add(base);

  // Front face of the logo
  const logoFront = makeLogoFromSVG(svg, logoColor);
  logoFront.position.z = 0.21;
  group.add(logoFront);

  // Back face — same logo flipped 180° on Y axis so it reads correctly
  // when the icon rotates to face the camera the other way.
  const logoBack = makeLogoFromSVG(svg, logoColor);
  logoBack.rotation.y = Math.PI;
  logoBack.position.z = -0.21;
  group.add(logoBack);

  return group;
}

export function buildGithubIcon(): THREE.Group {
  return buildIconWithLogo(GITHUB_SVG, BRAND_COLORS.GITHUB);
}

export function buildLinkedinIcon(): THREE.Group {
  return buildIconWithLogo(LINKEDIN_SVG, BRAND_COLORS.LINKEDIN);
}

export function buildEmailIcon(): THREE.Group {
  return buildIconWithLogo(EMAIL_SVG, BRAND_COLORS.EMAIL);
}

/**
 * Power icon — uses the same rounded-tile + extruded-SVG pattern as the
 * other 3 icons for consistency. Dark slate tile with the red power glyph
 * on top reads cleanly and matches the visual language of the row.
 *
 * Previously this was hand-built from a torus + cylinder + sphere, which
 * looked "funky" compared to the flat, clean Bootstrap-Icon SVGs used by
 * GitHub/LinkedIn/Email.
 */
export function buildPowerIcon(): THREE.Group {
  return buildIconWithLogo(POWER_SVG, BRAND_COLORS.EMAIL, BRAND_COLORS.POWER);
}
