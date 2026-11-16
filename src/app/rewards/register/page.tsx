import Link from 'next/link';
import { redirect } from 'next/navigation';
import { RegisterForm } from '@/components/rewards/AuthForms';
import { currentUser, homeFor } from '@/lib/rewards/auth';

export const metadata = { title: 'Join Rewards' };

export default async function RegisterPage() {
  const user = await currentUser();
  if (user) redirect(homeFor(user.role));

  return (
    <div className="shell pb-24 pt-32 sm:pt-40">
      <div className="mx-auto max-w-[720px] rounded-media bg-white p-6 shadow-card sm:p-10">
        <p className="eyebrow text-orange">GraphicStar Rewards</p>
        <h1 className="mt-3 text-[30px] font-semibold tracking-tightest text-ink">Member registration</h1>
        <p className="mt-2 text-[15px] text-grey-muted">Create your account. Our team will link it to your GraphicStar customer record so your purchases earn points.</p>
        <div className="mt-8">
          <RegisterForm />
        </div>
        <p className="mt-6 text-center text-[14px] text-grey-muted">
          Already a member?{' '}
          <Link href="/rewards" className="font-semibold text-blue hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
