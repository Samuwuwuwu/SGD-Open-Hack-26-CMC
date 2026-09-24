import { useEffect, useRef, useState } from 'react';
import ButtonLift from './components/ButtonLift.jsx';
import ProgressRail from './components/ProgressRail.jsx';
import IconGlyph from './components/IconGlyph.jsx';
import StartPanel from './features/onboarding/StartPanel.jsx';
import PreferencePanel from './features/preferences/PreferencePanel.jsx';
import BoxCandidates from './features/drops/BoxCandidates.jsx';
import BoxOpening from './features/drops/BoxOpening.jsx';
import ItemPulls from './features/drops/ItemPulls.jsx';
import HaulSummary from './features/drops/HaulSummary.jsx';
import { createPreferenceSession, getQuizQuestion, matchDrops, revealDrop } from './services/api.js';

const stages = ['Start', 'Who', 'Budget', 'Category', 'Quiz', 'Boxes', 'Reveal', 'Summary'];
const screenStages = { start: 0, who: 1, range: 2, category: 3, quiz: 4, matching: 4, boxes: 5, opening: 6, pulls: 6, haul: 6, summary: 7 };
const categoryOptions = [
  ['fashion', 'FASHION'], ['cosmetics', 'BEAUTY'], ['food', 'FOOD + DRINK'],
  ['lifestyle', 'LIFESTYLE'], ['home goods', 'HOME'], ['electronics', 'TECH'], ['stationery', 'STATIONERY'],
];

