import { useEffect, useRef, useState } from 'react';
import ButtonLift from './components/ButtonLift.jsx';
import ProgressRail from './components/ProgressRail.jsx';
import IconGlyph from './components/IconGlyph.jsx';
import { preferenceOptions } from './data/preferenceOptions.js';
import StartPanel from './features/onboarding/StartPanel.jsx';
import PreferencePanel from './features/preferences/PreferencePanel.jsx';
import DropCandidates from './features/drops/DropCandidates.jsx';
import BundleReveal from './features/drops/BundleReveal.jsx';
import { createPreferenceSession, getQuizQuestion, matchDrops } from './services/api.js';

const stages = ['Start', 'Who', 'Budget', 'Category', 'Quiz', 'Match', 'Drops', 'Reveal'];
const categoryOptions = [
  ['fashion', 'FASHION'],
  ['cosmetics', 'BEAUTY'],
  ['food', 'FOOD + DRINK'],
  ['lifestyle', 'LIFESTYLE'],
  ['home goods', 'HOME'],
  ['electronics', 'TECH'],
  ['stationery', 'STATIONERY'],
];

function App() {
  const [stage, setStage] = useState(0);
  const [budget, setBudget] = useState(60);
  const [recipientMode, setRecipientMode] = useState('self');
  const [preferences, setPreferences] = useState([]);
  const [constraints, setConstraints] = useState({ size: 'M', dietary: 'any', categories: [], conditionMode: 'new_only' });
  const [quizTopic, setQuizTopic] = useState('');
  const [quizFilters, setQuizFilters] = useState([]);
  const [quizHistory, setQuizHistory] = useState([]);
  const [quizQuestion, setQuizQuestion] = useState(null);
  const [quizRemaining, setQuizRemaining] = useState(0);
  const [quizLoading, setQuizLoading] = useState(false);
  const [drop, setDrop] = useState(null);
  const [error, setError] = useState('');
  const [isMatching, setIsMatching] = useState(false);
  const [claimedDrop, setClaimedDrop] = useState(false);
  const viewportRef = useRef(null);
  const previousStage = useRef(stage);

  useEffect(() => {
    if (previousStage.current !== stage) {
      const viewport = viewportRef.current;
      viewport?.focus({ preventScroll: true });
      if (viewport && viewport.getBoundingClientRect().top < 0) viewport.scrollIntoView({ block: 'start' });
      previousStage.current = stage;
    }
  }, [stage]);

  const findDrops = async (filters = quizFilters, preferenceTags = preferences) => {
    setError('');
    setIsMatching(true);
    setStage(5);
    try {
      await createPreferenceSession({ recipientMode, budget, preferences: preferenceTags, constraints });
      const result = await matchDrops({ recipientMode, budget, preferences: preferenceTags, constraints, quizFilters: filters });
      setDrop(result.drop);
      setClaimedDrop(false);
      setStage(6);
    } catch (requestError) {
      setError(requestError.message);
      setStage(4);
    } finally {
      setIsMatching(false);
    }
  };

  const loadQuestion = async (topic, filters, preferenceTags = preferences, history = quizHistory) => {
    setError('');
    setQuizLoading(true);
    setQuizQuestion(null);

    try {
      const result = await getQuizQuestion({ recipientMode, topic, budget, constraints, quizFilters: filters, quizHistory: history });
      setQuizRemaining(result.remainingCount || 0);

      if (result.done) {
        await findDrops(filters, preferenceTags);
        return;
      }

      setQuizQuestion(result);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setQuizLoading(false);
    }
  };

  const chooseTopic = (topic) => {
    setQuizTopic(topic);
    setQuizFilters([]);
    setQuizHistory([]);
    setPreferences([]);
    loadQuestion(topic, [], [], []);
  };

  const answerQuestion = (option) => {
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

  const toggleCategory = (category) => {
    setConstraints((current) => {
      const categories = current.categories || [];
      return {
        ...current,
        categories: categories.includes(category)
          ? categories.filter((item) => item !== category)
          : [...categories, category],
      };
    });
  };

  const selectedCategories = constraints.categories || [];
  const selectedCategoryLabels = categoryOptions
    .filter(([value]) => selectedCategories.includes(value))
    .map(([, label]) => label);
  const showSizeControl = selectedCategories.length === 0 || selectedCategories.includes('fashion');
  const showDietaryControl = selectedCategories.length === 0 || selectedCategories.includes('food');

  const resetQuiz = () => {
    setQuizTopic('');
    setQuizFilters([]);
    setQuizHistory([]);
    setQuizQuestion(null);
    setQuizRemaining(0);
    setPreferences([]);
    setDrop(null);
    setClaimedDrop(false);
  };

  const startReveal = (bundle) => {
    if (!bundle?.items?.length) return;
    setStage(7);
  };

  const navigateToStage = (nextStage) => {
    setStage(nextStage);
  };

  return (
    <main className="app-shell">
      <section className={`prototype-frame expanded-window shell--${stage === 0 ? 'landing' : 'experience'}`} aria-label="ROLLOVER Gacha Arcade">
        <header className="window-titlebar">
          <div className="window-dots" aria-hidden="true"><span /><span /><span /></div>
          <span className="window-controls" aria-hidden="true">
            <IconGlyph name="minus" size={16} />
            <IconGlyph name="square" size={15} />
            <IconGlyph name="close" size={17} />
          </span>
        </header>
        <div className="window-interior">
          <ProgressRail stages={stages} currentStage={stage} onNavigate={navigateToStage} isMatching={isMatching} />
          <div className="viewport-stack">
            <div className={`main-viewport ${stage !== 0 && stage !== 5 ? 'has-viewport-actions' : ''}`} id="main-viewport" ref={viewportRef} tabIndex={-1} aria-label={`${stages[stage]} stage`}>
              {error && <div className="error-banner" role="alert">{error}</div>}
              {stage === 0 && <StartPanel onStart={() => setStage(1)} />}
              {stage === 1 && (
                <section className="journey-panel budget-panel">
                  <p className="quiz-kicker">FIRST UP</p>
                  <h2>Who are we <span className="highlight-word">rolling for?</span></h2>
                  <p className="panel-copy">The quiz wording can follow the person on the other side of the drop.</p>
                  <div className="range-controls">
                    <div className="range-control-block">
                      <div className="range-choice-grid">
                        {[['self', 'FOR ME'], ['gift', 'SOMEONE ELSE']].map(([value, label]) => (
                          <ButtonLift key={value}><button className={`choice-chip ${recipientMode === value ? 'selected' : ''}`} type="button" onClick={() => setRecipientMode(value)} aria-pressed={recipientMode === value}>
                            <span>{label}</span><span className="choice-check">{recipientMode === value ? '✓' : ''}</span>
                          </button></ButtonLift>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              )}
              {stage === 2 && (
                <section className="journey-panel budget-panel">
                  <p className="quiz-kicker">STEP TWO</p>
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
              {stage === 3 && (
                <section className="journey-panel shape-mix-panel">
                  <p className="quiz-kicker">STEP THREE</p>
                  <h2>Shape the <span className="highlight-word">mix.</span></h2>
                  <p className="panel-copy">{selectedCategories.length > 0 ? `Showing ${selectedCategoryLabels.join(' · ')}. Choose any details that matter.` : 'Choose what can show up, then let the quiz do the softer matching.'}</p>
                  <div className="range-controls">

                    <div className="range-control-block">
                      <p className="rail-label">WHAT SHOULD BE IN THE MIX?</p>
                      <div className="range-choice-grid category-choice-grid">
                        <ButtonLift><button className={`choice-chip ${constraints.categories?.length === 0 ? 'selected' : ''}`} type="button" onClick={() => setConstraints((current) => ({ ...current, categories: [] }))} aria-pressed={constraints.categories?.length === 0}>
                          <span>ANYTHING</span><span className="choice-check">{constraints.categories?.length === 0 ? '✓' : ''}</span>
                        </button></ButtonLift>
                        {categoryOptions.map(([value, label]) => {
                          const selected = constraints.categories?.includes(value);
                          return <ButtonLift key={value}><button className={`choice-chip ${selected ? 'selected' : ''}`} type="button" onClick={() => toggleCategory(value)} aria-pressed={selected}>
                            <span>{label}</span><span className="choice-check">{selected ? '✓' : ''}</span>
                          </button></ButtonLift>;
                        })}
                      </div>
                    </div>

                    <div className="range-control-block">
                      <p className="rail-label">OPEN TO PRE-LOVED?</p>
                      <div className="range-choice-grid">
                        {[['new_only', 'NEW ONLY'], ['allow_preloved', 'YES, MIX IT IN']].map(([value, label]) => (
                          <ButtonLift key={value}><button className={`choice-chip ${constraints.conditionMode === value ? 'selected' : ''}`} type="button" onClick={() => setConstraints((current) => ({ ...current, conditionMode: value }))} aria-pressed={constraints.conditionMode === value}>
                            <span>{label}</span><span className="choice-check">{constraints.conditionMode === value ? '✓' : ''}</span>
                          </button></ButtonLift>
                        ))}
                      </div>
                    </div>

                    {(showSizeControl || showDietaryControl) && <div className="constraint-panel">
                      <p className="rail-label">{[showSizeControl && 'SIZE', showDietaryControl && 'FOOD PREFERENCE'].filter(Boolean).join(' · ')} IF RELEVANT</p>
                      <div className={`constraint-grid ${!showSizeControl || !showDietaryControl ? 'single-constraint' : ''}`}>
                        {showSizeControl && <label>
                          Size, if relevant
                          <select value={constraints.size} onChange={(event) => setConstraints((current) => ({ ...current, size: event.target.value }))}>
                            <option value="any">Any size</option><option value="S">Small</option><option value="M">Medium</option><option value="L">Large</option>
                          </select>
                        </label>}
                        {showDietaryControl && <label>
                          Food preference, if relevant
                          <select value={constraints.dietary} onChange={(event) => setConstraints((current) => ({ ...current, dietary: event.target.value }))}>
                            <option value="any">No restriction</option><option value="vegetarian">Vegetarian</option><option value="vegan">Vegan</option>
                          </select>
                        </label>}
                      </div>
                    </div>}
                    {!showSizeControl && !showDietaryControl && <p className="constraint-hint">No extra details needed for this category mix.</p>}
                  </div>
                </section>
              )}
              {stage === 4 && (
                <PreferencePanel
                  topic={quizTopic}
                  question={quizQuestion}
                  remainingCount={quizRemaining}
                  isLoading={quizLoading}
                  recipientMode={recipientMode}
                  onChooseTopic={chooseTopic}
                  onAnswer={answerQuestion}
                  onResetTopic={resetQuiz}
                />
              )}
              {stage === 5 && (
                <section className="matching-panel" role="status" aria-live="polite" aria-busy={isMatching}>
                  <div className="radar-screen" aria-hidden="true"><div className="radar-ring"><span className="radar-sweep" /><span className="radar-pip" /><span className="radar-center"><IconGlyph name="sparkles" size={24} /></span></div></div>
                  <h2>Rolling your drop&hellip;</h2>
                  <p className="panel-copy">Your answers are narrowing the live surplus pool.</p>
                </section>
              )}
              {stage === 6 && <DropCandidates drop={drop} onReveal={startReveal} />}
              {stage === 7 && drop && <BundleReveal
                key={drop.id}
                drop={drop}
                budget={budget}
                preferences={preferences}
                preferenceOptions={preferenceOptions}
                claimed={claimedDrop}
                onClaim={() => setClaimedDrop(true)}
                onBack={() => navigateToStage(4)}
              />}

              {stage === 1 && (
                <div className="viewport-actions" aria-label="Recipient actions">
                  <ButtonLift><button className="secondary-button" type="button" onClick={() => setStage(0)}>Back <IconGlyph name="arrowLeft" size={17} /></button></ButtonLift>
                  <ButtonLift><button className="primary-button" type="button" onClick={() => setStage(2)}>Set budget <IconGlyph name="arrowRight" size={18} /></button></ButtonLift>
                </div>
              )}
              {stage === 2 && (
                <div className="viewport-actions" aria-label="Budget actions">
                  <ButtonLift><button className="secondary-button" type="button" onClick={() => setStage(1)}>Back <IconGlyph name="arrowLeft" size={17} /></button></ButtonLift>
                  <ButtonLift><button className="primary-button" type="button" onClick={() => setStage(3)}>Choose categories <IconGlyph name="arrowRight" size={18} /></button></ButtonLift>
                </div>
              )}
              {stage === 3 && (
                <div className="viewport-actions" aria-label="Category actions">
                  <ButtonLift><button className="secondary-button" type="button" onClick={() => setStage(2)}>Back <IconGlyph name="arrowLeft" size={17} /></button></ButtonLift>
                  <ButtonLift><button className="primary-button" type="button" onClick={() => setStage(4)}>Pick my quiz <IconGlyph name="arrowRight" size={18} /></button></ButtonLift>
                </div>
              )}
              {stage === 4 && (
                <div className="viewport-actions" aria-label="Quiz actions">
                  {!quizTopic ? (
                    <ButtonLift><button className="secondary-button" type="button" onClick={() => setStage(1)}>Edit setup <IconGlyph name="arrowLeft" size={17} /></button></ButtonLift>
                  ) : (
                    <ButtonLift><button className="secondary-button" type="button" onClick={resetQuiz}>Pick a different quiz <IconGlyph name="arrowLeft" size={17} /></button></ButtonLift>
                  )}
                </div>
              )}
              {stage === 6 && (
                <div className="viewport-actions" aria-label="Drop actions">
                  <ButtonLift><button className="secondary-button" type="button" onClick={() => { resetQuiz(); setStage(4); }}>Roll again <IconGlyph name="refresh" size={17} /></button></ButtonLift>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
