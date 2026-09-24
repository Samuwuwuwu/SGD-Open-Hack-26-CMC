import ButtonLift from '../../components/ButtonLift.jsx';
import IconGlyph from '../../components/IconGlyph.jsx';
import ItemArtwork from './ItemArtwork.jsx';
import { money, words } from './dropPresentation.js';

export default function HaulSummary({ drop, claimed, onClaim, onBack, onReplay }) {
  return (
    <section className={`haul-summary theme-${drop.theme}`} aria-labelledby="haul-title">
      <div className="drop-screen-heading"><div><p className="quiz-kicker">{drop.label} / YOUR HAUL</p><h2 id="haul-title" tabIndex={-1}>A second chance. <span className="highlight-word">A very good choice.</span></h2></div><span className="haul-stamp"><IconGlyph name="check" size={22} />RE-ROLLED</span></div>
      <div className="haul-receipt"><div><span>YOUR BOX</span><strong>{drop.items.length} {drop.items.length === 1 ? 'find' : 'finds'}</strong></div><div><span>BOX TOTAL</span><strong>{money(drop.total)}</strong></div><div><span>YOUR BUDGET</span><strong>{money(drop.budget)}</strong></div></div>
      <div className="haul-items">
        {drop.items.map((item, index) => <details className="haul-item" key={item.id}>
          <summary><span className="haul-item-number">{String(index + 1).padStart(2, '0')}</span><ItemArtwork item={item} /><span className="haul-item-title"><small>{words(item.category)} / {item.partner}</small><strong>{item.name}</strong>{item.condition && item.condition !== 'new' && <small>PRE-LOVED · {words(item.condition)}</small>}<span>View details</span></span><span className="haul-expand" aria-hidden="true">+</span></summary>
          <div className="haul-item-expanded"><div><p className="quiz-kicker">THE FIND</p><h3>{item.name}</h3><p>{item.description}</p></div><dl className="haul-facts">
            {item.subcategory && <div><dt>Category</dt><dd>{words(item.category)} / {words(item.subcategory)}</dd></div>}
            {item.primary_colour && <div><dt>Primary colour</dt><dd>{words(item.primary_colour)}</dd></div>}
            {item.secondary_colour && <div><dt>Secondary colour</dt><dd>{words(item.secondary_colour)}</dd></div>}
            {item.materials && <div><dt>Materials / composition</dt><dd>{item.materials}</dd></div>}
            {item.constraints.size?.length > 0 && <div><dt>Available sizes</dt><dd>{item.constraints.size.map(words).join(', ')}</dd></div>}
            {item.constraints.dietary?.length > 0 && <div><dt>Dietary information</dt><dd>{item.constraints.dietary.map(words).join(', ')}</dd></div>}
            {item.category === 'food' && <div><dt>Listed allergens</dt><dd>{item.constraints.allergens?.length ? item.constraints.allergens.map(words).join(', ') : 'None listed'}</dd></div>}
            {item.category === 'food' && item.expiry_date && <div><dt>Expiry date</dt><dd>{item.expiry_date}</dd></div>}
            {item.condition && <div><dt>Condition</dt><dd>{words(item.condition)}</dd></div>}
            {item.surplus_reason && <div><dt>Why it is surplus</dt><dd>{words(item.surplus_reason)}</dd></div>}
            <div><dt>Retail partner</dt><dd>{item.partner}</dd></div>
          </dl></div>
        </details>)}
      </div>
      <div className="haul-actions" aria-label="Haul actions">
        <div className="haul-secondary-actions"><ButtonLift><button className="secondary-button" type="button" onClick={onBack}><IconGlyph name="arrowLeft" size={18} />Compare boxes</button></ButtonLift><ButtonLift><button className="secondary-button" type="button" onClick={onReplay}>Replay opening<IconGlyph name="refresh" size={18} /></button></ButtonLift></div>
        <ButtonLift><button className="primary-button" type="button" onClick={onClaim} disabled={claimed}>{claimed ? 'Pick saved' : 'Save this drop'}<IconGlyph name={claimed ? 'check' : 'arrowUpRight'} size={18} /></button></ButtonLift>
        <span className="haul-save-status" role="status">{claimed ? 'Saved for this session.' : ''}</span>
      </div>
      <p className="microcopy">Demo selection only. No payment or fulfilment takes place.</p>
    </section>
  );
}
