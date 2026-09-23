function ProgressRail({ stages, currentStage, onNavigate, isMatching, apiState }) {
  return (
    <aside className="journey-sidebar">
      <a className="brand-lockup" href="#main-viewport" aria-label="ROLLOVER, jump to content">
        <span className="brand-symbol" aria-hidden="true">↺</span>
        <div><h1>ROLLOVER</h1><span className="rail-label">The surplus arcade</span></div>
      </a>
      <nav className="progress-rail" aria-label="Drop journey">
        <ol>
          {stages.slice(1).map((label, index) => {
            const step = index + 1;
            const complete = step < currentStage;
            return (
              <li key={label}>
                <button
                  className={`rail-step ${step === currentStage ? 'active' : ''} ${complete ? 'complete' : ''}`}
                  type="button"
                  aria-current={step === currentStage ? 'step' : undefined}
                  disabled={isMatching || step === 3 || step >= currentStage}
                  onClick={() => onNavigate(step)}
                >
                  <span className="rail-number">{String(step).padStart(2, '0')}</span>
                  <span>{label}</span>
                  <span className="rail-indicator" aria-hidden="true">{complete ? '✓' : step === currentStage ? '▶' : '·'}</span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
      <div className="sidebar-bottom">
        <div className="inventory-label"><span className={`status-dot api-${apiState.status}`} /> Inventory feed</div>
        <div className="inventory-count">{apiState.status === 'connected' ? <><strong>{String(apiState.inventoryCount).padStart(2, '0')}</strong> demo items</> : apiState.status === 'checking' ? 'Tuning in…' : 'Feed offline'}</div>
      </div>
    </aside>
  );
}

export default ProgressRail;
