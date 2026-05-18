import { useParams, Navigate } from 'react-router-dom';
import { CASE_STUDIES } from '@/config/case-studies';
import pageStyles from '../page.module.scss';
import styles from './CaseStudy.module.scss';

/**
 * Individual case study page. The URL pattern is /projects/:slug.
 *
 * For now this is a placeholder layout — when we have real case study
 * content (probably as MDX files), we'd render that content here.
 * For now, just show metadata + lorem ipsum sections.
 */
export default function CaseStudy() {
  const { slug } = useParams();
  const study = CASE_STUDIES.find((c) => c.slug === slug);

  if (!study) {
    // Unknown slug — redirect back to the projects list
    return <Navigate to="/projects" replace />;
  }

  return (
    <div className={pageStyles.page}>
      <div className={pageStyles.pageInner}>
        <header className={pageStyles.pageHeader}>
          <div className={styles.metaRow}>
            <span>{study.year}</span>
            <span className={styles.dot}>·</span>
            <span>{study.role}</span>
          </div>
          <h1 className={pageStyles.title}>{study.title}</h1>
          <p className={pageStyles.subtitle}>{study.blurb}</p>
        </header>

        <div className={styles.heroBlock}>
          <div className={styles.heroPlaceholder}>Hero image placeholder</div>
        </div>

        <section className={pageStyles.section}>
          <h2 className={pageStyles.h2}>$ context</h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Replace with the project context —
            what were you trying to accomplish, who was the audience, what were the constraints?
          </p>
        </section>

        <section className={pageStyles.section}>
          <h2 className={pageStyles.h2}>$ process</h2>
          <p>
            Walk through your approach. Show research, sketches, iterations. The more honest
            you are about the messy middle, the more credible the final result.
          </p>
        </section>

        <section className={pageStyles.section}>
          <h2 className={pageStyles.h2}>$ outcome</h2>
          <p>
            What shipped? What was the impact? Include real numbers if you have them
            (engagement metrics, performance improvements, user feedback).
          </p>
        </section>

        <section className={pageStyles.section}>
          <h2 className={pageStyles.h2}>$ tech</h2>
          <ul className={pageStyles.stackList}>
            {study.tags.map((tag) => (
              <li key={tag}>{tag}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
