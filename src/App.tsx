import heroImage from "./assets/hero.png";

export default function App() {
  return (
    <main className="app-shell">
      <section className="hero-card">
        <p className="eyebrow">React configured</p>
        <h1>Node Map is ready for React.</h1>
        <p className="intro">
          The app now mounts through React 19 with the Vite React plugin and JSX type-checking
          enabled.
        </p>
        <div className="actions">
          <code>src/App.tsx</code>
          <code>src/main.tsx</code>
          <code>vite.config.ts</code>
        </div>
      </section>

      <section className="preview-card" aria-label="Project preview">
        <img
          alt="Abstract node map artwork"
          className="preview-image"
          height="179"
          src={heroImage}
          width="170"
        />
        <div className="preview-copy">
          <h2>Next step</h2>
          <p>Replace this starter component tree with your actual UI.</p>
        </div>
      </section>
    </main>
  );
}