function App() {
  const [screen, setScreen] = useState('start');
  const [budget, setBudget] = useState(60);
  const [recipientMode, setRecipientMode] = useState('self');
  const [preferences, setPreferences] = useState([]);
  const [constraints, setConstraints] = useState({ size: 'M', dietary: 'any', categories: [], conditionMode: 'new_only' });
  const [quizTopic, setQuizTopic] = useState('');
  const [quizFilters, setQuizFilters] = useState([]);
  const [quizHistory, setQuizHistory] = useState([]);
  const [quizQuestion, setQuizQuestion] = useState(null);
  const [quizRemaining, setQuizRemaining] = useState(0);
  const [quizAvailable, setQuizAvailable] = useState(0);
  const [quizLoading, setQuizLoading] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [matchPayload, setMatchPayload] = useState(null);
  const [selectedBox, setSelectedBox] = useState(null);
  const [openedDrops, setOpenedDrops] = useState({});
  const [revealedItems, setRevealedItems] = useState({});
  const [claimedIds, setClaimedIds] = useState([]);
  const [revealError, setRevealError] = useState('');
  const [openingAttempt, setOpeningAttempt] = useState(0);
  const [error, setError] = useState('');
  const viewportRef = useRef(null);
  const previousScreen = useRef(screen);
  const quizRequest = useRef(0);
  const revealRequest = useRef(0);
  const stage = screenStages[screen];
  const selectedDrop = selectedBox ? openedDrops[selectedBox.id] : null;
  const revealedIds = selectedBox ? revealedItems[selectedBox.id] || [] : [];
  const allRevealed = selectedDrop && selectedDrop.items.every((item) => revealedIds.includes(item.id));

  useEffect(() => {
    if (previousScreen.current !== screen) {
      const viewport = viewportRef.current;
      // Keep card flips in place when the last card completes the haul.
      if (!(previousScreen.current === 'pulls' && screen === 'haul')) {
        viewport?.scrollTo({ top: 0 });
        (viewport?.querySelector('h2[tabindex]') || viewport)?.focus({ preventScroll: true });
        if (viewport && viewport.getBoundingClientRect().top < 0) viewport.scrollIntoView({ block: 'start' });
      }
      previousScreen.current = screen;
    }
  }, [screen]);

  const clearDrops = () => {
    revealRequest.current += 1;
    setCandidates([]);
    setMatchPayload(null);
    setSelectedBox(null);
    setOpenedDrops({});
    setRevealedItems({});
    setClaimedIds([]);
    setRevealError('');
  };

  const resetQuiz = () => {
    quizRequest.current += 1;
    setQuizTopic('');
    setQuizFilters([]);
    setQuizHistory([]);
    setQuizQuestion(null);
    setQuizRemaining(0);
    setQuizAvailable(0);
    setQuizLoading(false);
    setPreferences([]);
    setError('');
    clearDrops();
  };

  const findDrops = async (filters, preferenceTags, requestId) => {
    setError('');
    clearDrops();
    setScreen('matching');
    const payload = { recipientMode, budget, preferences: preferenceTags, constraints, quizFilters: filters };
    try {
      await createPreferenceSession(payload);
      if (requestId !== quizRequest.current) return;
      const result = await matchDrops(payload);
      if (requestId !== quizRequest.current) return;
      setCandidates(result.candidates);
      setMatchPayload(payload);
      setScreen('boxes');
    } catch (requestError) {
      if (requestId !== quizRequest.current) return;
      setError(requestError.message);
      setScreen('quiz');
    }
  };

  const loadQuestion = async (topic, filters, preferenceTags = preferences, history = quizHistory) => {
    const requestId = ++quizRequest.current;
    setError('');
    setQuizLoading(true);
    setQuizQuestion(null);
    try {
      const result = await getQuizQuestion({ recipientMode, topic, budget, constraints, quizFilters: filters, quizHistory: history });
      if (requestId !== quizRequest.current) return;
      setQuizRemaining(result.remainingCount || 0);
      setQuizAvailable(result.availableCount || 0);
      if (result.done) await findDrops(filters, preferenceTags, requestId);
      else setQuizQuestion(result);
    } catch (requestError) {
      if (requestId === quizRequest.current) setError(requestError.message);
    } finally {
      if (requestId === quizRequest.current) setQuizLoading(false);
    }
  };

  const chooseTopic = (topic) => {
    clearDrops();
    setQuizTopic(topic);
    setQuizFilters([]);
    setQuizHistory([]);
    setPreferences([]);
    loadQuestion(topic, [], [], []);
  };

  const answerQuestion = (option) => {
    if (quizLoading) return;
    const nextFilters = [...quizFilters, option.tags];
    const nextPreferences = [...new Set([...preferences, ...option.tags])];
    const nextHistory = quizQuestion
      ? [...quizHistory, { question: quizQuestion.question, answers: quizQuestion.options.map((answer) => answer.label) }]
      : quizHistory;
    setQuizFilters(nextFilters);
    setQuizHistory(nextHistory);
    setPreferences(nextPreferences);
    loadQuestion(quizTopic, nextFilters, nextPreferences, nextHistory);
  };

  const updateConstraints = (next) => {
    setConstraints(next);
    resetQuiz();
  };

  const toggleCategory = (category) => {
    const categories = constraints.categories.includes(category)
      ? constraints.categories.filter((item) => item !== category)
      : [...constraints.categories, category];
    updateConstraints({ ...constraints, categories });
  };

  const requestReveal = async (box) => {
    const requestId = ++revealRequest.current;
    setRevealError('');
    try {
      const drop = await revealDrop({ ...matchPayload, id: box.id });
      if (requestId !== revealRequest.current) return;
      setOpenedDrops((previous) => ({ ...previous, [box.id]: drop }));
    } catch (requestError) {
      if (requestId === revealRequest.current) setRevealError(requestError.message);
    }
  };

  const chooseBox = (box) => {
    revealRequest.current += 1;
    setSelectedBox(box);
    setRevealError('');
    const previous = openedDrops[box.id];
    if (previous) {
      const complete = previous.items.every((item) => (revealedItems[box.id] || []).includes(item.id));
      setScreen(complete ? 'summary' : 'pulls');
      return;
    }
    setOpeningAttempt((attempt) => attempt + 1);
    setScreen('opening');
    requestReveal(box);
  };

  const backToBoxes = () => {
    revealRequest.current += 1;
    setRevealError('');
    setScreen('boxes');
  };

  const showReveals = (ids) => {
    setRevealedItems((previous) => ({ ...previous, [selectedBox.id]: ids }));
    if (ids.length === selectedDrop.items.length) setScreen('haul');
  };

  const replayOpening = () => {
    setOpeningAttempt((attempt) => attempt + 1);
    setScreen('opening');
  };

  const navigateToStage = (nextStage) => {
    if (nextStage >= 1 && nextStage <= 3) {
      quizRequest.current += 1;
      revealRequest.current += 1;
      setQuizLoading(false);
      setScreen(['', 'who', 'range', 'category'][nextStage]);
    } else if (nextStage === 4) {
      resetQuiz();
      setScreen('quiz');
    } else if (nextStage === 5) backToBoxes();
    else if (nextStage === 6 && selectedDrop) setScreen(allRevealed ? 'haul' : 'pulls');
    else if (nextStage === 7 && allRevealed) setScreen('summary');
  };
  const availableStages = [
    ...(stage > 0 ? [1, 2, 3, 4] : []),
    ...(matchPayload ? [5] : []),
    ...(selectedDrop ? [6] : []),
    ...(allRevealed ? [7] : []),
  ];

  return (
    <main className="app-shell">
      <section className={`prototype-frame expanded-window shell--${screen === 'start' ? 'landing' : 'experience'}`} aria-label="ROLLOVER Gacha Arcade">
        <header className="window-titlebar">
          <div className="window-dots" aria-hidden="true"><span /><span /><span /></div>
          <span className="window-controls" aria-hidden="true"><IconGlyph name="minus" size={16} /><IconGlyph name="square" size={15} /><IconGlyph name="close" size={17} /></span>
        </header>
        <div className="window-interior">
          <ProgressRail stages={stages} currentStage={stage} availableStages={availableStages} onNavigate={navigateToStage} isMatching={screen === 'matching' || quizLoading} />
          <div className="viewport-stack">
            <div className={`main-viewport ${!['start', 'matching', 'boxes'].includes(screen) ? 'has-viewport-actions' : ''} ${screen === 'quiz' ? 'is-quiz' : ''} ${screen === 'category' ? 'is-category' : ''} ${screen === 'boxes' ? 'is-box-selection' : ''} ${['pulls', 'haul'].includes(screen) ? 'is-item-pulls' : ''} ${screen === 'summary' ? 'is-haul-summary' : ''}`} id="main-viewport" ref={viewportRef} tabIndex={-1} aria-label={`${screen} stage`}>
              {error && <div className="error-banner" role="alert">{error}</div>}
              {screen === 'start' && <StartPanel onStart={() => setScreen('who')} />}
              {screen === 'who' && <section className="journey-panel budget-panel">
                <p className="quiz-kicker">FIRST UP</p>
                <h2>Who are we <span className="highlight-word">rolling for?</span></h2>
                <p className="panel-copy">The quiz wording can follow the person on the other side of the drop.</p>
                <div className="range-controls"><div className="range-control-block"><div className="range-choice-grid">
                  {[['self', 'FOR ME'], ['gift', 'SOMEONE ELSE']].map(([value, label]) =>
                    <ButtonLift key={value}><button className={`choice-chip ${recipientMode === value ? 'selected' : ''}`} type="button" onClick={() => { setRecipientMode(value); resetQuiz(); }} aria-pressed={recipientMode === value}>
                      <span>{label}</span><span className="choice-check">{recipientMode === value ? '✓' : ''}</span>
                    </button></ButtonLift>)}
                </div></div></div>
              </section>}
              {screen === 'range' && <section className="journey-panel budget-panel">
                <p className="quiz-kicker">STEP TWO</p>
                <h2>Big finds.<br /><span className="highlight-word">Your budget.</span></h2>
                <p className="panel-copy">Set your limit. Every box will stay within it.</p>
                <div className="budget-console">
                  <label className="rail-label" htmlFor="drop-budget">Your spending limit</label>
                  <output className="budget-readout" htmlFor="drop-budget">${budget}</output>
                  <input id="drop-budget" aria-label="Drop budget" className="budget-slider" type="range" min="10" max="150" step="5" value={budget} onChange={(event) => { setBudget(Number(event.target.value)); resetQuiz(); }} />
                  <div className="range-labels"><span>$10</span><span>$150</span></div>
                </div>
              </section>}
              {screen === 'category' && <section className="journey-panel budget-panel">
                <p className="quiz-kicker">STEP THREE</p>
                <h2>Shape the <span className="highlight-word">mix.</span></h2>
                <p className="panel-copy">Choose what can show up, then let the quiz do the softer matching.</p>
                <div className="range-controls">
                  <div className="range-control-block"><p className="rail-label">WHAT SHOULD BE IN THE MIX?</p><div className="range-choice-grid category-choice-grid">
                    <ButtonLift><button className={`choice-chip ${constraints.categories.length === 0 ? 'selected' : ''}`} type="button" onClick={() => updateConstraints({ ...constraints, categories: [] })} aria-pressed={constraints.categories.length === 0}>
                      <span>ANYTHING</span><span className="choice-check">{constraints.categories.length === 0 ? '✓' : ''}</span>
                    </button></ButtonLift>
                    {categoryOptions.map(([value, label]) => { const selected = constraints.categories.includes(value); return <ButtonLift key={value}><button className={`choice-chip ${selected ? 'selected' : ''}`} type="button" onClick={() => toggleCategory(value)} aria-pressed={selected}>
                      <span>{label}</span><span className="choice-check">{selected ? '✓' : ''}</span>
                    </button></ButtonLift>; })}
                  </div></div>
                  <div className="range-control-block"><p className="rail-label">OPEN TO PRE-LOVED?</p><div className="range-choice-grid">
                    {[['new_only', 'NEW ONLY'], ['allow_preloved', 'YES, MIX IT IN']].map(([value, label]) => <ButtonLift key={value}><button className={`choice-chip ${constraints.conditionMode === value ? 'selected' : ''}`} type="button" onClick={() => updateConstraints({ ...constraints, conditionMode: value })} aria-pressed={constraints.conditionMode === value}>
                      <span>{label}</span><span className="choice-check">{constraints.conditionMode === value ? '✓' : ''}</span>
                    </button></ButtonLift>)}
                  </div></div>
                  <div className="constraint-panel"><p className="rail-label">SIZE IF RELEVANT · FOOD PREFERENCE</p><div className="constraint-grid">
                    <label>Size, if relevant<select value={constraints.size} onChange={(event) => updateConstraints({ ...constraints, size: event.target.value })}>
                      <option value="any">Any size</option><option value="S">Small</option><option value="M">Medium</option><option value="L">Large</option>
                    </select></label>
                    <label>Food preference, if relevant<select value={constraints.dietary} onChange={(event) => updateConstraints({ ...constraints, dietary: event.target.value })}>
                      <option value="any">No restriction</option><option value="vegetarian">Vegetarian</option><option value="vegan">Vegan</option>
                    </select></label>
                  </div></div>
                </div>
              </section>}
              {screen === 'quiz' && <>
                <PreferencePanel topic={quizTopic} question={quizQuestion} remainingCount={quizRemaining} availableCount={quizAvailable} isLoading={quizLoading} recipientMode={recipientMode}
                  onChooseTopic={chooseTopic} onAnswer={answerQuestion} onResetTopic={resetQuiz} />
                {error && quizTopic && !quizLoading && <ButtonLift><button className="primary-button" type="button" onClick={() => loadQuestion(quizTopic, quizFilters)}>Try again<IconGlyph name="refresh" size={18} /></button></ButtonLift>}
              </>}
              {screen === 'matching' && <section className="matching-panel" role="status" aria-live="polite" aria-busy="true">
                <div className="radar-screen" aria-hidden="true"><div className="radar-ring"><span className="radar-sweep" /><span className="radar-pip" /><span className="radar-center"><IconGlyph name="sparkles" size={24} /></span></div></div>
                <h2>Finding your combinations&hellip;</h2><p className="panel-copy">A few different ways to give good things a second chance.</p>
              </section>}
              {screen === 'boxes' && <BoxCandidates candidates={candidates} budget={budget} openedDrops={openedDrops} onChoose={chooseBox} onEdit={() => navigateToStage(3)} onRetake={() => navigateToStage(4)} />}
              {screen === 'opening' && selectedBox && <BoxOpening key={`${selectedBox.id}-${openingAttempt}`} box={selectedBox} drop={selectedDrop} error={revealError}
                onComplete={() => setScreen(allRevealed ? 'haul' : 'pulls')} onBack={backToBoxes}
                onRetry={() => { setOpeningAttempt((attempt) => attempt + 1); requestReveal(selectedBox); }} />}
              {['pulls', 'haul'].includes(screen) && selectedDrop && <ItemPulls key={selectedDrop.id} drop={selectedDrop} revealedIds={revealedIds} onReveal={showReveals} onSummary={() => setScreen('summary')} onBack={backToBoxes} />}
              {screen === 'summary' && selectedDrop && <HaulSummary drop={selectedDrop} claimed={claimedIds.includes(selectedDrop.id)}
                onClaim={() => setClaimedIds((ids) => [...new Set([...ids, selectedDrop.id])])} onBack={backToBoxes} onReplay={replayOpening} />}
              {screen === 'who' && <div className="viewport-actions" aria-label="Recipient actions">
                <ButtonLift><button className="secondary-button" type="button" onClick={() => setScreen('start')}>Back<IconGlyph name="arrowLeft" size={17} /></button></ButtonLift>
                <ButtonLift><button className="primary-button" type="button" onClick={() => setScreen('range')}>Set budget<IconGlyph name="arrowRight" size={18} /></button></ButtonLift>
              </div>}
              {screen === 'range' && <div className="viewport-actions" aria-label="Range actions">
                <ButtonLift><button className="secondary-button" type="button" onClick={() => setScreen('who')}>Back<IconGlyph name="arrowLeft" size={17} /></button></ButtonLift>
                <ButtonLift><button className="primary-button" type="button" onClick={() => setScreen('category')}>Choose categories<IconGlyph name="arrowRight" size={18} /></button></ButtonLift>
              </div>}
              {screen === 'category' && <div className="viewport-actions" aria-label="Category actions">
                <ButtonLift><button className="secondary-button" type="button" onClick={() => setScreen('range')}>Back<IconGlyph name="arrowLeft" size={17} /></button></ButtonLift>
                <ButtonLift><button className="primary-button" type="button" onClick={() => { resetQuiz(); setScreen('quiz'); }}>Pick my quiz<IconGlyph name="arrowRight" size={18} /></button></ButtonLift>
              </div>}
              {screen === 'quiz' && <div className="viewport-actions" aria-label="Quiz actions">
                {!quizTopic ? <ButtonLift><button className="secondary-button" type="button" onClick={() => navigateToStage(3)}>Edit setup<IconGlyph name="arrowLeft" size={17} /></button></ButtonLift>
                  : <ButtonLift><button className="secondary-button" type="button" onClick={resetQuiz}>Pick a different quiz<IconGlyph name="arrowLeft" size={17} /></button></ButtonLift>}
              </div>}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
