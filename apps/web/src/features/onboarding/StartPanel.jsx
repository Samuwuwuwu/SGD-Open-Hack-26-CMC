function StartPanel({ onStart }) {
  return (
    <section className="journey-panel start-panel">
      <div className="start-art" aria-hidden="true"><span>↗</span><span>✦</span><span>◌</span></div>
      <div className="panel-kicker">A short, adaptive experience</div>
      <h3>Surplus has stories. Let’s find yours.</h3>
      <p className="panel-copy">A handful of thoughtful signals helps us turn good surplus into a drop worth revealing.</p>
      <button className="primary-button" type="button" onClick={onStart}>Start my drop <span>→</span></button>
      <p className="microcopy">About 60 seconds · You stay in control</p>
    </section>
  );
}

export default StartPanel;
