import ButtonLift from '../../components/ButtonLift.jsx';
import IconGlyph from '../../components/IconGlyph.jsx';

function DropCandidates({ candidates = [], openedDrops = {}, onReveal, drop }) {
  const bundle = drop || candidates?.drop;
  const items = bundle?.items || [];
  const legacyCandidates = Array.isArray(candidates) ? candidates : [];
  const openedCount = Object.keys(openedDrops).length;

  if (!bundle && legacyCandidates.length > 0) {
    return (
      <section className="drops-section mystery-section" data-opened-count={openedCount}>
        <div className="drops-heading">
          <h2>Ready to <span className="highlight-word">roll?</span></h2>
          <span className="candidate-count">{legacyCandidates.length} signals <IconGlyph name="sparkles" size={13} /></span>
        </div>
        <p className="panel-copy">Your personalised bundle is being prepared from the live surplus pool.</p>
        <div className="mystery-grid" style={{ '--box-count': Math.min(legacyCandidates.length, 5) }}>
          {legacyCandidates.map((candidate, index) => (
            <article className="mystery-card" key={candidate.id}>
              <div className={`mystery-box-art mystery-box-art-${index % 5}`} aria-hidden="true">
                <span className="mystery-box-lid" />
                <span className="mystery-box-body">?</span>
              </div>
              <div className="mystery-card-content">
                <p className="mystery-teaser">{candidate.mystery?.teaser || 'A sealed signal from the surplus pool.'}</p>
                <ButtonLift block>
                  <button className="primary-button mystery-choose" type="button" onClick={() => onReveal(candidate, index + 1)}>
                    Roll <IconGlyph name="arrowRight" size={16} />
                  </button>
                </ButtonLift>
              </div>
            </article>
          ))}
        </div>
      </section>
    );
  }

  if (!bundle || items.length === 0) {
    return (
      <section className="drops-section empty-state" role="status">
        <span className="empty-glyph"><IconGlyph name="search" size={48} /></span>
        <h3>No signal. Yet.</h3>
        <p>No demo items fit this combination. Try a higher budget or adjust your details.</p>
      </section>
    );
  }

  return (
    <section className="drops-section drop-ready-panel" aria-labelledby="drop-ready-title">
      <div className="drops-heading">
        <div>
          <p className="quiz-kicker">PERSONALISED DROP</p>
          <h2 id="drop-ready-title">One drop.<br /><span className="highlight-word">Many finds.</span></h2>
        </div>
        <span className="candidate-count">{items.length} items <IconGlyph name="sparkles" size={13} /></span>
      </div>
      <p className="panel-copy">Your answers built a bundle inside your ${bundle.budget} limit. Roll it open to see what the surplus pool found for you.</p>
      <div className="drop-ready-console" aria-hidden="true">
        {items.slice(0, 5).map((item, index) => (
          <div className={`ready-card ready-card-${index % 5}`} key={item.id || item.sku}>
            <IconGlyph name="package" size={28} />
            <span>{String(index + 1).padStart(2, '0')}</span>
          </div>
        ))}
      </div>
      <div className="drop-ready-meta">
        <span>{items.length} sealed finds</span>
        <strong>${bundle.total} / ${bundle.budget}</strong>
      </div>
      <ButtonLift>
        <button className="primary-button" type="button" onClick={() => onReveal(bundle, 1)}>
          Roll your drop <IconGlyph name="arrowRight" size={18} />
        </button>
      </ButtonLift>
    </section>
  );
}

export default DropCandidates;
