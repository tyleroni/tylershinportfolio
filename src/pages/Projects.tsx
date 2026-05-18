import { CASE_STUDIES } from '@/config/case-studies';
import CaseStudyCard from '@/components/case-study-card/CaseStudyCard';
import pageStyles from './page.module.scss';
import styles from './Projects.module.scss';

/**
 * The Projects list page. Shows all case studies as rich preview cards.
 * Clicking a card opens that case study as a new tab in the window.
 *
 * This is the "index" view — meant to give enough context that a casual
 * visitor can get the gist of each project without clicking through, but
 * still encourages clicking into the details.
 */
export default function Projects() {
  return (
    <div className={pageStyles.page}>
      <div className={pageStyles.pageInner}>
        <header className={pageStyles.pageHeader}>
          <h1 className={pageStyles.title}>Projects</h1>
          <p className={pageStyles.subtitle}>{CASE_STUDIES.length} case studies · click to open</p>
        </header>

        <div className={styles.grid}>
          {CASE_STUDIES.map((cs) => (
            <CaseStudyCard key={cs.slug} caseStudy={cs} />
          ))}
        </div>
      </div>
    </div>
  );
}
