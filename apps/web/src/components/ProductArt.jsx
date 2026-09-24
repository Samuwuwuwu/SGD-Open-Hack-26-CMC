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
        ) : category === 'cosmetics' ? (
          <>
            <path d="M37 51H84V117H37Z" fill="var(--surface)" />
            <path d="M44 32H77V51H44Z" fill="var(--orange)" />
            <path d="M49 21H71V32H49Z" fill="var(--surface)" />
            <path d="M48 76H73M48 85H65" />
            <path d="M100 63H126V117H100Z" fill="var(--magenta)" />
            <path d="M104 41 122 33V63H104Z" fill="var(--surface)" />
            <path d="M100 96H126" />
          </>
        ) : category === 'electronics' ? (
          <>
            <rect x="33" y="21" width="64" height="98" rx="10" fill="var(--surface)" />
            <path d="M55 34H75M56 106H74M68 48 51 73H67L61 91 82 64H66Z" fill="var(--lime)" />
            <path d="M111 49H129V78H111ZM120 78V100C120 113 102 114 102 103" fill="var(--cyan)" />
            <path d="M115 40V49M125 40V49" />
          </>
        ) : category === 'stationery' ? (
          <>
            <path d="M38 22H111V119H38Z" fill="var(--surface)" />
            <path d="M47 22V119M62 45H95M62 57H95M62 69H83" />
            <path d="M82 22V39L91 34 100 39V22" fill="var(--orange)" />
            <path d="m114 110 12-9V40H114ZM114 40V32H126V40" fill="var(--lime)" />
            <path d="M31 38H43M31 60H43M31 82H43M31 104H43" />
          </>
        ) : category === 'home goods' ? (
          <>
            <path d="M31 58H98V103C98 127 31 127 31 103Z" fill="var(--surface)" />
            <path d="M98 66H110C134 66 134 99 110 99H98" />
            <path d="M47 21C67 32 31 39 51 50M70 17C90 28 54 35 74 46" />
            <path d="M37 77H91M28 125H112" />
            <circle cx="64" cy="94" r="9" fill="var(--lime)" />
          </>
        ) : category === 'lifestyle' ? (
          <>
            <path d="M44 80H116L108 122H52Z" fill="var(--surface)" />
            <path d="M80 80V37M80 65C52 65 41 49 47 31 72 31 84 47 80 65ZM80 52C80 30 95 19 117 23 116 43 103 54 80 52Z" fill="var(--lime)" />
            <path d="M43 91H117M75 105H85" />
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
