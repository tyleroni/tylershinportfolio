/**
 * Case study metadata. Each case study has:
 *   - slug: URL-safe identifier (/projects/[slug])
 *   - title: display name
 *   - year: year shipped (or "WIP")
 *   - role: your role on the project (e.g., "Lead frontend", "Solo developer")
 *   - blurb: 1-2 sentence description for the preview card
 *   - hero: path to the hero image (in /public)
 *   - tags: tech stack / categories (optional)
 *
 * The full case study CONTENT lives in src/content/case-studies/ as separate
 * files. This array is just the metadata for the index/preview cards.
 *
 * PLACEHOLDERS — swap with real projects when ready.
 */

export type CaseStudy = {
  slug: string;
  title: string;
  year: string;
  role: string;
  blurb: string;
  hero: string;
  tags: string[];
};

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: 'project-one',
    title: 'Project One',
    year: '2024',
    role: 'Frontend + Animation',
    blurb:
      'A short two-line description of what this project is and why it matters. Reads like a tweet — informative but punchy.',
    hero: '/case-studies/project-one-hero.png',
    tags: ['React', 'Three.js', 'GSAP'],
  },
  {
    slug: 'project-two',
    title: 'Project Two',
    year: '2024',
    role: 'Solo developer',
    blurb:
      'Another project, another two-line description. The cards should give enough context to be useful even without clicking through.',
    hero: '/case-studies/project-two-hero.png',
    tags: ['Next.js', 'Motion', 'TypeScript'],
  },
  {
    slug: 'project-three',
    title: 'Project Three',
    year: '2023',
    role: 'UI engineer',
    blurb:
      'Third placeholder. Three case studies is a good starting point — enough to demonstrate range, not so many they blur together.',
    hero: '/case-studies/project-three-hero.png',
    tags: ['Vue', 'Design Systems'],
  },
];
