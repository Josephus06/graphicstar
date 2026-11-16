import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Suspense } from 'react';
import { LoginForm } from '@/components/rewards/AuthForms';
import { Notice } from '@/components/rewards/Notice';
import { currentUser, homeFor } from '@/lib/rewards/auth';

export default async function RewardsLoginPage() {
  const user = await currentUser();
  if (user) redirect(user.role !== 'admin' && !user.terms_accepted ? '/rewards/terms' : homeFor(user.role));

  return (
    <div className="shell grid gap-10 pb-24 pt-32 sm:pt-40 md:grid-cols-2 md:items-center">
      <div>
        <p className="eyebrow text-orange">GraphicStar Rewards</p>
        <h1 className="mt-4 text-[38px] font-semibold leading-[1.05] tracking-tightest text-ink sm:text-[52px]">
          Every print earns you points.
        </h1>
        <p className="body-copy mt-5 max-w-[46ch]">
          Sign in to see your points balance, your purchase history and the rewards you can redeem at the counter.
        </p>
      </div>

      <div className="rounded-media bg-white p-6 shadow-card sm:p-9">
        <h2 className="text-[22px] font-semibold text-ink">Log in</h2>
        <Suspense fallback={null}>
          <Notice />
        </Suspense>
        <div className="mt-6">
          <LoginForm />
        </div>
        <p className="mt-6 text-center text-[14px] text-grey-muted">
          New member?{' '}
          <Link href="/rewards/register" className="font-semibold text-blue hover:underline">
            Create your Rewards account
          </Link>
        </p>
      </div>
    </div>
  );
}
