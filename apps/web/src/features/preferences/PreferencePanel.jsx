import IconGlyph from '../../components/IconGlyph.jsx';
import ButtonLift from '../../components/ButtonLift.jsx';

const topics = ['Music', 'Games', 'Movies & TV', 'My Little Pony', 'Random'];

function PreferencePanel({
  topic,
  question,
  remainingCount,
  isLoading,
  recipientMode,
  onChooseTopic,
  onAnswer,
  onResetTopic,
}) {
  if (!topic) {
    return (
      <section className="journey-panel preference-panel">
        <p className="quiz-kicker">PICK YOUR QUIZ</p>
        <h2>{recipientMode === 'gift' ? <>What are they <span className="highlight-word">into?</span></> : <>How should we <span className="highlight-word">read you?</span></>}</h2>
        <p className="panel-copy">{recipientMode === 'gift' ? 'Pick something that feels like them.' : 'Pick a topic. The questions change with what is actually in stock.'}</p>

        <div className="topic-grid">
          {topics.map((item) => (
            <ButtonLift key={item}><button className="choice-chip topic-chip" type="button" onClick={() => onChooseTopic(item)}>
              <span>{item}</span><span className="choice-check"><IconGlyph name="arrowRight" size={17} /></span>
            </button></ButtonLift>
          ))}
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
