import { useCallback, useEffect, useRef, useState } from 'react';
import ButtonLift from '../../components/ButtonLift.jsx';
import IconGlyph from '../../components/IconGlyph.jsx';
import BoxModel from './BoxModel.jsx';
import { money } from './dropPresentation.js';
import useReducedMotion from './useReducedMotion.js';

export default function BoxCandidates({ candidates, budget, openedDrops, onChoose, onEdit, onRetake }) {
  const scrollerRef = useRef(null);
  const reducedMotion = useReducedMotion();
  const [scrollState, setScrollState] = useState({ overflow: false, first: 1, visible: 3, progress: 0, atStart: true, atEnd: true });
  const measureScroll = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const cardWidth = scroller.firstElementChild?.getBoundingClientRect().width || scroller.clientWidth;
    const gap = Number.parseFloat(window.getComputedStyle(scroller).columnGap) || 0;
    const step = cardWidth + gap;
    const visible = Math.max(1, Math.round((scroller.clientWidth + gap) / step));
    const maxScroll = Math.max(0, scroller.scrollWidth - scroller.clientWidth);
    const first = Math.min(Math.max(1, Math.round(scroller.scrollLeft / step) + 1), Math.max(1, scroller.children.length - visible + 1));
    setScrollState({ overflow: maxScroll > 2, first, visible, progress: maxScroll ? Math.round(scroller.scrollLeft / maxScroll * 100) : 0, atStart: scroller.scrollLeft < 2, atEnd: maxScroll - scroller.scrollLeft < 2 });
  }, []);
  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return undefined;
    measureScroll();
    if (window.ResizeObserver) {
      const observer = new window.ResizeObserver(measureScroll);
      observer.observe(scroller);
      return () => observer.disconnect();
    }
    window.addEventListener('resize', measureScroll);
    return () => window.removeEventListener('resize', measureScroll);
  }, [candidates.length, measureScroll]);
  const moveBoxes = (direction) => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const gap = Number.parseFloat(window.getComputedStyle(scroller).columnGap) || 0;
    const step = (scroller.firstElementChild?.getBoundingClientRect().width || scroller.clientWidth) + gap;
    scroller.scrollTo({ left: scroller.scrollLeft + direction * step, behavior: reducedMotion ? 'auto' : 'smooth' });
  };
  const scrubBoxes = (event) => {
    const scroller = scrollerRef.current;
    if (scroller) scroller.scrollLeft = (scroller.scrollWidth - scroller.clientWidth) * Number(event.target.value) / 100;
  };
  return (
    <section className="box-selection" aria-labelledby="box-selection-title">
      <div className="drop-screen-heading">
        <div><p className="quiz-kicker">CURATED FOR YOUR KIND OF GOOD</p><h2 id="box-selection-title" tabIndex={-1}>Same you.<br />{' '}<span className="highlight-word">Different possibilities.</span></h2></div>
        <div className="box-heading-tools">
          <span className="drop-budget-tag">YOUR LIMIT <strong>{money(budget)}</strong></span>
          <div className="box-heading-actions">
            <ButtonLift><button className="secondary-button" type="button" onClick={onEdit}>Edit setup <IconGlyph name="arrowLeft" size={15} /></button></ButtonLift>
            <ButtonLift><button className="secondary-button" type="button" onClick={onRetake}>Retake quiz <IconGlyph name="refresh" size={15} /></button></ButtonLift>
          </div>
        </div>
      </div>
      <p className="panel-copy box-selection-copy">Pick your mix. Each box shows its price, item count, and clues.</p>
      {candidates.length > 0 ? <>
        {candidates.length < 3 && <p className="box-availability-note" role="status">{candidates.length === 1 ? 'One distinct box fits' : 'Two distinct boxes fit'} your budget and details today.</p>}
        <div className="box-options" ref={scrollerRef} onScroll={measureScroll} role="region" aria-label="Box choices">
          {candidates.map((box, index) => (
            <article className={`box-option theme-${box.theme}`} key={box.id}>
              <div className="box-option-top"><span>BOX {String(index + 1).padStart(2, '0')}</span><span>{openedDrops[box.id] ? 'OPENED' : `${box.itemCount} SEALED ${box.itemCount === 1 ? 'FIND' : 'FINDS'}`}</span></div>
              <ButtonLift block><button className="box-option-art" type="button" onClick={() => onChoose({ ...box, number: index + 1 })} aria-label={`${openedDrops[box.id] ? 'View' : 'Choose'} box ${index + 1}, ${box.label}, ${box.itemCount} ${box.itemCount === 1 ? 'find' : 'finds'}, ${money(box.total)}`}><span className="box-art-orbit" /><BoxModel number={String(index + 1).padStart(2, '0')} /><span className="box-count-sticker">{box.itemCount}<small>{box.itemCount === 1 ? 'FIND' : 'FINDS'}</small></span></button></ButtonLift>
              <div className="box-option-content">
                <div className="box-option-details">
                  <div className="box-name-price"><h3>{box.label}</h3><strong>{money(box.total)}</strong></div>
                  <p className="box-teaser">{box.teaser}</p>
                  <div className="box-category-tags">{box.categories.map(({ label, count }) => <span key={label}>{count} × {label}</span>)}</div>
                  <p className="box-palette">Primary colours <strong>{box.primaryColours.join(' · ') || 'A surprise'}</strong></p>
                  <details className="box-more-clues">
                    <summary>More clues <IconGlyph name="arrowRight" size={14} /></summary>
                    <dl className="box-clues">
                      <div><dt>Primary colours</dt><dd>{box.primaryColours.join(' · ') || 'A surprise'}</dd></div>
                      {box.secondaryColours.length > 0 && <div><dt>Secondary colours</dt><dd>{box.secondaryColours.join(' · ')}</dd></div>}
                      {box.materials.length > 0 && <div><dt>Clothing & accessory materials</dt><dd>{box.materials.join(' · ')}</dd></div>}
                    </dl>
                    <p className="box-fit-note"><IconGlyph name="sparkles" size={14} />{box.matchReasons.length ? `Touches of ${box.matchReasons.join(', ').toLowerCase()}.` : 'Selected within your budget and details.'}</p>
                    {box.nearbyCount > 0 && <p className="box-nearby-note">Includes {box.nearbyCount} nearby {box.nearbyCount === 1 ? 'match' : 'matches'} beyond your exact quiz signals.</p>}
                  </details>
                </div>
                <ButtonLift block><button type="button" className="primary-button box-choose" onClick={() => onChoose({ ...box, number: index + 1 })}>{openedDrops[box.id] ? 'View this box' : 'Choose this box'}<IconGlyph name="arrowUpRight" size={18} /></button></ButtonLift>
              </div>
            </article>
          ))}
        </div>
        {scrollState.overflow && <div className="box-scroll-control" aria-label="Browse box choices">
          <ButtonLift><button className="box-scroll-arrow" type="button" onClick={() => moveBoxes(-1)} disabled={scrollState.atStart} aria-label="Previous box"><IconGlyph name="arrowLeft" size={18} /></button></ButtonLift>
          <div className="box-scroll-main"><div className="box-scroll-label"><span>SLIDE TO EXPLORE</span><span>BOX {String(scrollState.first).padStart(2, '0')}–{String(Math.min(candidates.length, scrollState.first + scrollState.visible - 1)).padStart(2, '0')} / {String(candidates.length).padStart(2, '0')}</span></div><input type="range" min="0" max="100" value={scrollState.progress} onChange={scrubBoxes} aria-label="Scroll box choices" /></div>
          <ButtonLift><button className="box-scroll-arrow" type="button" onClick={() => moveBoxes(1)} disabled={scrollState.atEnd} aria-label="Next box"><IconGlyph name="arrowRight" size={18} /></button></ButtonLift>
        </div>}
        <p className="microcopy">Colour and material clues come from items inside each box. Some finds may appear in more than one option.</p>
      </> : <div className="boxes-empty"><IconGlyph name="search" size={48} /><h3>No box fits just yet.</h3><p>Try a higher budget or update your preferences to see more of the surplus shelf.</p><ButtonLift><button className="primary-button" type="button" onClick={onEdit}>Edit your setup<IconGlyph name="arrowRight" size={18} /></button></ButtonLift></div>}
    </section>
  );
}
