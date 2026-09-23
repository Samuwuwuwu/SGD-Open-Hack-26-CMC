function StartPanel({ onStart }) {
  return (
    <section className="start-panel">
      <div className="welcome-composition">
        <div className="welcome-copy">
          <h2>Good stuff.<br /><span className="highlight-word">New game.</span></h2>
          <p className="panel-copy">Give surplus a second chance. Set your range, tune your vibe, and discover a drop that feels like you.</p>
          <button className="primary-button" type="button" onClick={onStart}>Start my drop <span aria-hidden="true">↗</span></button>
        </div>
        <div className="welcome-art" aria-hidden="true">
          <span className="art-sparkle sparkle-one">✦</span>
          <div className="gacha-machine">
            <div className="machine-header">ROLLOVER <span>✦</span></div>
            <div className="machine-glass"><span className="capsule capsule-one">✦</span><span className="capsule capsule-two">◌</span><span className="capsule capsule-three">◒</span></div>
            <div className="machine-controls"><span className="machine-dial">↻</span><span className="machine-slot" /></div>
            <div className="machine-tray" />
          </div>
          <div className="art-sticker">SURPLUS<br /><span>→ SURPRISE</span></div>
          <span className="art-sparkle sparkle-two">✦</span>
        </div>
      </div>
    </section>
  );
}

export default StartPanel;
