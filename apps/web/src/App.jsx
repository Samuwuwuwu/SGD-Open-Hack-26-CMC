import { useEffect, useRef, useState } from 'react';
import ProgressRail from './components/ProgressRail.jsx';
import { preferenceOptions } from './data/preferenceOptions.js';
import StartPanel from './features/onboarding/StartPanel.jsx';
import PreferencePanel from './features/preferences/PreferencePanel.jsx';
import DropCandidates from './features/drops/DropCandidates.jsx';
import DropReveal from './features/drops/DropReveal.jsx';
import { createPreferenceSession, getQuizQuestion, matchDrops } from './services/api.js';

const stages = ['Start', 'Range', 'Quiz', 'Match', 'Drops', 'Reveal'];

function App() {
  const [stage, setStage] = useState(0);
  const [budget, setBudget] = useState(60);
  const [preferences, setPreferences] = useState([]);
  const [constraints, setConstraints] = useState({ size: 'M', dietary: 'any' });
  const [quizTopic, setQuizTopic] = useState('');
  const [quizFilters, setQuizFilters] = useState([]);
  const [quizHistory, setQuizHistory] = useState([]);
  const [quizQuestion, setQuizQuestion] = useState(null);
  const [quizRemaining, setQuizRemaining] = useState(0);
  const [quizLoading, setQuizLoading] = useState(false);
  const [candidates, setCandidates] = useState([]);
  const [selectedDrop, setSelectedDrop] = useState(null);
  const [error, setError] = useState('');
  const [isMatching, setIsMatching] = useState(false);
  const [claimedDropId, setClaimedDropId] = useState(null);
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
    setStage(3);
    try {
      await createPreferenceSession({ budget, preferences: preferenceTags, constraints });
      const result = await matchDrops({ budget, preferences: preferenceTags, constraints, quizFilters: filters });
      setCandidates(result.candidates);
      setStage(4);
    } catch (requestError) {
      setError(requestError.message);
      setStage(2);
    } finally {
      setIsMatching(false);
    }
  };

  const loadQuestion = async (topic, filters, preferenceTags = preferences, history = quizHistory) => {
    setError('');
    setQuizLoading(true);
    setQuizQuestion(null);

    try {
      const result = await getQuizQuestion({ topic, budget, constraints, quizFilters: filters, quizHistory: history });
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

  const resetQuiz = () => {
    setQuizTopic('');
    setQuizFilters([]);
    setQuizHistory([]);
    setQuizQuestion(null);
    setQuizRemaining(0);
    setPreferences([]);
  };

  return (
    <main className="app-shell">
      <section className={`prototype-frame expanded-window shell--${stage === 0 ? 'landing' : 'experience'}`} aria-label="ROLLOVER Gacha Arcade">
        <header className="window-titlebar">
          <div className="window-dots" aria-hidden="true"><span /><span /><span /></div>
          <span className="window-controls" aria-hidden="true">&mdash; &#9633; &times;</span>
        </header>
        <div className="window-interior">
          <ProgressRail stages={stages} currentStage={stage} onNavigate={setStage} isMatching={isMatching} />
          <div className="viewport-stack">
            <div className="main-viewport" id="main-viewport" ref={viewportRef} tabIndex={-1} aria-label={`${stages[stage]} stage`}>
              <div className="stage-layout">
                <div className="stage-content">
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
                  {stage === 2 && (
                    <PreferencePanel
                      topic={quizTopic}
                      question={quizQuestion}
                      remainingCount={quizRemaining}
                      isLoading={quizLoading}
                      constraints={constraints}
                      onConstraintsChange={setConstraints}
                      onChooseTopic={chooseTopic}
                      onAnswer={answerQuestion}
                      onResetTopic={resetQuiz}
                    />
                  )}
                  {stage === 3 && (
                    <section className="matching-panel" role="status" aria-live="polite" aria-busy={isMatching}>
                      <div className="radar-screen" aria-hidden="true"><div className="radar-ring"><span className="radar-sweep" /><span className="radar-pip" /><span className="radar-center">&#10022;</span></div></div>
                      <h2>Rolling your drop&hellip;</h2>
                      <p className="panel-copy">Your answers are narrowing the live surplus pool.</p>
                    </section>
                  )}
                  {stage === 4 && <DropCandidates candidates={candidates} onReveal={(drop) => { setSelectedDrop(drop); setStage(5); }} />}
                  {stage === 5 && selectedDrop && <DropReveal drop={selectedDrop} budget={budget} preferences={preferences} preferenceOptions={preferenceOptions} claimed={claimedDropId === selectedDrop.id} />}
                </div>

                {stage === 1 && (
                  <div className="stage-actions" aria-label="Range actions">
                    <button className="secondary-button" type="button" onClick={() => setStage(0)}>Back <span aria-hidden="true">&larr;</span></button>
                    <button className="primary-button" type="button" onClick={() => setStage(2)}>Pick my quiz <span aria-hidden="true">&rarr;</span></button>
                  </div>
                )}
                {stage === 2 && (
                  <div className="stage-actions" aria-label="Quiz actions">
                    {!quizTopic ? (
                      <button className="secondary-button" type="button" onClick={() => setStage(1)}>Edit range <span aria-hidden="true">&larr;</span></button>
                    ) : (
                      <button className="secondary-button" type="button" onClick={resetQuiz}>Pick a different quiz <span aria-hidden="true">&larr;</span></button>
                    )}
                  </div>
                )}
                {stage === 4 && (
                  <div className="stage-actions" aria-label="Drop actions">
                    <button className="secondary-button" type="button" onClick={() => { resetQuiz(); setStage(2); }}>Roll again <span aria-hidden="true">&#8634;</span></button>
                  </div>
                )}
                {stage === 5 && selectedDrop && (
                  <div className="stage-actions" aria-label="Reveal actions">
                    <button className="secondary-button" type="button" onClick={() => { resetQuiz(); setStage(0); }}>Start over <span aria-hidden="true">&#8634;</span></button>
                    <button className="secondary-button" type="button" onClick={() => setStage(4)}>Choose another <span aria-hidden="true">&rarr;</span></button>
                    <button className="primary-button" type="button" onClick={() => setClaimedDropId(selectedDrop.id)} disabled={claimedDropId === selectedDrop.id}>
                      {claimedDropId === selectedDrop.id ? <>Demo pick saved <span aria-hidden="true">&#10003;</span></> : <>Claim demo drop <span aria-hidden="true">&#8599;</span></>}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
