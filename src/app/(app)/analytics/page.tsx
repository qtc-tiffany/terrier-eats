// src/app/(app)/analytics/page.tsx
// Server Component: fetch data securely on the server and pass to the client UI.

import AnalyticsClient from "./AnalyticsClient";
import { getBalances, getRecentSpendingTx } from "./actions";

export default async function AnalyticsPage() {
  const days = 30;

  // Fetch balances and recent transactions in parallel.
  const [balances, tx] = await Promise.all([getBalances(), getRecentSpendingTx(days)]);

  return <AnalyticsClient balances={balances} tx={tx} days={days} />;
}