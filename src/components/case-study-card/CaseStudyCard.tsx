import { useWindowStore } from '@/state/windows';
import type { CaseStudy } from '@/config/case-studies';
import styles from './CaseStudyCard.module.scss';

type Props = {
  caseStudy: CaseStudy;
};

/**
 * A preview card for a single case study. Shows the hero image, title,
 * year, role, blurb, tags, and a "View case study" link.
 *
 * Clicking the card opens the case study as a NEW tab in the window
 * (so the user can switch between projects and the list without losing
 * their place).
 */
export default function CaseStudyCard({ caseStudy }: Props) {
  const openTab = useWindowStore((s) => s.openTab);

  function handleOpen() {
    openTab({
      id: `/projects/${caseStudy.slug}`,
      title: caseStudy.title,
      path: `/projects/${caseStudy.slug}`,
    });
  }

  return (
    <article className={styles.card} onClick={handleOpen}>
      <div className={styles.hero}>
        {/* Placeholder gradient — replace with real image when ready */}
        <div className={styles.heroPlaceholder} />
      </div>

      <div className={styles.body}>
        <div className={styles.metaRow}>
          <span className={styles.year}>{caseStudy.year}</span>
          <span className={styles.dot}>·</span>
          <span className={styles.role}>{caseStudy.role}</span>
        </div>

        <h3 className={styles.title}>{caseStudy.title}</h3>
        <p className={styles.blurb}>{caseStudy.blurb}</p>

        <div className={styles.tags}>
          {caseStudy.tags.map((tag) => (
            <span key={tag} className={styles.tag}>
              {tag}
            </span>
          ))}
        </div>

        <div className={styles.cta}>View case study →</div>
      </div>
    </article>
  );
}
