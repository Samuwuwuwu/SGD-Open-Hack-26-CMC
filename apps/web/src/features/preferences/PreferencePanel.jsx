import IconGlyph from '../../components/IconGlyph.jsx';
import ButtonLift from '../../components/ButtonLift.jsx';

const topics = ['Music', 'Games', 'Movies & TV', 'My Little Pony', 'Random'];

function PreferencePanel({
  topic,
  question,
  remainingCount,
  isLoading,
  constraints,
  onConstraintsChange,
  onChooseTopic,
  onAnswer,
  onResetTopic,
}) {
  if (!topic) {
    return (
      <section className="journey-panel preference-panel">
        <p className="quiz-kicker">PICK YOUR QUIZ</p>
        <h2>How should we <span className="highlight-word">read you?</span></h2>
        <p className="panel-copy">Pick a topic. The questions change with what is actually in stock.</p>

        <div className="topic-grid">
          {topics.map((item) => (
            <ButtonLift key={item}><button className="choice-chip topic-chip" type="button" onClick={() => onChooseTopic(item)}>
              <span>{item}</span><span className="choice-check"><IconGlyph name="arrowRight" size={17} /></span>
            </button></ButtonLift>
          ))}
        </div>

        <div className="constraint-panel">
          <div className="constraint-grid">
            <label>
              Size, if relevant
              <select value={constraints.size} onChange={(event) => onConstraintsChange({ ...constraints, size: event.target.value })}>
                <option value="any">Any size</option><option value="S">Small</option><option value="M">Medium</option><option value="L">Large</option>
              </select>
            </label>
            <label>
              Food preference, if relevant
              <select value={constraints.dietary} onChange={(event) => onConstraintsChange({ ...constraints, dietary: event.target.value })}>
                <option value="any">No restriction</option><option value="vegetarian">Vegetarian</option><option value="vegan">Vegan</option>
              </select>
            </label>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="journey-panel preference-panel quiz-panel">
      <div className="quiz-meta">
        <ButtonLift><button className="quiz-topic-button" type="button" onClick={onResetTopic}>{topic} <IconGlyph name="rotate" size={16} /></button></ButtonLift>
        {remainingCount > 0 && <span>{remainingCount} possible finds</span>}
      </div>

      {isLoading ? (
        <div className="quiz-loading" role="status">
          <span className="quiz-spinner"><IconGlyph name="loader" size={54} /></span>
          <h2>Cooking up a question&hellip;</h2>
        </div>
      ) : question ? (
        <>
          <p className="quiz-kicker">CHOOSE WITHOUT OVERTHINKING IT</p>
          <h2 className="quiz-question">{question.question}</h2>
          <div className="quiz-answer-grid">
            {question.options.map((option, index) => (
              <ButtonLift key={`${option.label}-${index}`}><button className="quiz-answer" type="button" onClick={() => onAnswer(option)}>
                <span className="answer-letter">{String.fromCharCode(65 + index)}</span>
                <span>{option.label}</span>
              </button></ButtonLift>
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}

export default PreferencePanel;
