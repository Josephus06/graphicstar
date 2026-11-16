import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Rewards',
  description: 'Sign in to GraphicStar Rewards to check your points and redeem rewards.',
  robots: { index: false, follow: false },
};

// Every Rewards page reads the session cookie and live data.
export const dynamic = 'force-dynamic';

export default function RewardsLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-[70vh] bg-grey-bg">{children}</div>;
}
