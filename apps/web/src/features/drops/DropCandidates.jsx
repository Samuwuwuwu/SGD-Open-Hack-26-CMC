function DropCandidates({ candidates, onReveal, onBack }) {
  return (
    <section className="drops-section">
      <div className="drops-heading">
        <div>
          <div className="panel-kicker">04 / Your shortlist</div>
          <h3>A few good directions.</h3>
          <p className="panel-copy">Each option fits the hard boundaries you gave us. You choose what to reveal.</p>
        </div>
        <span className="candidate-count">{candidates.length} viable {candidates.length === 1 ? 'drop' : 'drops'}</span>
      </div>
      {candidates.length > 0 ? (
        <div className="drop-grid">
          {candidates.map((candidate, index) => (
            <article className="drop-card" key={candidate.id}>
              <div className={`drop-art drop-art-${index % 3}`} aria-hidden="true">{candidate.category === 'fashion' ? '✦' : candidate.category === 'food' ? '◌' : '◒'}</div>
              <div className="drop-card-content">
                <span className="drop-category">{candidate.category}</span>
                <h4>{candidate.name}</h4>
                <p>{candidate.description}</p>
                <div className="drop-card-footer"><strong>${candidate.availablePrice}</strong><button type="button" onClick={() => onReveal(candidate)}>Reveal <span>↗</span></button></div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state"><strong>No viable drop yet.</strong><span>Try widening your budget or loosening an optional preference.</span></div>
      )}
      <button className="text-button back-button" type="button" onClick={onBack}>← Adjust my signals</button>
    </section>
  );
}

export default DropCandidates;
