import IconGlyph from '../../components/IconGlyph.jsx';
import ButtonLift from '../../components/ButtonLift.jsx';
import ProductArt from '../../components/ProductArt.jsx';
import DropPrice from '../../components/DropPrice.jsx';

function DropCandidates({ candidates, onReveal }) {
  return (
    <section className="drops-section mystery-section">
      <div className="drops-heading">
        <h2>Good finds.<br /><span className="highlight-word">Your call.</span></h2>
        <span className="candidate-count">{candidates.length} {candidates.length === 1 ? 'drop' : 'drops'}<IconGlyph name="sparkles" size={13} /></span>
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
              <div className="drop-card-content">
                <p className="partner-name">{candidate.partner}</p>
                <h3>{candidate.name}</h3>
                <p className="drop-description">{candidate.description}</p>
                <DropPrice drop={candidate} showDiscount />
                <ButtonLift><button className="primary-button reveal-button" type="button" onClick={() => onReveal(candidate)} aria-label={`Reveal ${candidate.name}`}>Reveal <IconGlyph name="arrowUpRight" size={18} /></button></ButtonLift>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="empty-state"><span className="empty-glyph"><IconGlyph name="search" size={48} /></span><h3>No signal. Yet.</h3><p>No demo items fit this combination. Try a higher budget or adjust your details.</p></div>
      )}
    </section>
  );
}

export default DropCandidates;
