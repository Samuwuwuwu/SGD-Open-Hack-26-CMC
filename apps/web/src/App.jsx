import { useEffect, useRef, useState } from 'react';
import ProgressRail from './components/ProgressRail.jsx';
import { preferenceOptions } from './data/preferenceOptions.js';
import StartPanel from './features/onboarding/StartPanel.jsx';
import PreferencePanel from './features/preferences/PreferencePanel.jsx';
import DropCandidates from './features/drops/DropCandidates.jsx';
import DropReveal from './features/drops/DropReveal.jsx';
import { createPreferenceSession, getApiHealth, getDemoInventory, matchDrops } from './services/api.js';

const stages = ['Start', 'Range', 'Vibe', 'Match', 'Drops', 'Reveal'];

function App() {
  const [stage, setStage] = useState(0);
  const [budget, setBudget] = useState(60);
  const [preferences, setPreferences] = useState(['practical']);
  const [constraints, setConstraints] = useState({ size: 'M', dietary: 'any' });
  const [candidates, setCandidates] = useState([]);
  const [selectedDrop, setSelectedDrop] = useState(null);
  const [apiState, setApiState] = useState({ status: 'checking', inventoryCount: 0 });
  const [error, setError] = useState('');
  const [isMatching, setIsMatching] = useState(false);
  const [claimedDropId, setClaimedDropId] = useState(null);
  const viewportRef = useRef(null);
  const previousStage = useRef(stage);

  useEffect(() => {
    Promise.all([getApiHealth(), getDemoInventory()])
      .then(([, inventory]) => setApiState({ status: 'connected', inventoryCount: inventory.items.length }))
      .catch(() => setApiState({ status: 'offline', inventoryCount: 0 }));
  }, []);

  useEffect(() => {
    if (previousStage.current !== stage) {
      const viewport = viewportRef.current;
      viewport?.focus({ preventScroll: true });
      if (viewport && viewport.getBoundingClientRect().top < 0) viewport.scrollIntoView({ block: 'start' });
      previousStage.current = stage;
    }
  }, [stage]);

  const findDrops = async () => {
    setError('');
    setIsMatching(true);
    setStage(3);
    try {
      await createPreferenceSession({ budget, preferences, constraints });
      const result = await matchDrops({ budget, preferences, constraints });
      setCandidates(result.candidates);
      setStage(4);
    } catch (requestError) {
      setError(requestError.message);
      setStage(2);
    } finally {
      setIsMatching(false);
    }
  };

  const nextAction = stage === 2 ? findDrops : () => setStage(stage + 1);
  const nextLabel = stage === 0 ? 'Start my drop' : stage === 2 ? 'Find my drops' : 'Next stage';

  return (
    <main className="app-shell">
      <section className="prototype-frame" aria-label="ROLLOVER Gacha Arcade">
        <header className="window-titlebar">
          <div className="window-dots" aria-hidden="true"><span /><span /><span /></div>
          <div className={`address-bar api-${apiState.status}`} role="status">
            <span className="status-dot" aria-hidden="true" />
            {apiState.status === 'connected' ? `API Connected · ${apiState.inventoryCount} items` : apiState.status === 'checking' ? 'Connecting to inventory…' : 'API unavailable'}
          </div>
          <span className="window-controls" aria-hidden="true">— □ ×</span>
        </header>
        <div className="window-interior">
          <ProgressRail stages={stages} currentStage={stage} onNavigate={setStage} isMatching={isMatching} apiState={apiState} />
          <div className="viewport-stack">
            <div className="viewport-toolbar"><span>{stage === 0 ? 'Your next good find' : `${String(stage).padStart(2, '0')} / ${stages[stage]}`}</span><span aria-hidden="true">✦</span></div>
            <div className="main-viewport" id="main-viewport" ref={viewportRef} tabIndex={-1} aria-label={`${stages[stage]} stage`}>
              {error && <div className="error-banner" role="alert">{error}</div>}
              {stage === 0 && <StartPanel onStart={() => setStage(1)} />}
              {stage === 1 && (
                <section className="journey-panel budget-panel">
                  <h2>Big finds.<br /><span className="highlight-word">Your budget.</span></h2>
                  <p className="panel-copy">Set your limit. Every drop will stay within it.</p>
                  <div className="budget-console">
                    <label className="rail-label" htmlFor="drop-budget">Your spending limit</label>
                    <output className="budget-readout" htmlFor="drop-budget">${budget}</output>
                    <input id="drop-budget" aria-label="Drop budget" className="budget-slider" type="range" min="10" max="150" step="5" value={budget} onChange={(event) => setBudget(Number(event.target.value))} />
                    <div className="range-labels"><span>$10</span><span>$150</span></div>
                  </div>
                </section>
              )}
              {stage === 2 && <PreferencePanel options={preferenceOptions} preferences={preferences} constraints={constraints} onPreferencesChange={setPreferences} onConstraintsChange={setConstraints} />}
              {stage === 3 && (
                <section className="matching-panel" role="status" aria-live="polite" aria-busy={isMatching}>
                  <div className="radar-screen" aria-hidden="true"><div className="radar-ring"><span className="radar-sweep" /><span className="radar-pip" /><span className="radar-center">✦</span></div></div>
                  <h2>Reading the room…</h2>
                  <p className="panel-copy">Checking available stock against your budget and signals.</p>
                </section>
              )}
              {stage === 4 && <DropCandidates candidates={candidates} onReveal={(drop) => { setSelectedDrop(drop); setStage(5); }} />}
              {stage === 5 && selectedDrop && <DropReveal drop={selectedDrop} budget={budget} preferences={preferences} preferenceOptions={preferenceOptions} claimed={claimedDropId === selectedDrop.id} onClaim={() => setClaimedDropId(selectedDrop.id)} onSwap={() => setStage(4)} />}
            </div>
          </div>
        </div>
      </section>
      <nav className="bottom-dock" aria-label="Stage controls">
        <div className="dock-accent"><span className="dock-coin" aria-hidden="true">↺</span></div>
        <div className="dock-controls">
          <div className="dock-budget"><span>Budget</span><strong>${budget}</strong></div>
          {stage === 1 && <button className="secondary-button" type="button" onClick={() => setStage(0)}>Back ←</button>}
          {stage === 2 && <button className="secondary-button" type="button" onClick={() => setStage(1)}>Edit range ←</button>}
          {stage <= 2 && <button className="primary-button dock-next" type="button" onClick={nextAction}>{nextLabel} <span aria-hidden="true">→</span></button>}
          {stage === 3 && <span className="dock-status" role="status">Finding your drops…</span>}
          {stage === 4 && <button className="secondary-button" type="button" onClick={() => setStage(2)}>Adjust signals ←</button>}
          {stage === 5 && <button className="secondary-button" type="button" onClick={() => setStage(0)}>Start over ↺</button>}
        </div>
      </nav>
      <p className="desktop-footer">Demo inventory · No payment or fulfilment</p>
    </main>
  );
}

export default App;
