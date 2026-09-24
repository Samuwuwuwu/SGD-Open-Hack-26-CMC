import IconGlyph from '../../components/IconGlyph.jsx';

export default function BoxModel({ number = '01' }) {
  return (
    <div className="box-model" aria-hidden="true">
      <div className="box-cube">
        <div className="cube-face cube-front"><span className="cube-tape" /><span className="cube-brand">ROLLOVER</span><IconGlyph name="rotate" size={56} /><span className="cube-serial">DROP / {number}</span></div>
        <div className="cube-face cube-back"><span className="cube-tape" /></div>
        <div className="cube-face cube-left"><span className="cube-side-mark">GOOD<br />FINDS.</span></div>
        <div className="cube-face cube-right"><span className="cube-side-mark">NEW<br />GAME.</span><span className="cube-barcode">|||| ||| ||||</span></div>
        <div className="cube-face cube-bottom" />
        <div className="cube-face cube-interior cube-inner-front" />
        <div className="cube-face cube-interior cube-inner-back" />
        <div className="cube-face cube-interior cube-inner-left" />
        <div className="cube-face cube-interior cube-inner-right" />
        <div className="cube-face cube-interior cube-inner-bottom" />
        <div className="cube-face cube-rim" />
        <div className="cube-lid-hinge">
          <div className="cube-face cube-lid"><span className="cube-tape" /><span className="cube-seal"><IconGlyph name="sparkles" size={32} /></span></div>
          <div className="cube-face cube-lid-inner" />
        </div>
      </div>
    </div>
  );
}
