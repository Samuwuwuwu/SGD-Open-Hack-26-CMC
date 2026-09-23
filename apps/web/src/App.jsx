import { useEffect, useState } from 'react';
import ProgressRail from './components/ProgressRail.jsx';
import { preferenceOptions } from './data/preferenceOptions.js';
import StartPanel from './features/onboarding/StartPanel.jsx';
import PreferencePanel from './features/preferences/PreferencePanel.jsx';
import DropCandidates from './features/drops/DropCandidates.jsx';
import { createPreferenceSession, getApiHealth, getDemoInventory, matchDrops } from './services/api.js';

const stages = ['Start', 'Budget', 'Preferences', 'Matching', 'Drops', 'Reveal'];

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

  useEffect(() => {
    Promise.all([getApiHealth(), getDemoInventory()])
      .then(([, inventory]) => setApiState({ status: 'connected', inventoryCount: inventory.items.length }))
      .catch(() => setApiState({ status: 'offline', inventoryCount: 0 }));
  }, []);

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

  return (
    <main className="app-shell">
      <div className="ambient-orb ambient-orb-left" />
      <div className="ambient-orb ambient-orb-right" />
      <section className="prototype-frame" aria-label="ROLLOVER prototype">
        <header className="topbar">
          <div className="brand-lockup">
            <span className="brand-mark">ROLL</span>
            <div><p className="eyebrow">Circular retail, made personal</p><h1>ROLLOVER</h1></div>
          </div>
          <div className={`api-pill api-${apiState.status}`}><span className="status-dot" />
            {apiState.status === 'connected' ? `Demo inventory · ${apiState.inventoryCount} items` : apiState.status === 'checking' ? 'Connecting to demo API' : 'API unavailable'}
          </div>
        </header>

        <div className="journey-layout">
          <ProgressRail stages={stages} currentStage={stage} />
          <div className="content-column">
            <div className="content-intro">
              <p className="eyebrow">A better kind of surprise</p>
              <h2>Find a surplus drop that feels like you.</h2>
              <p className="intro-copy">Tell us what matters today. We will use the available inventory, your budget, and your explicit signals to shape a few options — never a forced identity.</p>
            </div>

            {error && <div className="error-banner" role="alert">{error}</div>}
            {stage === 0 && <StartPanel onStart={() => setStage(1)} />}

            {stage === 1 && (
              <section className="journey-panel">
                <div className="panel-kicker">01 / Your range</div>
                <h3>What feels comfortable for this drop?</h3>
                <p className="panel-copy">A clear budget keeps the match useful, not wishful.</p>
                <div className="budget-readout"><span>$</span>{budget}</div>
                <input aria-label="Drop budget" className="budget-slider" type="range" min="10" max="150" step="5" value={budget} onChange={(event) => setBudget(Number(event.target.value))} />
                <div className="range-labels"><span>$10</span><span>$150</span></div>
                <button className="primary-button" type="button" onClick={() => setStage(2)}>Set my range <span>→</span></button>
              </section>
            )}

            {stage === 2 && <PreferencePanel options={preferenceOptions} preferences={preferences} constraints={constraints} onPreferencesChange={setPreferences} onConstraintsChange={setConstraints} onSubmit={findDrops} />}

            {stage === 3 && (
              <section className="journey-panel matching-panel">
                <div className="matching-pulse"><span /><span /><span /></div>
                <div className="panel-kicker">03 / Matching</div>
                <h3>Reading the room, not boxing you in.</h3>
                <p className="panel-copy">We are checking live demo stock against your range and signals.</p>
                <div className="matching-status">{isMatching ? 'Building your shortlist…' : 'Shortlist ready'}</div>
              </section>
            )}

            {stage === 4 && <DropCandidates candidates={candidates} onReveal={(drop) => { setSelectedDrop(drop); setStage(5); }} onBack={() => setStage(2)} />}

            {stage === 5 && selectedDrop && (
              <section className="journey-panel reveal-panel">
                <div className="panel-kicker">05 / Reveal</div>
                <span className="reveal-stamp">A considered surprise</span>
                <h3>{selectedDrop.name}</h3>
                <p className="panel-copy">From {selectedDrop.partner} · {selectedDrop.category}</p>
                <div className="reveal-product">
                  <div className="product-art" aria-hidden="true">{selectedDrop.category === 'fashion' ? '✦' : selectedDrop.category === 'food' ? '◌' : '◒'}</div>
                  <div><p className="product-price">${selectedDrop.availablePrice}</p><p>{selectedDrop.description}</p></div>
                </div>
                <div className="reveal-actions"><button className="primary-button" type="button" onClick={() => setStage(4)}>Choose another <span>↗</span></button><button className="text-button" type="button" onClick={() => setStage(0)}>Start over</button></div>
              </section>
            )}
          </div>
        </div>
        <footer className="footer-note">Synthetic demo inventory · Explicit signals only · No fulfilment yet</footer>
      </section>
    </main>
  );
}

export default App;
