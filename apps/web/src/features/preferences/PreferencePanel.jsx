function PreferencePanel({ options, preferences, constraints, onPreferencesChange, onConstraintsChange, onSubmit }) {
  const togglePreference = (value) => {
    onPreferencesChange(
      preferences.includes(value)
        ? preferences.filter((preference) => preference !== value)
        : [...preferences, value],
    );
  };

  return (
    <section className="journey-panel preference-panel">
      <div className="panel-kicker">02 / Your signals</div>
      <h3>What would make this feel like a good day?</h3>
      <p className="panel-copy">Choose whatever is true right now. These are signals, not labels.</p>
      <div className="choice-grid">
        {options.map((option) => (
          <button
            className={`choice-chip ${preferences.includes(option.value) ? 'selected' : ''}`}
            type="button"
            key={option.value}
            onClick={() => togglePreference(option.value)}
            aria-pressed={preferences.includes(option.value)}
          >
            <span>{option.icon}</span>{option.label}
          </button>
        ))}
      </div>
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
      <button className="primary-button" type="button" onClick={onSubmit}>Show my drops <span>→</span></button>
    </section>
  );
}

export default PreferencePanel;
