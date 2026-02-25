import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { user } = await locals.safeGetSession();

	// Fetch all accounts
	const { data: accounts } = await locals.supabase
		.from('accounts')
		.select('*')
		.order('created_at', { ascending: false });

	// Fetch recent closed trades for stats
	const { data: closedTrades } = await locals.supabase
		.from('trades')
		.select('pnl, risk_reward, direction, asset_type')
		.eq('status', 'closed');

	// Recent trades
	const { data: recentTrades } = await locals.supabase
		.from('trades')
		.select('*, accounts!inner(name, currency)')
		.order('opened_at', { ascending: false })
		.limit(5);

	// Daily performance (last 30 days)
	const thirtyDaysAgo = new Date();
	thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

	const { data: dailyPerf } = await locals.supabase
		.from('daily_performance')
		.select('*')
		.gte('date', thirtyDaysAgo.toISOString().split('T')[0])
		.order('date');

	// Compute stats
	const trades = closedTrades ?? [];
	const wins = trades.filter((t) => (t.pnl ?? 0) > 0);
	const totalPnl = trades.reduce((s, t) => s + (t.pnl ?? 0), 0);
	const winRate = trades.length > 0 ? (wins.length / trades.length) * 100 : 0;
	const avgRR =
		trades.length > 0
			? trades.reduce((s, t) => s + (t.risk_reward ?? 0), 0) / trades.length
			: 0;

	// Drawdown
	let peak = 0;
	let maxDrawdown = 0;
	let cum = 0;
	for (const t of trades) {
		cum += t.pnl ?? 0;
		if (cum > peak) peak = cum;
		const dd = peak - cum;
		if (dd > maxDrawdown) maxDrawdown = dd;
	}

	return {
		accounts: accounts ?? [],
		recentTrades: recentTrades ?? [],
		dailyPerf: dailyPerf ?? [],
		stats: {
			totalPnl,
			winRate,
			avgRR,
			maxDrawdown,
			totalTrades: trades.length,
			wins: wins.length
		}
	};
};
