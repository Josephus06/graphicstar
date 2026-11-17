import { forwardRef } from 'react';
import type { TemplateFields, TemplateKey } from '@/lib/designer/model';

/**
 * The printed face of the sign, as SVG in a 1000-unit-wide coordinate space
 * whose height follows the chosen size's aspect ratio. Everything is inline
 * (images as data URLs, no external fonts) so the same markup can be drawn to
 * a canvas for the proof image.
 */

export type ArtworkState =
  | { mode: 'template'; template: TemplateKey; fields: TemplateFields; logo: string | null }
  | { mode: 'upload'; image: string | null; fileName: string | null; isPdf: boolean; fit: 'cover' | 'contain'; background: string };

export const ARTWORK_W = 1000;
const FONT = "Montserrat, 'Helvetica Neue', Arial, sans-serif";

/** Font size that fits `text` into `maxWidth`. Conservative per-character widths: bold caps ≈ 0.72em, mixed case ≈ 0.64em. */
const fit = (text: string, maxWidth: number, maxSize: number, em = 0.72) =>
  Math.max(8, Math.min(maxSize, maxWidth / Math.max(1, text.length * em)));

type Props = { w: number; h: number; art: ArtworkState; className?: string; title?: string };

export const SignArtwork = forwardRef<SVGSVGElement, Props>(function SignArtwork({ w, h, art, className, title }, ref) {
  const W = ARTWORK_W;
  const H = Math.round((W * h) / w);
  return (
    <svg
      ref={ref}
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${W} ${H}`}
      width={W}
      height={H}
      className={className}
      role="img"
      aria-label={title ?? 'Sign design preview'}
      preserveAspectRatio="xMidYMid meet"
    >
      {art.mode === 'upload' ? <Upload W={W} H={H} art={art} /> : <Template W={W} H={H} art={art} />}
    </svg>
  );
});

function Upload({ W, H, art }: { W: number; H: number; art: Extract<ArtworkState, { mode: 'upload' }> }) {
  return (
    <>
      <rect width={W} height={H} fill={art.background} />
      {art.image ? (
        <image
          href={art.image}
          x={0}
          y={0}
          width={W}
          height={H}
          preserveAspectRatio={art.fit === 'cover' ? 'xMidYMid slice' : 'xMidYMid meet'}
        />
      ) : (
        <g fontFamily={FONT} textAnchor="middle" fill="#7A7A7A">
          <rect x={W * 0.04} y={H * 0.06} width={W * 0.92} height={H * 0.88} fill="none" stroke="#C9C9C9" strokeWidth={4} strokeDasharray="18 14" rx={16} />
          <text x={W / 2} y={H / 2 - fit('x', W, H * 0.07)} fontSize={fit(art.isPdf ? 'PDF artwork attached' : 'Upload your artwork', W * 0.8, H * 0.09, 0.64)} fontWeight={700}>
            {art.isPdf ? 'PDF artwork attached' : 'Upload your artwork'}
          </text>
          <text x={W / 2} y={H / 2 + H * 0.08} fontSize={fit(art.fileName ?? 'PNG, JPG or PDF', W * 0.8, H * 0.06, 0.64)}>
            {art.fileName ?? 'PNG, JPG or PDF'}
          </text>
        </g>
      )}
    </>
  );
}

function Line({ x, y, text, size, color, weight = 800, anchor = 'middle' }: { x: number; y: number; text: string; size: number; color: string; weight?: number; anchor?: 'start' | 'middle' | 'end' }) {
  if (!text.trim()) return null;
  return (
    <text x={x} y={y} fontSize={size} fontWeight={weight} fill={color} textAnchor={anchor} fontFamily={FONT} dominantBaseline="middle">
      {text}
    </text>
  );
}

function Template({ W, H, art }: { W: number; H: number; art: Extract<ArtworkState, { mode: 'template' }> }) {
  const f = art.fields;
  const pad = W * 0.06;
  const inner = W - pad * 2;

  switch (art.template) {
    case 'for-sale': {
      const top = H * 0.24;
      const bottom = H * 0.2;
      const midTop = top;
      const midH = H - top - bottom;
      return (
        <>
          <rect width={W} height={H} fill={f.background} />
          <rect width={W} height={top} fill={f.primary} />
          <Line x={W / 2} y={top / 2} text={f.footer} size={fit(f.footer, inner, top * 0.5)} color="#FFFFFF" />
          <polygon points={`${W},${midTop} ${W},${midTop + midH} ${W - W * 0.22},${midTop + midH}`} fill={f.primary} opacity={0.18} />
          <Line x={pad} y={midTop + midH * 0.38} text={f.headline} size={fit(f.headline, inner * 0.92, midH * 0.36)} color={f.text} anchor="start" />
          <Line x={pad} y={midTop + midH * 0.74} text={f.subline} size={fit(f.subline, inner * 0.8, midH * 0.2, 0.64)} color={f.text} weight={600} anchor="start" />
          <rect y={H - bottom} width={W} height={bottom} fill={f.accent} />
          <Line x={W / 2} y={H - bottom / 2} text={f.contact} size={fit(f.contact, inner, bottom * 0.5, 0.64)} color="#FFFFFF" weight={700} />
        </>
      );
    }
    case 'banner':
      return (
        <>
          <rect width={W} height={H} fill={f.background} />
          <rect y={H * 0.82} width={W} height={H * 0.18} fill={f.accent} />
          <Line x={W / 2} y={H * 0.36} text={f.headline} size={fit(f.headline, inner, H * 0.34)} color={f.text} />
          <Line x={W / 2} y={H * 0.63} text={f.subline} size={fit(f.subline, inner * 0.9, H * 0.13, 0.64)} color={f.text} weight={600} />
          <Line x={W / 2} y={H * 0.91} text={f.contact} size={fit(f.contact, inner, H * 0.1, 0.64)} color="#FFFFFF" weight={700} />
        </>
      );
    case 'logo-center': {
      const logoSize = Math.min(H * 0.42, W * 0.5);
      return (
        <>
          <rect width={W} height={H} fill={f.background} />
          {art.logo ? (
            <image href={art.logo} x={(W - logoSize) / 2} y={H * 0.08} width={logoSize} height={logoSize} preserveAspectRatio="xMidYMid meet" />
          ) : (
            <g>
              <circle cx={W / 2} cy={H * 0.08 + logoSize / 2} r={logoSize / 2} fill={f.accent} opacity={0.15} />
              <Line x={W / 2} y={H * 0.08 + logoSize / 2} text="LOGO" size={logoSize * 0.22} color={f.accent} />
            </g>
          )}
          <Line x={W / 2} y={H * 0.66} text={f.headline} size={fit(f.headline, inner, H * 0.15)} color={f.primary} />
          <Line x={W / 2} y={H * 0.82} text={f.subline} size={fit(f.subline, inner * 0.85, H * 0.08, 0.64)} color={f.text} weight={500} />
          <Line x={W / 2} y={H * 0.93} text={f.contact} size={fit(f.contact, inner, H * 0.05, 0.64)} color={f.text} weight={600} />
        </>
      );
    }
    case 'headline':
    default:
      return (
        <>
          <rect width={W} height={H} fill={f.background} />
          <rect x={pad} y={H * 0.08} width={W * 0.12} height={H * 0.03} fill={f.accent} />
          {art.logo ? (
            <image href={art.logo} x={W - pad - W * 0.16} y={H * 0.05} width={W * 0.16} height={H * 0.16} preserveAspectRatio="xMaxYMin meet" />
          ) : null}
          <Line x={W / 2} y={H * 0.42} text={f.headline} size={fit(f.headline, inner, H * 0.26)} color={f.primary} />
          <Line x={W / 2} y={H * 0.64} text={f.subline} size={fit(f.subline, inner * 0.9, H * 0.11, 0.64)} color={f.text} weight={600} />
          <rect x={W * 0.3} y={H * 0.76} width={W * 0.4} height={2} fill={f.text} opacity={0.25} />
          <Line x={W / 2} y={H * 0.86} text={f.contact} size={fit(f.contact, inner, H * 0.08, 0.64)} color={f.text} weight={600} />
        </>
      );
  }
}

/** Draw the artwork SVG to a PNG (for the quote's proof image). */
export async function artworkToPng(svg: SVGSVGElement, widthPx = 1600): Promise<Blob | null> {
  const vb = svg.viewBox.baseVal;
  const height = Math.round((widthPx * vb.height) / vb.width);
  const markup = new XMLSerializer().serializeToString(svg);
  const url = URL.createObjectURL(new Blob([markup], { type: 'image/svg+xml;charset=utf-8' }));
  try {
    const img = new Image();
    img.decoding = 'async';
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error('Could not render the design.'));
      img.src = url;
    });
    const canvas = document.createElement('canvas');
    canvas.width = widthPx;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(img, 0, 0, widthPx, height);
    return await new Promise((resolve) => canvas.toBlob((b) => resolve(b), 'image/png'));
  } finally {
    URL.revokeObjectURL(url);
  }
}
