import styles from './page.module.scss';

/**
 * Resume page. Rendered when the Folder tab (Resume) is active.
 *
 * Two ways to handle a resume:
 *  1. Render the content inline as HTML (what this does — easier to update,
 *     fully styled, mobile-friendly)
 *  2. Embed a PDF viewer with a download link (more traditional)
 *
 * Going with option 1 — feels more "in the world" of the portfolio. Add a
 * download link at the top for people who want the PDF.
 */
export default function Resume() {
  return (
    <div className={styles.page}>
      <div className={styles.pageInner}>
        <header className={styles.pageHeader}>
          <h1 className={styles.title}>Resume</h1>
          <p className={styles.subtitle}>tyler shin · frontend &amp; creative dev</p>
          <a
            href="/tyler-shin-resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              marginTop: 16,
              fontFamily: 'var(--font-label)',
              fontSize: 13,
              color: 'var(--color-prompt-green)',
              letterSpacing: 1,
              textTransform: 'uppercase',
              borderBottom: '1px solid currentColor',
              paddingBottom: 2,
            }}
          >
            Download PDF →
          </a>
        </header>

        <section className={styles.section}>
          <h2 className={styles.h2}>$ experience</h2>
          <p>
            <strong>Frontend Developer</strong> — Company Name · 2023–Present
            <br />
            Lorem ipsum dolor sit amet. Replace with real role descriptions.
          </p>
          <p>
            <strong>UI Engineer</strong> — Another Company · 2022–2023
            <br />
            Another placeholder description.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>$ education</h2>
          <p>
            <strong>Your School Name</strong> · 2018–2022
            <br />
            Degree title, focus area.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>$ skills</h2>
          <ul className={styles.stackList}>
            <li>React, TypeScript, Next.js</li>
            <li>Three.js, GSAP, Motion</li>
            <li>Node.js, Express, REST APIs</li>
            <li>Figma, Adobe Creative Suite</li>
            <li>Git, CI/CD, Cloudflare</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
