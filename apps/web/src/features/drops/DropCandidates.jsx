function DropCandidates({ candidates, openedDrops, onReveal }) {
  return (
    <section className="drops-section mystery-section">
      <div className="drops-heading">
        <h2>Good finds.<br /><span className="highlight-word">Your call.</span></h2>
        <span className="candidate-count">{candidates.length} {candidates.length === 1 ? 'box' : 'boxes'}<span aria-hidden="true"> ✦</span></span>
      </div>
      <p className="panel-copy">Read the clues, choose a box, then see what is inside.</p>
      {candidates.length > 0 ? (
        <div className="mystery-grid" style={{ '--box-count': Math.min(candidates.length, 5) }}>
          {candidates.map((candidate, index) => (
            <article className={`mystery-card ${openedDrops[candidate.id] ? 'opened' : ''}`} key={candidate.id}>
              <div className={`mystery-box-art mystery-box-art-${index % 5}`} aria-hidden="true">
                <span className="mystery-box-lid" />
                <span className="mystery-box-body">{openedDrops[candidate.id] ? '✓' : '?'}</span>
              </div>
              <div className="mystery-card-content">
                <h3>Box {String(index + 1).padStart(2, '0')} {openedDrops[candidate.id] && <span className="mystery-opened-label">Opened</span>}</h3>
                <p className="mystery-teaser">{openedDrops[candidate.id]?.name || candidate.mystery.teaser}</p>
                <dl className="mystery-clues">
                  <div><dt>Palette</dt><dd>{candidate.mystery.primaryColour} + {candidate.mystery.secondaryColour}</dd></div>
                  <div><dt>Made with</dt><dd>{candidate.mystery.materials}</dd></div>
                  <div><dt>Category</dt><dd>{candidate.mystery.category}</dd></div>
                </dl>
                <button className="primary-button mystery-choose" type="button" onClick={() => onReveal(candidate, index + 1)}>{openedDrops[candidate.id] ? 'View reveal again' : 'Choose this box'} <span aria-hidden="true">↗</span></button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state"><span className="empty-glyph" aria-hidden="true">⌕</span><h3>No signal. Yet.</h3><p>No demo items fit this combination. Try a higher budget or adjust your details.</p></div>
      )}
    </section>
  );
}

export default DropCandidates;
