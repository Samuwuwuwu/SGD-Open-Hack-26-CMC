import { useEffect, useRef, useState } from 'react';
import ProgressRail from './components/ProgressRail.jsx';
import { preferenceOptions } from './data/preferenceOptions.js';
import StartPanel from './features/onboarding/StartPanel.jsx';
import PreferencePanel from './features/preferences/PreferencePanel.jsx';
import DropCandidates from './features/drops/DropCandidates.jsx';
import UnboxingReveal from './features/drops/UnboxingReveal.jsx';
import { createPreferenceSession, getQuizQuestion, matchDrops, revealDrop } from './services/api.js';

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
  const [selectedBox, setSelectedBox] = useState(null);
  const [selectedDrop, setSelectedDrop] = useState(null);
  const [openedDrops, setOpenedDrops] = useState({});
  const [revisitingBox, setRevisitingBox] = useState(false);
  const [revealError, setRevealError] = useState('');
  const [revealAttempt, setRevealAttempt] = useState(0);
  const [error, setError] = useState('');
  const [isMatching, setIsMatching] = useState(false);
  const [claimedDropId, setClaimedDropId] = useState(null);
  const viewportRef = useRef(null);
  const previousStage = useRef(stage);
  const revealRequestId = useRef(0);

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
      revealRequestId.current += 1;
      setOpenedDrops({});
      setSelectedBox(null);
      setSelectedDrop(null);
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
    revealRequestId.current += 1;
    setQuizTopic('');
    setQuizFilters([]);
    setQuizHistory([]);
    setQuizQuestion(null);
    setQuizRemaining(0);
    setPreferences([]);
    setCandidates([]);
    setSelectedBox(null);
    setSelectedDrop(null);
    setOpenedDrops({});
    setRevisitingBox(false);
    setRevealError('');
    setClaimedDropId(null);
  };

  const requestReveal = async (box) => {
    const requestId = ++revealRequestId.current;
    setRevealError('');
    try {
      const drop = await revealDrop({ id: box.id, budget, preferences, constraints, quizFilters });
      if (requestId !== revealRequestId.current) return;
      setSelectedDrop(drop);
      setOpenedDrops((previous) => ({ ...previous, [box.id]: drop }));
    } catch (requestError) {
      if (requestId === revealRequestId.current) setRevealError(requestError.message);
    }
  };

  const chooseBox = (box, number) => {
    const previousReveal = openedDrops[box.id];
    revealRequestId.current += 1;
    setSelectedBox({ ...box, number });
    setRevisitingBox(Boolean(previousReveal));
    setRevealAttempt(0);
    setRevealError('');
    setSelectedDrop(previousReveal || null);
    setStage(5);
    if (!previousReveal) requestReveal(box);
  };

  const navigateToStage = (nextStage) => {
    revealRequestId.current += 1;
    setSelectedBox(null);
    setSelectedDrop(null);
    setRevisitingBox(false);
    setRevealError('');
    setStage(nextStage);
  };

  const retryReveal = () => {
    if (!selectedBox) return;
    setSelectedDrop(null);
    setRevealAttempt((previous) => previous + 1);
    requestReveal(selectedBox);
  };

  return (
    <main className="app-shell">
      <section className={`prototype-frame expanded-window ${stage === 0 ? 'home-screen' : ''}`} aria-label="ROLLOVER Gacha Arcade">
        <header className="window-titlebar">
          <div className="window-dots" aria-hidden="true"><span /><span /><span /></div>
          {stage !== 0 && <nav className="titlebar-actions" aria-label="Stage controls">
            {stage === 1 && <button className="secondary-button" type="button" onClick={() => setStage(0)}>Back &larr;</button>}
            {stage === 1 && <button className="primary-button" type="button" onClick={() => setStage(2)}>Pick my quiz <span aria-hidden="true">→</span></button>}
            {stage === 2 && <button className="secondary-button" type="button" onClick={() => setStage(1)}>Edit range &larr;</button>}
            {stage === 3 && <span className="titlebar-status" role="status">Finding your drops…</span>}
            {stage === 4 && <button className="secondary-button" type="button" onClick={() => { resetQuiz(); setStage(2); }}>Roll again &#8634;</button>}
            {stage === 5 && <button className="secondary-button" type="button" onClick={() => { resetQuiz(); setStage(0); }}>Start over &#8634;</button>}
          </nav>}
          <span className="window-controls" aria-hidden="true">— □ ×</span>
        </header>
        <div className="window-interior">
          <ProgressRail stages={stages} currentStage={stage} onNavigate={navigateToStage} isMatching={isMatching} />
          <div className="viewport-stack">
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
                  <div className="radar-screen" aria-hidden="true"><div className="radar-ring"><span className="radar-sweep" /><span className="radar-pip" /><span className="radar-center">✦</span></div></div>
                  <h2>Rolling your drop…</h2>
                  <p className="panel-copy">Your answers are narrowing the live surplus pool.</p>
                </section>
              )}
              {stage === 4 && <DropCandidates candidates={candidates} openedDrops={openedDrops} onReveal={chooseBox} />}
              {stage === 5 && selectedBox && <UnboxingReveal
                key={`${selectedBox.id}-${revealAttempt}`}
                box={selectedBox}
                drop={selectedDrop}
                error={revealError}
                alreadyOpened={revisitingBox}
                onRetry={retryReveal}
                onBack={() => navigateToStage(4)}
                revealProps={{ budget, preferences, preferenceOptions, claimed: claimedDropId === selectedDrop?.id, onClaim: () => setClaimedDropId(selectedDrop?.id) }}
              />}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

export default App;
