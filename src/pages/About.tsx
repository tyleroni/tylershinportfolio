import styles from './page.module.scss';

/**
 * The About page. Rendered inside the window when the My Computer tab
 * is active. Placeholder content — swap with your real bio.
 */
export default function About() {
  return (
    <div className={styles.page}>
      <div className={styles.pageInner}>
        <header className={styles.pageHeader}>
          <h1 className={styles.title}>About</h1>
          <p className={styles.subtitle}>tyler shin · frontend &amp; creative dev</p>
        </header>

        <section className={styles.section}>
          <h2 className={styles.h2}>$ whoami</h2>
          <p>
            I'm a frontend and creative developer based in Los Angeles &amp; San Diego. I build
            interfaces that move — combining React, Three.js, GSAP, and Motion to create
            experiences that feel less like websites and more like software you want to use.
          </p>
          <p>
            Currently open to full-time and contract work. Always interested in projects with
            high attention to motion, type, and detail.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>$ stack</h2>
          <ul className={styles.stackList}>
            <li>React, TypeScript, Next.js</li>
            <li>Three.js, React Three Fiber, GSAP, Motion</li>
            <li>SCSS, Tailwind, design tokens</li>
            <li>Figma, prototyping, design systems</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.h2}>$ history</h2>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Replace this with your
            actual background — schools, companies you've worked with, notable shipped work.
          </p>
        </section>
      </div>
    </div>
  );
}
