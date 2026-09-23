import IconGlyph from './IconGlyph.jsx';

function ProductArt({ category }) {
  return (
    <div className={`product-illustration illustration-${category}`} aria-hidden="true">
      <span className="illustration-sparkle"><IconGlyph name="sparkles" size={20} /></span>
      <svg viewBox="0 0 160 140" fill="none" stroke="currentColor" strokeWidth="4" strokeLinejoin="round">
        {category === 'fashion' ? (
          <>
            <path d="M52 27 27 41 12 69 36 82 44 66 42 120H118L116 66 124 82 148 69 133 41 108 27Z" fill="var(--bg-card)" />
            <path d="M61 27C61 51 99 51 99 27M80 51V120M94 62H108V79H94Z" />
            <path d="M72 70H76M72 85H76M72 100H76" />
          </>
        ) : category === 'food' ? (
          <>
            <path d="M41 27H119L112 119H48Z" fill="var(--bg-card)" />
            <path d="M41 27 49 15H111L119 27M43 38H117M47 105H113" />
            <circle cx="80" cy="72" r="23" fill="var(--accent-yellow)" />
            <path d="M67 73 77 82 94 62" />
          </>
        ) : (
          <>
            <path d="M37 41 80 20 123 41V104L80 127 37 104Z" fill="var(--bg-card)" />
            <path d="M37 41 80 64 123 41M80 64V127M58 30 102 53V76L90 82V59L47 36" />
            <path d="m51 82 16 9M51 93l11 6" />
          </>
        )}
      </svg>
      <span className="illustration-orbit"><IconGlyph name="circleDot" size={24} /></span>
    </div>
  );
}

export default ProductArt;
