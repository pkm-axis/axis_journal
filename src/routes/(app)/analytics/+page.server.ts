import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const accountId = url.searchParams.get('account');
	const assetType = url.searchParams.get('asset_type');
	const strategyId = url.searchParams.get('strategy');
	const dateFrom = url.searchParams.get('from');
	const dateTo = url.searchParams.get('to');

	// Fetch all closed trades for analytics
	let query = locals.supabase
		.from('trades')
		.select('*, accounts!inner(name, currency, type)')
		.eq('status', 'closed')
		.order('closed_at', { ascending: true });

	if (accountId) query = query.eq('account_id', accountId);
	if (assetType) query = query.eq('asset_type', assetType);
	if (dateFrom) query = query.gte('closed_at', dateFrom);
	if (dateTo) query = query.lte('closed_at', dateTo);

	const { data: trades } = await query;

	// If strategy filter, get trade IDs for that strategy
	let filteredTrades = trades ?? [];
	if (strategyId) {
		const { data: strategyTrades } = await locals.supabase
			.from('trade_strategies')
			.select('trade_id')
			.eq('strategy_id', strategyId);

		const tradeIds = new Set(strategyTrades?.map((st) => st.trade_id));
		filteredTrades = filteredTrades.filter((t) => tradeIds.has(t.id));
	}

	// Compute analytics
	const closedTrades = filteredTrades.filter((t) => t.pnl !== null);
	const wins = closedTrades.filter((t) => t.pnl! > 0);
	const losses = closedTrades.filter((t) => t.pnl! <= 0);

	const totalPnl = closedTrades.reduce((sum, t) => sum + (t.pnl ?? 0), 0);
	const winRate = closedTrades.length > 0 ? (wins.length / closedTrades.length) * 100 : 0;
	const avgWin = wins.length > 0 ? wins.reduce((s, t) => s + t.pnl!, 0) / wins.length : 0;
	const avgLoss =
		losses.length > 0 ? Math.abs(losses.reduce((s, t) => s + t.pnl!, 0) / losses.length) : 0;
	const avgRR =
		closedTrades.length > 0
			? closedTrades.reduce((s, t) => s + (t.risk_reward ?? 0), 0) / closedTrades.length
			: 0;

	// Expectancy: (Win% * Avg Win) - (Loss% * Avg Loss)
	const winPct = closedTrades.length > 0 ? wins.length / closedTrades.length : 0;
	const lossPct = closedTrades.length > 0 ? losses.length / closedTrades.length : 0;
	const expectancy = winPct * avgWin - lossPct * avgLoss;

	// Cumulative P&L over time for chart
	let cumPnl = 0;
	const pnlOverTime = closedTrades.map((t) => {
		cumPnl += t.pnl ?? 0;
		return {
			date: t.closed_at?.split('T')[0] ?? '',
			pnl: t.pnl ?? 0,
			cumulative: cumPnl
		};
	});

	// Max drawdown
	let peak = 0;
	let maxDrawdown = 0;
	for (const point of pnlOverTime) {
		if (point.cumulative > peak) peak = point.cumulative;
		const dd = peak - point.cumulative;
		if (dd > maxDrawdown) maxDrawdown = dd;
	}

	// Performance by asset type
	const byAssetType: Record<string, { count: number; pnl: number; wins: number }> = {};
	closedTrades.forEach((t) => {
		if (!byAssetType[t.asset_type]) {
			byAssetType[t.asset_type] = { count: 0, pnl: 0, wins: 0 };
		}
		byAssetType[t.asset_type].count++;
		byAssetType[t.asset_type].pnl += t.pnl ?? 0;
		if ((t.pnl ?? 0) > 0) byAssetType[t.asset_type].wins++;
	});

	// Performance by direction
	const longTrades = closedTrades.filter((t) => t.direction === 'long');
	const shortTrades = closedTrades.filter((t) => t.direction === 'short');

	const { data: accounts } = await locals.supabase
		.from('accounts')
		.select('id, name')
		.order('name');

	const { data: strategies } = await locals.supabase
		.from('strategies')
		.select('id, name')
		.order('name');

	return {
		stats: {
			totalTrades: closedTrades.length,
			totalPnl,
			winRate,
			avgWin,
			avgLoss,
			avgRR,
			expectancy,
			maxDrawdown,
			profitFactor: avgLoss > 0 ? (avgWin * wins.length) / (avgLoss * losses.length) : 0,
			wins: wins.length,
			losses: losses.length
		},
		pnlOverTime,
		byAssetType,
		directionStats: {
			long: {
				count: longTrades.length,
				pnl: longTrades.reduce((s, t) => s + (t.pnl ?? 0), 0),
				winRate:
					longTrades.length > 0
						? (longTrades.filter((t) => (t.pnl ?? 0) > 0).length / longTrades.length) * 100
						: 0
			},
			short: {
				count: shortTrades.length,
				pnl: shortTrades.reduce((s, t) => s + (t.pnl ?? 0), 0),
				winRate:
					shortTrades.length > 0
						? (shortTrades.filter((t) => (t.pnl ?? 0) > 0).length / shortTrades.length) * 100
						: 0
			}
		},
		accounts: accounts ?? [],
		strategies: strategies ?? [],
		filters: { accountId, assetType, strategyId, dateFrom, dateTo }
	};
};
