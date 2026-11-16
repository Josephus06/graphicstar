'use client';

export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      title="Print or save as PDF"
      className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white text-ink shadow-pill transition-transform hover:scale-110 print:hidden"
    >
      <span className="sr-only">Print or save as PDF</span>
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <path d="M6 9V3h12v6M6 18H4a1 1 0 0 1-1-1v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6a1 1 0 0 1-1 1h-2" strokeLinejoin="round" />
        <path d="M6 14h12v7H6z" strokeLinejoin="round" />
      </svg>
    </button>
  );
}
