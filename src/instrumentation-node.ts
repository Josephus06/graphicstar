/**
 * Replaces loyalty-gfx's `$schedule->command('sync:memberpoints')->hourly()`.
 * Only runs when ERP_API_URL and ERP_API_KEY are set; disable with REWARDS_ERP_SYNC=off.
 */
import { syncMemberPoints } from './lib/rewards/erp-sync';

const HOUR = 60 * 60 * 1000;

if (process.env.ERP_API_URL && process.env.ERP_API_KEY && process.env.REWARDS_ERP_SYNC !== 'off') {
  let running = false;
  setInterval(async () => {
    if (running) return;
    running = true;
    try {
      const report = await syncMemberPoints();
      console.log(`[rewards] ERP sync: ${report.lines.at(-1)}`);
    } catch (error) {
      console.error('[rewards] ERP sync failed', error);
    } finally {
      running = false;
    }
  }, HOUR).unref();
}
