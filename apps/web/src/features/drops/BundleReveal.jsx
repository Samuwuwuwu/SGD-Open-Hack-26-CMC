import { useEffect, useMemo, useRef, useState } from 'react';
import ButtonLift from '../../components/ButtonLift.jsx';
import DropPrice from '../../components/DropPrice.jsx';
import IconGlyph from '../../components/IconGlyph.jsx';
import ProductArt from '../../components/ProductArt.jsx';

function formatCategory(category = '') {
  return category.replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatCondition(condition) {
  if (condition === 'preloved_like_new') return 'PRE-LOVED · LIKE NEW';
  if (condition === 'preloved_good') return 'PRE-LOVED · GOOD CONDITION';
  return '';
}

function BundleReveal({ drop, budget, preferences, preferenceOptions, claimed, onClaim, onBack }) {
  const items = useMemo(() => drop?.items || [], [drop?.items]);
  const [reducedMotion] = useState(() => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [phase, setPhase] = useState('rolling');
  const [revealedCount, setRevealedCount] = useState(0);
  const [keptIds, setKeptIds] = useState(() => new Set(items.map((item) => item.id)));
  const [activeId, setActiveId] = useState(items[0]?.id || null);
  const [removedNotice, setRemovedNotice] = useState('');
  const [removingId, setRemovingId] = useState(null);
  const removalTimer = useRef(null);
  const touchStartX = useRef(null);

  useEffect(() => {
    if (phase !== 'rolling') return undefined;
    if (reducedMotion) {
      setRevealedCount(items.length);
      setPhase('ready');
      return undefined;
    }

    const timers = items.map((_, index) => window.setTimeout(() => setRevealedCount(index + 1), index * 520));
    const finishTimer = window.setTimeout(() => setPhase('ready'), items.length * 520 + 500);
    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      window.clearTimeout(finishTimer);
    };
  }, [items, phase, reducedMotion]);

  useEffect(() => () => window.clearTimeout(removalTimer.current), []);

  const keptItems = useMemo(() => items.filter((item) => keptIds.has(item.id)), [items, keptIds]);
  const activeIndex = Math.max(0, keptItems.findIndex((item) => item.id === activeId));
  const activeItem = keptItems[activeIndex] || keptItems[0] || null;
  const subtotal = keptItems.reduce((sum, item) => sum + item.availablePrice, 0);
  const matchingPreferences = activeItem
    ? preferenceOptions.filter((option) => preferences.includes(option.value) && activeItem.tags.includes(option.value))
    : [];

  const skipRoll = () => {
    setRevealedCount(items.length);
    setPhase('ready');
  };

  const openCarousel = () => {
    setPhase('carousel');
    setActiveId(items[0]?.id || null);
  };

  const selectPrevious = () => {
    if (keptItems.length < 2) return;
    setActiveId(keptItems[(activeIndex - 1 + keptItems.length) % keptItems.length].id);
  };

  const selectNext = () => {
    if (keptItems.length < 2) return;
    setActiveId(keptItems[(activeIndex + 1) % keptItems.length].id);
  };

  const handleTouchStart = (event) => {
    touchStartX.current = event.changedTouches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event) => {
    if (touchStartX.current === null) return;
    const startX = touchStartX.current;
    const endX = event.changedTouches[0]?.clientX;
    touchStartX.current = null;
    if (endX === undefined) return;
    const delta = endX - startX;
    if (Math.abs(delta) < 40) return;
    if (delta > 0) selectPrevious();
    else selectNext();
  };

  const removeActive = () => {
    if (!activeItem || removingId) return;
    const remaining = keptItems.filter((item) => item.id !== activeItem.id);
    setRemovingId(activeItem.id);
    setRemovedNotice(`${activeItem.name} removed from your drop.`);
    removalTimer.current = window.setTimeout(() => {
      setKeptIds((previous) => {
        const next = new Set(previous);
        next.delete(activeItem.id);
        return next;
      });
      setActiveId(remaining[Math.min(activeIndex, Math.max(remaining.length - 1, 0))]?.id || null);
      setRemovingId(null);
    }, 240);
  };

  if (phase !== 'carousel') {
    return (
      <section className="bundle-roll-panel" aria-labelledby="bundle-roll-title">
        <div className="bundle-roll-heading">
          <div>
            <p className="quiz-kicker">MULTI-PULL REVEAL</p>
            <h2 id="bundle-roll-title">Rolling your <span className="highlight-word">drop.</span></h2>
            <p className="panel-copy" aria-live="polite">
              {phase === 'ready' ? 'All finds are revealed. Give the bundle a look.' : `Revealing find ${Math.min(revealedCount + 1, items.length)} of ${items.length}...`}
            </p>
          </div>
          <span className="candidate-count"><IconGlyph name="rotate" size={13} /> {items.length} pull</span>
        </div>
        <div className="bundle-pull-stage" aria-label={`Revealing ${items.length} items`}>
          <span className="pull-ring pull-ring-one" />
          <span className="pull-ring pull-ring-two" />
          <div className="bundle-pull-cards">
            {items.map((item, index) => {
              const revealed = index < revealedCount;
              return (
                <article className={`bundle-pull-card bundle-pull-card-${index % 5} ${revealed ? 'is-revealed' : ''}`} key={item.id}>
                  <span className="pull-card-number">{String(index + 1).padStart(2, '0')}</span>
                  {revealed ? <ProductArt category={item.category} /> : <IconGlyph name="package" size={42} />}
                  <strong>{revealed ? item.name : 'SEALED'}</strong>
                </article>
              );
            })}
          </div>
          <span className="pull-stamp"><IconGlyph name="sparkles" size={18} /> ROLL</span>
        </div>
        <div className="bundle-roll-actions">
          {phase === 'rolling' && <ButtonLift><button className="secondary-button" type="button" onClick={skipRoll}>Skip animation <IconGlyph name="playerPlay" size={16} /></button></ButtonLift>}
          {phase === 'ready' && <ButtonLift><button className="primary-button" type="button" onClick={openCarousel}>OK <IconGlyph name="check" size={18} /></button></ButtonLift>}
          <ButtonLift><button className="secondary-button" type="button" onClick={onBack}>Back <IconGlyph name="arrowLeft" size={17} /></button></ButtonLift>
        </div>
      </section>
    );
  }

  return (
    <section className="bundle-carousel-panel" aria-labelledby="bundle-carousel-title">
      <div className="bundle-carousel-heading">
        <div>
          <p className="quiz-kicker">YOUR DROP</p>
          <h2 id="bundle-carousel-title">Keep what <span className="highlight-word">fits.</span></h2>
        </div>
        <strong className="bundle-total-heading">${subtotal} / ${budget}</strong>
      </div>

      <div className="bundle-carousel" aria-label="Revealed products">
        <ButtonLift><button className="carousel-arrow" type="button" onClick={selectPrevious} disabled={keptItems.length < 2} aria-label="Previous item"><IconGlyph name="arrowLeft" size={20} /></button></ButtonLift>
        <div className="carousel-track" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>
          {keptItems.map((item, index) => (
            <ButtonLift key={item.id}>
              <button className={`bundle-carousel-card ${item.id === activeItem?.id ? 'is-active' : ''} ${item.id === removingId ? 'is-removing' : ''}`} type="button" onClick={() => setActiveId(item.id)} disabled={item.id === removingId} aria-label={`View ${item.name}`} aria-pressed={item.id === activeItem?.id}>
                <span className="carousel-card-index">{String(index + 1).padStart(2, '0')}</span>
                <ProductArt category={item.category} />
                <strong>{item.name}</strong>
                <span className="carousel-card-category">{formatCategory(item.category)}</span>
                <span className="removed-stamp">REMOVE</span>
              </button>
            </ButtonLift>
          ))}
          {keptItems.length === 0 && <p className="bundle-empty-copy">Everything is out. Roll again to build a fresh drop.</p>}
        </div>
        <ButtonLift><button className="carousel-arrow" type="button" onClick={selectNext} disabled={keptItems.length < 2} aria-label="Next item"><IconGlyph name="arrowRight" size={20} /></button></ButtonLift>
      </div>

      {activeItem ? (
        <div className="bundle-item-details">
          <div className="bundle-detail-main">
            <p className="partner-name">{activeItem.partner}</p>
            <h3>{activeItem.name}</h3>
            {formatCondition(activeItem.condition) && <span className="condition-badge">{formatCondition(activeItem.condition)}</span>}
            <p className="panel-copy">{activeItem.description}</p>
            <DropPrice drop={activeItem} showDiscount />
          </div>
          <div className="bundle-detail-reasons">
            <div>
              <h3><IconGlyph name="sparkles" size={17} /> Why it found you</h3>
              {matchingPreferences.length > 0 ? <div className="match-tags">{matchingPreferences.map((option) => <span key={option.value}><IconGlyph name={option.icon} size={14} /> {option.label}</span>)}</div> : <p>It fits the live surplus pool and your ${budget} budget.</p>}
            </div>
            <div>
              <h3><IconGlyph name="package" size={17} /> Why it is here</h3>
              <p>{activeItem.description}</p>
            </div>
          </div>
          <div className="bundle-item-meta">
            <span>Retailer: <strong>{activeItem.partner}</strong></span>
            <span>Constraints: <strong>{activeItem.constraints?.size?.join(', ') || 'Any size'}{activeItem.constraints?.dietary?.length ? ` · ${activeItem.constraints.dietary.join(', ')}` : ''}</strong></span>
          </div>
          <div className="bundle-keep-actions">
            <ButtonLift><button className="secondary-button" type="button" onClick={() => setRemovedNotice('This find stays in your drop.')}>Keep <IconGlyph name="check" size={17} /></button></ButtonLift>
            <ButtonLift><button className="secondary-button remove-button" type="button" onClick={removeActive}>Remove <IconGlyph name="close" size={17} /></button></ButtonLift>
          </div>
        </div>
      ) : (
        <div className="bundle-item-details bundle-empty-details"><p>No items selected. Start over to roll a new drop.</p></div>
      )}

      <div className="bundle-claim-bar">
        <div>
          <strong>{keptItems.length} items · ${subtotal} / ${budget}</strong>
          <span aria-live="polite">{removedNotice || 'Every item starts selected. You can remove anything that is not quite you.'}</span>
        </div>
        <ButtonLift><button className="primary-button" type="button" onClick={onClaim} disabled={claimed || keptItems.length === 0}>
          {claimed ? <>Drop claimed <IconGlyph name="check" size={18} /></> : <>Claim drop <IconGlyph name="arrowUpRight" size={18} /></>}
        </button></ButtonLift>
      </div>
    </section>
  );
}

export default BundleReveal;
