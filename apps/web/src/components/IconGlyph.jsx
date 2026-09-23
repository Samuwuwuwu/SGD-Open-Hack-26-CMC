import {
  IconArrowLeft,
  IconArrowRight,
  IconArrowUpRight,
  IconCheck,
  IconCircleDot,
  IconCircleHalf2,
  IconClover,
  IconLoader2,
  IconMinus,
  IconPlayerPlay,
  IconPoint,
  IconRefresh,
  IconRotateClockwise,
  IconSearch,
  IconSparkles,
  IconSquare,
  IconWaveSine,
  IconX,
} from '@tabler/icons-react';

const icons = {
  arrowLeft: IconArrowLeft,
  arrowRight: IconArrowRight,
  arrowUpRight: IconArrowUpRight,
  check: IconCheck,
  circleDot: IconCircleDot,
  circleHalf: IconCircleHalf2,
  clover: IconClover,
  loader: IconLoader2,
  minus: IconMinus,
  playerPlay: IconPlayerPlay,
  point: IconPoint,
  refresh: IconRefresh,
  rotate: IconRotateClockwise,
  search: IconSearch,
  sparkles: IconSparkles,
  square: IconSquare,
  wave: IconWaveSine,
  close: IconX,
};

function IconGlyph({ name, size = 18, stroke = 2.5, className = '' }) {
  const Icon = icons[name];

  if (!Icon) return null;

  return <Icon className={`ui-icon ${className}`.trim()} size={size} stroke={stroke} aria-hidden="true" focusable="false" />;
}

export default IconGlyph;
