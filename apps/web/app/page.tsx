const outcomes = [
  'Move one meaningful project forward',
  'Protect attention before adding new commitments',
  'Close the day with a clean next action',
];

export default function HomePage() {
  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">PERSONAL OS · TODAY</p>
        <h1>Clarity before velocity.</h1>
        <p className="subtle">Capture everything. Commit to less. Finish what matters.</p>
      </section>

      <section className="grid">
        <article className="card focus">
          <span>Today&apos;s outcomes</span>
          <ol>{outcomes.map((outcome) => <li key={outcome}>{outcome}</li>)}</ol>
        </article>
        <article className="card">
          <span>State</span>
          <div className="metric"><b>Focus</b><em>—</em></div>
          <div className="metric"><b>Energy</b><em>—</em></div>
          <div className="metric"><b>Mood</b><em>—</em></div>
          <div className="metric"><b>Stress</b><em>—</em></div>
        </article>
        <article className="card">
          <span>Chief of Staff</span>
          <p>No pressure to start something new. Review what is already in motion first.</p>
          <button>Open review</button>
        </article>
        <article className="card">
          <span>Inbox</span><strong>0</strong>
          <p>Ideas can live here without becoming obligations.</p>
        </article>
      </section>
    </main>
  );
}
