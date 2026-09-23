import ProductArt from '../../components/ProductArt.jsx';
import DropPrice from '../../components/DropPrice.jsx';
import IconGlyph from '../../components/IconGlyph.jsx';

const impactPriceFormatter = new Intl.NumberFormat('en-SG', {
  minimumSignificantDigits: 2,
  maximumSignificantDigits: 2,
});

function DropReveal({ drop, budget, preferences, preferenceOptions, claimed }) {
  const matchingPreferences = preferenceOptions.filter((option) => preferences.includes(option.value) && drop.tags.includes(option.value));
  const belowRetail = impactPriceFormatter.format(Math.max(0, drop.retailPrice - drop.availablePrice));

  return (
    <section className="reveal-panel">
      <h2>Oh, <span className="highlight-word">there you are.</span></h2>
      <div className="reveal-spotlight">
        <div className="reveal-art"><span className="drop-category">{drop.category}</span><ProductArt category={drop.category} /></div>
        <div className="reveal-details">
          <p className="partner-name">{drop.partner}</p>
          <h3>{drop.name}</h3>
          <p className="panel-copy">{drop.description}</p>
          <DropPrice drop={drop} showDiscount />
        </div>
      </div>
      <div className="match-reasons">
        <h3><IconGlyph name="sparkles" size={18} /> Why this drop</h3>
        <p>{budget === drop.availablePrice ? `Right on your $${budget} budget.` : `$${budget - drop.availablePrice} under your $${budget} budget \u2014 a little room to spare.`}</p>
        {matchingPreferences.length > 0 ? <div className="match-tags">{matchingPreferences.map((option) => <span key={option.value}><IconGlyph name={option.icon} size={15} /> {option.label}</span>)}</div> : <p>A discovery within your range, with no shared vibe tags.</p>}
        {drop.constraints?.size?.length > 0 && <p>Available sizes: {drop.constraints.size.join(', ')}</p>}
        {drop.constraints?.dietary?.length > 0 && <p>Dietary information: {drop.constraints.dietary.join(', ')}</p>}
        {drop.constraints?.allergens?.length > 0 && <p>Contains: {drop.constraints.allergens.join(', ')}</p>}
      </div>
      <div className="impact-metrics" aria-label="Circular retail snapshot">
        <div><strong>${belowRetail}</strong><span>Below retail</span></div>
        <div><strong>{drop.stock}</strong><span>In demo stock</span></div>
      </div>
      <p className="microcopy" role="status">{claimed ? 'Saved for this session. No order placed or stock reserved.' : 'Try the claim. This demo doesn\'t place orders or reserve stock.'}</p>
    </section>
  );
}

export default DropReveal;
