import IconGlyph from '../../components/IconGlyph.jsx';
import ButtonLift from '../../components/ButtonLift.jsx';

function StartPanel({ onStart }) {
  return (
    <section className="start-panel">
      <div className="welcome-composition">
        <div className="welcome-copy">
          <h2><span className="welcome-heading-line">Good stuff.</span><br /><span className="highlight-word">New game.</span></h2>
          <p className="panel-copy">Give surplus a second chance. Set your range, tune your vibe, and discover a drop that feels like you.</p>
          <ButtonLift><button className="primary-button" type="button" onClick={onStart}>Start my drop <IconGlyph name="arrowUpRight" size={20} /></button></ButtonLift>
        </div>
        <div className="welcome-art" aria-hidden="true">
          <span className="art-sparkle sparkle-one"><IconGlyph name="sparkles" size={42} /></span>
          <div className="gacha-machine">
            <div className="machine-header">ROLLOVER <IconGlyph name="sparkles" size={14} /></div>
            <div className="machine-glass"><span className="capsule capsule-one"><IconGlyph name="sparkles" size={30} /></span><span className="capsule capsule-two"><IconGlyph name="circleDot" size={30} /></span><span className="capsule capsule-three"><IconGlyph name="circleHalf" size={30} /></span></div>
            <div className="machine-controls"><span className="machine-dial"><IconGlyph name="rotate" size={32} /></span><span className="machine-slot" /></div>
            <div className="machine-tray" />
          </div>
          <div className="art-sticker">SURPLUS<br /><span><IconGlyph name="arrowRight" size={14} /> SURPRISE</span></div>
          <span className="art-sparkle sparkle-two"><IconGlyph name="sparkles" size={32} /></span>
        </div>
      </div>
    </section>
  );
}

export default StartPanel;
