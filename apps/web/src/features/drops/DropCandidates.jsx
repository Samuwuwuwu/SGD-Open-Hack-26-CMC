import ProductArt from '../../components/ProductArt.jsx';
import DropPrice from '../../components/DropPrice.jsx';

function DropCandidates({ candidates, onReveal }) {
  return (
    <section className="drops-section">
      <div className="drops-heading">
        <h2>Good finds.<br /><span className="highlight-word">Your call.</span></h2>
        <span className="candidate-count">{candidates.length} {candidates.length === 1 ? 'drop' : 'drops'}<span aria-hidden="true"> ✦</span></span>
      </div>
      <p className="panel-copy">Pick a drop to see the details and why it fits.</p>
      {candidates.length > 0 ? (
        <div className="drop-grid">
          {candidates.map((candidate, index) => (
            <article className="drop-card" key={candidate.id}>
              <div className={`drop-art drop-art-${index % 3}`}>
                <span className="drop-category">{candidate.category}</span>
                <ProductArt category={candidate.category} />
              </div>
              <div className="drop-card-content">
                <p className="partner-name">{candidate.partner}</p>
                <h3>{candidate.name}</h3>
                <p className="drop-description">{candidate.description}</p>
                <DropPrice drop={candidate} showDiscount />
                <button className="primary-button reveal-button" type="button" onClick={() => onReveal(candidate)} aria-label={`Reveal ${candidate.name}`}>Reveal <span aria-hidden="true">↗</span></button>
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
