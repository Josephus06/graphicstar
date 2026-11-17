import type { Choice, Unit } from '@/lib/designer/model';
import { SignArtwork, type ArtworkState } from './SignArtwork';

/**
 * Product preview: the artwork on a sign at the chosen size's proportions,
 * with whatever stand / hardware the selected options imply, and size labels.
 */

type Mockup = NonNullable<Choice['mockup']>;

const SCENE_W = 1000;
const SCENE_H = 760;
const GROUND = 700;

export function MockupScene({
  w,
  h,
  unit,
  art,
  mockups,
  doubleSided,
}: {
  w: number;
  h: number;
  unit: Unit;
  art: ArtworkState;
  mockups: Mockup[];
  doubleSided: boolean;
}) {
  const has = (m: Mockup) => mockups.includes(m);
  const standing = has('post') || has('hstake');

  const availW = 700;
  const availH = standing ? 420 : 560;
  const scale = Math.min(availW / w, availH / h);
  const sw = w * scale;
  const sh = h * scale;
  const sx = (SCENE_W - sw) / 2 + (has('post') ? 30 : 0);
  const sy = has('post') ? 120 : standing ? 90 : (SCENE_H - sh) / 2 - 10;
  const bottom = sy + sh;

  const unitLabel = (n: number) => (unit === 'ft' ? `${n} ft` : `${n}"`);
  const steel = '#3A3D45';

  return (
    <svg viewBox={`0 0 ${SCENE_W} ${SCENE_H}`} className="h-auto w-full" role="img" aria-label={`Preview, ${unitLabel(w)} wide by ${unitLabel(h)} high`}>
      <defs>
        <linearGradient id="ms-bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F7F7F7" />
          <stop offset="1" stopColor="#E9E9E9" />
        </linearGradient>
        <filter id="ms-shadow" x="-20%" y="-20%" width="140%" height="160%">
          <feDropShadow dx="0" dy="14" stdDeviation="16" floodColor="#151515" floodOpacity="0.18" />
        </filter>
      </defs>
      <rect width={SCENE_W} height={SCENE_H} fill="url(#ms-bg)" />
      {standing ? <ellipse cx={SCENE_W / 2 + (has('post') ? -10 : 0)} cy={GROUND + 6} rx={sw * 0.55 + 60} ry={16} fill="#151515" opacity={0.08} /> : null}

      {/* Colonial post: upright on the left, arm across the top, sign hung on two links */}
      {has('post') ? (
        <g fill={steel}>
          <rect x={sx - 52} y={sy - 70} width={16} height={GROUND - (sy - 70)} rx={3} />
          <rect x={sx - 60} y={sy - 78} width={32} height={10} rx={3} />
          <rect x={sx - 52} y={sy - 52} width={sw + 92} height={12} rx={3} />
          <rect x={sx + sw + 34} y={sy - 58} width={10} height={24} rx={2} />
          <path d={`M ${sx - 36} ${sy - 40} l 34 0 l -34 34 z`} />
          <rect x={sx + sw * 0.15 - 2} y={sy - 40} width={4} height={40} />
          <rect x={sx + sw * 0.85 - 2} y={sy - 40} width={4} height={40} />
        </g>
      ) : null}

      {/* H-stake: two wires from the panel into the ground */}
      {has('hstake') ? (
        <g stroke="#5C5F66" strokeWidth={6} strokeLinecap="round">
          <line x1={sx + sw * 0.25} y1={bottom - 10} x2={sx + sw * 0.25} y2={GROUND} />
          <line x1={sx + sw * 0.75} y1={bottom - 10} x2={sx + sw * 0.75} y2={GROUND} />
          <line x1={sx + sw * 0.25} y1={bottom + (GROUND - bottom) * 0.45} x2={sx + sw * 0.75} y2={bottom + (GROUND - bottom) * 0.45} />
        </g>
      ) : null}

      {/* The panel: a darker edge for thickness, then the artwork */}
      <g filter="url(#ms-shadow)">
        <rect x={sx + 5} y={sy + 5} width={sw} height={sh} rx={3} fill="#B8B8B8" />
        <g transform={`translate(${sx} ${sy}) scale(${sw / 1000})`}>
          <SignArtwork w={w} h={h} art={art} />
        </g>
        <rect x={sx} y={sy} width={sw} height={sh} rx={3} fill="none" stroke="#151515" strokeOpacity={0.12} strokeWidth={2} />
      </g>

      {has('grommets') ? (
        <g fill="#E4E4E4" stroke="#8A8A8A" strokeWidth={3}>
          {[0.06, 0.94].flatMap((fx) =>
            [0.06, 0.94].map((fy) => <circle key={`${fx}-${fy}`} cx={sx + sw * fx} cy={sy + sh * fy} r={Math.max(5, Math.min(10, sw * 0.012))} />),
          )}
        </g>
      ) : null}

      {has('standoffs') ? (
        <g>
          {[0.05, 0.95].flatMap((fx) =>
            [0.07, 0.93].map((fy) => (
              <g key={`${fx}-${fy}`}>
                <circle cx={sx + sw * fx} cy={sy + sh * fy} r={13} fill="#D9DBDF" stroke="#9EA2AA" strokeWidth={2} />
                <circle cx={sx + sw * fx - 3} cy={sy + sh * fy - 3} r={4} fill="#FFFFFF" opacity={0.8} />
              </g>
            )),
          )}
        </g>
      ) : null}

      {/* Size labels */}
      <g fontFamily="Montserrat, Arial, sans-serif" fontSize={20} fontWeight={600} fill="#7A7A7A">
        <g transform={`translate(0 ${has('post') ? bottom + 34 : sy - 24})`}>
          <line x1={sx} x2={sx + sw} y1={0} y2={0} stroke="#9A9A9A" strokeWidth={2} />
          <line x1={sx} x2={sx} y1={-8} y2={8} stroke="#9A9A9A" strokeWidth={2} />
          <line x1={sx + sw} x2={sx + sw} y1={-8} y2={8} stroke="#9A9A9A" strokeWidth={2} />
          <rect x={sx + sw / 2 - 42} y={-14} width={84} height={28} fill="#F2F2F2" />
          <text x={sx + sw / 2} y={7} textAnchor="middle">
            {unitLabel(w)}
          </text>
        </g>
        <g transform={`translate(${sx + sw + (has('post') ? 70 : 28)} 0)`}>
          <line x1={0} x2={0} y1={sy} y2={bottom} stroke="#9A9A9A" strokeWidth={2} />
          <line x1={-8} x2={8} y1={sy} y2={sy} stroke="#9A9A9A" strokeWidth={2} />
          <line x1={-8} x2={8} y1={bottom} y2={bottom} stroke="#9A9A9A" strokeWidth={2} />
          <text x={14} y={sy + sh / 2 + 7}>{unitLabel(h)}</text>
        </g>
      </g>

      {doubleSided ? (
        <text x={SCENE_W - 24} y={SCENE_H - 22} textAnchor="end" fontFamily="Montserrat, Arial, sans-serif" fontSize={18} fontWeight={600} fill="#7A7A7A">
          Double sided: same design on both faces
        </text>
      ) : null}
    </svg>
  );
}
