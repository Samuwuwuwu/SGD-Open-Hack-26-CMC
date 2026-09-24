import IconGlyph from './IconGlyph.jsx';
import ButtonLift from './ButtonLift.jsx';

function ProgressRail({ stages, currentStage, availableStages = [], onNavigate, isMatching }) {
  return (
    <aside className="journey-sidebar">
      <a className="brand-lockup" href="#main-viewport" aria-label="ROLLOVER, jump to content">
        <span className="brand-symbol" aria-hidden="true"><IconGlyph name="rotate" size={36} /></span>
        <div><h1>ROLLOVER</h1><span className="rail-label">The surplus arcade</span></div>
      </a>
      <nav className="progress-rail" aria-label="Drop journey">
        <ol>
          {stages.slice(1).map((label, index) => {
            const step = index + 1;
            const complete = step < currentStage;
            return (
              <li key={label}>
                <ButtonLift block>
                  <button
                    className={`rail-step ${step === currentStage ? 'active' : ''} ${complete ? 'complete' : ''}`}
                    type="button"
                    aria-current={step === currentStage ? 'step' : undefined}
                    disabled={isMatching || step === currentStage || !availableStages.includes(step)}
                    onClick={() => onNavigate(step)}
                  >
                    <span className="rail-number">{String(step).padStart(2, '0')}</span>
                    <span>{label}</span>
                    <span className="rail-indicator" aria-hidden="true">
                      <IconGlyph name={complete ? 'check' : step === currentStage ? 'playerPlay' : 'point'} size={complete || step === currentStage ? 16 : 14} />
                    </span>
                  </button>
                </ButtonLift>
              </li>
            );
          })}
        </ol>
      </nav>
      <div className="sidebar-gacha" aria-hidden="true">
        <span className="sidebar-gacha-label">GOOD FINDS, RE-ROLLED</span>
        <div className="sidebar-capsule-tray">
          <span className="sidebar-capsule capsule-cyan" />
          <span className="sidebar-capsule capsule-pink" />
          <span className="sidebar-capsule capsule-orange" />
        </div>
      </div>
    </aside>
  );
}

export default ProgressRail;
