import { useEffect, useRef, useState } from 'react';
import ButtonLift from '../../components/ButtonLift.jsx';
import IconGlyph from '../../components/IconGlyph.jsx';
import ItemArtwork from './ItemArtwork.jsx';
import { words } from './dropPresentation.js';
import useReducedMotion from './useReducedMotion.js';

export default function ItemPulls({ drop, revealedIds, onReveal, onSummary, onBack }) {
  const reducedMotion = useReducedMotion();
  const [revealAll, setRevealAll] = useState(false);
  const [shareMessage, setShareMessage] = useState('');
  const [sharing, setSharing] = useState(false);
  const buttons = useRef([]);
  const gridRef = useRef(null);
  const summaryButton = useRef(null);
  const focusTimer = useRef(null);
  const complete = drop.items.every((item) => revealedIds.includes(item.id));
  useEffect(() => () => window.clearTimeout(focusTimer.current), []);
  const reveal = (index) => {
    const ids = [...new Set([...revealedIds, drop.items[index].id])];
    onReveal(ids);
    window.clearTimeout(focusTimer.current);
    focusTimer.current = window.setTimeout(() => {
      const next = drop.items.findIndex((item) => !ids.includes(item.id));
      if (next < 0) summaryButton.current?.focus({ preventScroll: true });
      else {
        const button = buttons.current[next];
        button?.focus({ preventScroll: true });
        const grid = gridRef.current;
        if (button && grid) {
          const cardBounds = button.getBoundingClientRect();
          const gridBounds = grid.getBoundingClientRect();
          const above = cardBounds.top - gridBounds.top - 10;
          const below = cardBounds.bottom - gridBounds.bottom + 12;
          const offset = above < 0 ? above : below > 0 ? Math.min(above, below) : 0;
          if (offset) grid.scrollBy({ top: offset, behavior: reducedMotion ? 'instant' : 'smooth' });
        }
      }
    }, reducedMotion ? 0 : 650);
  };
  const openAll = () => {
    setRevealAll(true);
    onReveal(drop.items.map((item) => item.id));
    window.clearTimeout(focusTimer.current);
    focusTimer.current = window.setTimeout(() => summaryButton.current?.focus({ preventScroll: true }), reducedMotion ? 0 : 1250);
  };

  const shareHaul = async () => {
    if (sharing) return;
    setSharing(true);
    setShareMessage('Preparing your share card…');
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1350;
      const context = canvas.getContext('2d');
      context.fillStyle = '#f7f5ef';
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.fillStyle = '#ff2d9a';
      context.fillRect(0, 0, canvas.width, 32);
      context.fillStyle = '#111111';
      context.font = '800 30px Arial, sans-serif';
      context.fillText('ROLLOVER / THE SURPLUS ARCADE', 72, 104);
      context.font = '800 76px Arial, sans-serif';
      context.fillText('Good finds.', 72, 218);
      context.fillStyle = '#c8ff00';
      context.fillRect(68, 250, 810, 98);
      context.fillStyle = '#111111';
      context.fillText('Second life. Great finds.', 82, 322);
      context.font = '500 27px Arial, sans-serif';
      context.fillText(`${drop.items.length} pre-loved finds · ${drop.label}`, 72, 410);
      const palette = ['#00d8e8', '#c8ff00', '#ff2d9a', '#ff5b00'];
      drop.items.forEach((item, index) => {
        const y = 472 + index * 150;
        context.fillStyle = '#ffffff';
        context.fillRect(72, y, 936, 122);
        context.strokeStyle = '#111111';
        context.lineWidth = 5;
        context.strokeRect(72, y, 936, 122);
        context.fillStyle = palette[index % palette.length];
        context.fillRect(72, y, 18, 122);
        context.fillStyle = '#111111';
        context.font = '700 20px Arial, sans-serif';
        context.fillText(`FIND ${String(index + 1).padStart(2, '0')}  /  ${words(item.category).toUpperCase()}`, 116, y + 42);
        context.font = '700 32px Arial, sans-serif';
        const name = item.name.length > 40 ? `${item.name.slice(0, 37)}…` : item.name;
        context.fillText(name, 116, y + 88);
      });
      context.fillStyle = '#111111';
      context.font = '700 24px Arial, sans-serif';
      context.fillText('LESS WASTE. MORE GOOD FINDS.', 72, 1280);
      const image = await new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error('Could not create share image')), 'image/png'));
      const file = new File([image], 'my-rollover-haul.png', { type: 'image/png' });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'My ROLLOVER haul', text: 'Good finds. A second life, picked for me.' });
        setShareMessage('Share card sent.');
      } else {
        const link = document.createElement('a');
        link.href = URL.createObjectURL(image);
        link.download = 'my-rollover-haul.png';
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
        setShareMessage('Share card downloaded. Add it to WhatsApp, Instagram, or any app.');
      }
    } catch (error) {
      setShareMessage(error.name === 'AbortError' ? 'Sharing cancelled.' : 'Could not prepare the share card. Please try again.');
    } finally {
      setSharing(false);
    }
  };

  return (
    <section className={`item-pulls theme-${drop.theme} ${complete ? 'pulls-complete' : ''} ${revealAll ? 'pulls-reveal-all' : ''}`} aria-labelledby="pulls-title">
      <div className="drop-screen-heading"><div><p className="quiz-kicker">{drop.label} / THE REVEAL</p><h2 id="pulls-title" tabIndex={-1}>{complete ? <>Good finds.<br /><span className="highlight-word">All yours to explore.</span></> : <>The box is open.<br /><span className="highlight-word">Make your discoveries.</span></>}</h2></div><div className="pull-counter" role="status"><strong>{String(revealedIds.length).padStart(2, '0')}<span> / {String(drop.items.length).padStart(2, '0')}</span></strong><small>FINDS REVEALED</small></div></div>
      <p className="panel-copy">{complete ? 'Your whole mix, out in the open. Take a closer look at every find.' : 'Tap a sealed card to see what found you. The order is up to you.'}</p>
      <div className="item-pull-grid" ref={gridRef} role="region" aria-label="Your reveal cards" tabIndex={0}>
        {drop.items.map((item, index) => {
          const revealed = revealedIds.includes(item.id);
          return <div className={`item-pull-slot ${revealed ? 'is-revealed' : ''}`} key={item.id} style={{ '--pull-index': index, '--pull-colour': ['var(--cyan)', 'var(--lime)', 'var(--magenta)', 'var(--orange)'][index % 4] }}>
            <ButtonLift block><button ref={(node) => { buttons.current[index] = node; }} type="button" className="item-pull-button" onClick={() => { if (!revealed) reveal(index); }} aria-label={revealed ? `${item.name}, revealed` : `Reveal find ${index + 1} of ${drop.items.length}`} aria-pressed={revealed}>
              <span className="pull-flipper">
                <span className="pull-face pull-sealed" aria-hidden={revealed}><span className="pull-card-eyebrow">ROLLOVER / {String(index + 1).padStart(2, '0')}</span><span className="pull-seal-mark"><IconGlyph name="sparkles" size={52} /></span><strong>GOOD<br />THINGS<br />INSIDE.</strong><span className="pull-tap-label">TAP TO REVEAL <IconGlyph name="arrowUpRight" size={17} /></span></span>
                <span className="pull-face pull-discovered" aria-hidden={!revealed}>{revealed && <><span className="pull-card-eyebrow">FIND {String(index + 1).padStart(2, '0')}<IconGlyph name="check" size={16} /></span><ItemArtwork item={item} /><span className="pull-item-category">{words(item.category)}</span><strong className="pull-item-name">{item.name}</strong></>}</span>
              </span>
            </button></ButtonLift><span className="pull-pop" aria-hidden="true"><IconGlyph name="sparkles" size={36} /></span>
          </div>;
        })}
      </div>
      <div className="pull-completion" aria-live="polite">{complete && <><IconGlyph name="check" size={20} /><span>{drop.items.length} finds. One new chapter.</span></>}</div>
      <div className="drop-screen-actions"><ButtonLift><button className="secondary-button" type="button" onClick={onBack}><IconGlyph name="arrowLeft" size={18} />Back to boxes</button></ButtonLift>{complete && <ButtonLift><button className="secondary-button share-haul-button" type="button" onClick={shareHaul} disabled={sharing}><IconGlyph name="share" size={18} />{sharing ? 'Preparing…' : 'Share haul'}</button></ButtonLift>}{complete ? <ButtonLift><button ref={summaryButton} className="primary-button" type="button" onClick={onSummary}>View your haul<IconGlyph name="arrowRight" size={18} /></button></ButtonLift> : <ButtonLift><button className="primary-button" type="button" onClick={openAll}>Reveal all<IconGlyph name="sparkles" size={18} /></button></ButtonLift>}</div>
      {shareMessage && <p className="share-haul-status" role="status">{shareMessage}</p>}
    </section>
  );
}
