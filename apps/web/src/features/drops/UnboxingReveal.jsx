import { useEffect, useRef, useState } from 'react';
import DropReveal from './DropReveal.jsx';

const ANIMATION_DURATION = 2300;

function UnboxingReveal({ box, drop, error, alreadyOpened, onRetry, onBack, revealProps }) {
  const revealRef = useRef(null);
  const [animationDone, setAnimationDone] = useState(() =>
    alreadyOpened || window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );

  useEffect(() => {
    if (animationDone) return undefined;
    const timer = window.setTimeout(() => setAnimationDone(true), ANIMATION_DURATION);
    return () => window.clearTimeout(timer);
  }, [animationDone]);

  useEffect(() => {
    if (animationDone && drop) revealRef.current?.querySelector('h2')?.focus({ preventScroll: true });
  }, [animationDone, drop]);

  if (error) {
    return (
      <section className="unboxing-error" role="alert">
        <div className="unboxing-error-icon" aria-hidden="true">?</div>
        <h2>Box {String(box.number).padStart(2, '0')} hit a snag.</h2>
        <p>{error}</p>
        <div className="unboxing-actions">
          <button className="primary-button" type="button" onClick={onRetry}>Try opening again</button>
          <button className="secondary-button" type="button" onClick={onBack}>Back to boxes</button>
        </div>
      </section>
    );
  }

  if (animationDone && drop) {
    return <div className="unboxing-complete" ref={revealRef}><DropReveal drop={drop} {...revealProps} onSwap={onBack} /></div>;
  }

  return (
    <section className="unboxing-stage" aria-label={`Opening box ${box.number}`}>
      <div className="unboxing-copy" role="status" aria-live="polite">
        <p className="quiz-kicker">DIGITAL UNBOXING</p>
        <h2>Opening <span className="highlight-word">box {String(box.number).padStart(2, '0')}.</span></h2>
        <p className="panel-copy">{animationDone ? 'Checking that your drop is ready…' : 'A little suspense. Your exact find is coming up.'}</p>
      </div>
      <div className="unboxing-scene" aria-hidden="true">
        <span className="unboxing-ray unboxing-ray-one" />
        <span className="unboxing-ray unboxing-ray-two" />
        <span className="unboxing-ray unboxing-ray-three" />
        <div className={`unboxing-box unboxing-box-${(box.number - 1) % 5}`}>
          <span className="unboxing-lid" />
          <span className="unboxing-body">?</span>
          <span className="unboxing-spark unboxing-spark-one">✦</span>
          <span className="unboxing-spark unboxing-spark-two">✳</span>
          <span className="unboxing-spark unboxing-spark-three">✦</span>
        </div>
      </div>
      <div className="unboxing-actions">
        {!animationDone && <button className="secondary-button" type="button" onClick={() => setAnimationDone(true)}>Skip animation</button>}
        <button className="secondary-button" type="button" onClick={onBack}>Back to boxes</button>
      </div>
    </section>
  );
}

export default UnboxingReveal;
