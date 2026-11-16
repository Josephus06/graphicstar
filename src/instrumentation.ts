/**
 * Rewards: hourly ERP points sync (see instrumentation-node.ts). The Node-only
 * code sits behind this inlined runtime check so it never reaches the edge bundle.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./instrumentation-node');
  }
}
