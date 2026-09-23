function PreferencePanel({ options, preferences, constraints, onPreferencesChange, onConstraintsChange }) {
  const togglePreference = (value) => {
    onPreferencesChange(
      preferences.includes(value)
        ? preferences.filter((preference) => preference !== value)
        : [...preferences, value],
    );
  };

  return (
    <section className="journey-panel preference-panel">
      <h2>What’s your <span className="highlight-word">frequency?</span></h2>
      <p className="panel-copy">Choose what matters to you. Pick as many as you like.</p>
      <div className="choice-grid" role="group" aria-label="Your preferences">
        {options.map((option) => (
          <button
            className={`choice-chip ${preferences.includes(option.value) ? 'selected' : ''}`}
            type="button"
            key={option.value}
            onClick={() => togglePreference(option.value)}
            aria-pressed={preferences.includes(option.value)}
          >
            <span className="choice-icon" aria-hidden="true">{option.icon}</span>
            <span>{option.label}</span>
            <span className="choice-check" aria-hidden="true">{preferences.includes(option.value) ? '✓' : '+'}</span>
          </button>
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

export default PreferencePanel;
