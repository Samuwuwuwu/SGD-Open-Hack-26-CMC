function ProgressRail({ stages, currentStage }) {
  return (
    <nav className="progress-rail" aria-label="Drop journey">
      <p className="rail-label">Your journey</p>
      <ol>
        {stages.map((stage, index) => (
          <li className={index === currentStage ? 'active' : index < currentStage ? 'complete' : ''} key={stage}>
            <span className="rail-number">{index < currentStage ? '✓' : String(index + 1).padStart(2, '0')}</span>
            <span>{stage}</span>
          </li>
        ))}
      </ol>
      <p className="rail-note">The right surprise starts with the right questions.</p>
    </nav>
  );
}

export default ProgressRail;
