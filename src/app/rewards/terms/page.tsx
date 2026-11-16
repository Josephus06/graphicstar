import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { acceptTerms, logout } from '@/lib/rewards/actions/auth';
import { homeFor, requireUser } from '@/lib/rewards/auth';
import { termsFor } from '@/lib/rewards/constants';

export const metadata = { title: 'Terms & Conditions' };

/** Shown once after login to staff and members; the copy depends on their branch. */
export default async function TermsPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const user = await requireUser();
  if (user.role === 'admin' || user.terms_accepted) redirect(homeFor(user.role));
  const terms = termsFor(user.branch);
  const { error } = await searchParams;

  return (
    <div className="shell pb-24 pt-32 sm:pt-40">
      <div className="mx-auto max-w-[600px] rounded-media bg-white p-6 shadow-card sm:p-9">
        <h1 className="text-center text-[26px] font-semibold tracking-tightest text-ink">Terms &amp; Conditions</h1>
        <p className="mt-1 text-center text-[14px] text-grey-muted">{terms.company}</p>

        <div className="mt-6 max-h-[60vh] overflow-y-auto pr-2 text-[15px] leading-relaxed text-ink">
          <p>{terms.intro}</p>
          <ul className="mt-4 list-disc space-y-2 pl-5">
            {terms.rules.map((rule) => (
              <li key={rule}>{rule}</li>
            ))}
          </ul>
        </div>

        <form action={acceptTerms} className="mt-6">
          <input type="hidden" name="terms_version" value={terms.version} />
          <label className="flex items-start gap-3 text-[15px] text-ink">
            <input type="checkbox" name="agree" required className="mt-1 h-4 w-4 accent-blue" />
            I accept the terms and conditions.
          </label>
          {error ? <p className="mt-2 text-[13px] font-medium text-magenta">Please accept the terms to continue.</p> : null}
          <Button type="submit" className="mt-5 w-full">
            Continue
          </Button>
        </form>
        <form action={logout} className="mt-3 text-center">
          <button type="submit" className="text-[13px] font-semibold text-grey-muted hover:text-ink">
            Log out
          </button>
        </form>
      </div>
    </div>
  );
}
