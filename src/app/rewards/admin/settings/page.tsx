import { RatesForm } from '@/components/rewards/RatesForm';
import { PageTitle, Panel } from '@/components/rewards/Shell';
import { requireRole } from '@/lib/rewards/auth';
import { getRates } from '@/lib/rewards/settings';

export const metadata = { title: 'Point Settings' };

export default async function SettingsPage() {
  await requireRole('admin');
  return (
    <>
      <PageTitle
        title="Point settings"
        sub="How many pesos a customer spends to earn 1 point. A change applies to points awarded from now on; points members already earned are kept."
      />
      <Panel>
        <RatesForm rates={getRates()} />
      </Panel>
    </>
  );
}
