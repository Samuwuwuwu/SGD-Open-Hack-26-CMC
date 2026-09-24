import { useEffect, useState } from 'react';
import ButtonLift from '../../components/ButtonLift.jsx';
import IconGlyph from '../../components/IconGlyph.jsx';
import BoxModel from './BoxModel.jsx';
import useReducedMotion from './useReducedMotion.js';

export default function BoxOpening({ box, drop, error, onComplete, onRetry, onBack }) {
  const reducedMotion = useReducedMotion();
  const [finished, setFinished] = useState(reducedMotion);
  useEffect(() => {
    if (reducedMotion) { setFinished(true); return undefined; }
    const timer = window.setTimeout(() => setFinished(true), 2800);
    return () => window.clearTimeout(timer);
  }, [reducedMotion]);
  useEffect(() => {
    if (finished && drop && !error) onComplete();
  }, [finished, drop, error, onComplete]);

  return (
    <section className={`box-opening theme-${box.theme} ${finished ? 'opening-finished' : ''}`} aria-labelledby="opening-title">
      <div className="opening-heading"><p className="quiz-kicker">BOX {String(box.number).padStart(2, '0')} / {box.label}</p><h2 id="opening-title" tabIndex={-1}>Let the good<br /><span className="highlight-word">stuff out.</span></h2></div>
      <div className="opening-theatre" aria-hidden="true">
        <span className="theatre-coordinate coordinate-top">UNPACK THE UNEXPECTED ↗</span>
        <div className="opening-orbit orbit-one" /><div className="opening-orbit orbit-two" />
        <div className="opening-floor" /><div className="opening-shadow" />
        <div className="opening-rig"><BoxModel number={String(box.number).padStart(2, '0')} /></div>
        <div className="opening-confetti">{Array.from({ length: 12 }, (_, i) => <span key={i} style={{ '--angle': `${i * 30}deg`, '--particle': i }} />)}</div>
        <span className="opening-stamp">GOOD<br />INCOMING.</span>
        <span className="theatre-coordinate coordinate-bottom">{box.itemCount} FINDS / ONE FRESH START</span>
      </div>
      {error ? <div className="opening-error" role="alert"><h3>The box hit a snag.</h3><p>{error}</p><ButtonLift><button className="primary-button" type="button" onClick={onRetry}>Try again<IconGlyph name="refresh" size={18} /></button></ButtonLift></div> : <div className="opening-status" role="status"><span className="opening-meter"><span /></span><p>{finished ? 'Getting your finds ready…' : 'A little suspense. A new beginning.'}</p></div>}
      <div className="drop-screen-actions"><ButtonLift><button className="secondary-button" type="button" onClick={onBack}><IconGlyph name="arrowLeft" size={18} />Back to boxes</button></ButtonLift>{!finished && !error && <ButtonLift><button className="secondary-button" type="button" onClick={() => setFinished(true)}>Skip opening<IconGlyph name="playerPlay" size={18} /></button></ButtonLift>}</div>
    </section>
  );
}
