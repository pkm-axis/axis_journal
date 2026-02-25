import type { PageServerLoad } from './$types';

interface AccountStats {
	id: string;
	name: string;
	type: string;
	totalTrades: number;
	wins: number;
	winRate: number;
	totalPnl: number;
	avgPnl: number;
	avgRR: number;
	avgConfidence: number | null;
	followedPlanRate: number | null;
	mistakeCount: number;
}

export const load: PageServerLoad = async ({ locals }) => {
	const { data: accounts } = await locals.supabase
		.from('accounts')
		.select('id, name, type, initial_balance, current_balance, currency')
		.order('type');

	const { data: allTrades } = await locals.supabase
		.from('trades')
		.select('id, account_id, pnl, risk_reward, direction, status')
		.eq('status', 'closed');

	const { data: allPsych } = await locals.supabase
		.from('trade_psychology')
		.select('trade_id, confidence_score, followed_plan');

	const { data: allMistakes } = await locals.supabase
		.from('trade_mistakes')
		.select('trade_id');

	const trades = allTrades ?? [];
	const psychMap = new Map<string, { confidence_score: number | null; followed_plan: boolean | null }>();
	allPsych?.forEach((p) => psychMap.set(p.trade_id, p));
	const mistakesByTrade = new Map<string, number>();
	allMistakes?.forEach((m) => {
		mistakesByTrade.set(m.trade_id, (mistakesByTrade.get(m.trade_id) ?? 0) + 1);
	});

	// Build per-account stats
	const accountStats: AccountStats[] = (accounts ?? []).map((account) => {
		const acctTrades = trades.filter((t) => t.account_id === account.id);
		const wins = acctTrades.filter((t) => (t.pnl ?? 0) > 0);
		const totalPnl = acctTrades.reduce((s, t) => s + (t.pnl ?? 0), 0);
		const avgRR =
			acctTrades.length > 0
				? acctTrades.reduce((s, t) => s + (t.risk_reward ?? 0), 0) / acctTrades.length
				: 0;

		const confidences = acctTrades
			.map((t) => psychMap.get(t.id)?.confidence_score)
			.filter((c): c is number => c !== null && c !== undefined);
		const avgConfidence =
			confidences.length > 0 ? confidences.reduce((s, c) => s + c, 0) / confidences.length : null;

		const planFollowed = acctTrades
			.map((t) => psychMap.get(t.id)?.followed_plan)
			.filter((f): f is boolean => f !== null && f !== undefined);
		const followedPlanRate =
			planFollowed.length > 0
				? (planFollowed.filter((f) => f).length / planFollowed.length) * 100
				: null;

		const mistakeCount = acctTrades.reduce(
			(s, t) => s + (mistakesByTrade.get(t.id) ?? 0),
			0
		);

		return {
			id: account.id,
			name: account.name,
			type: account.type,
			totalTrades: acctTrades.length,
			wins: wins.length,
			winRate: acctTrades.length > 0 ? (wins.length / acctTrades.length) * 100 : 0,
			totalPnl,
			avgPnl: acctTrades.length > 0 ? totalPnl / acctTrades.length : 0,
			avgRR,
			avgConfidence,
			followedPlanRate,
			mistakeCount
		};
	});

	// Group by type
	const byType: Record<string, AccountStats[]> = {};
	accountStats.forEach((a) => {
		if (!byType[a.type]) byType[a.type] = [];
		byType[a.type].push(a);
	});

	// Generate insights
	const insights: string[] = [];

	const paperAccounts = byType['paper'] ?? [];
	const personalAccounts = byType['personal'] ?? [];
	const propAccounts = byType['prop_firm'] ?? [];

	const paperAvgWin = paperAccounts.length > 0
		? paperAccounts.reduce((s, a) => s + a.winRate, 0) / paperAccounts.length
		: 0;
	const personalAvgWin = personalAccounts.length > 0
		? personalAccounts.reduce((s, a) => s + a.winRate, 0) / personalAccounts.length
		: 0;

	if (paperAccounts.length > 0 && personalAccounts.length > 0) {
		if (paperAvgWin > personalAvgWin + 10) {
			insights.push(
				`Your paper trading win rate (${paperAvgWin.toFixed(1)}%) is significantly higher than real accounts (${personalAvgWin.toFixed(1)}%). Psychology may be affecting your real trading.`
			);
		}
		if (personalAvgWin > paperAvgWin + 10) {
			insights.push(
				`You perform better in real accounts (${personalAvgWin.toFixed(1)}%) than paper (${paperAvgWin.toFixed(1)}%). You may be more focused when real money is at stake.`
			);
		}
	}

	// Mistake comparison
	const paperMistakes = paperAccounts.reduce((s, a) => s + a.mistakeCount, 0);
	const personalMistakes = personalAccounts.reduce((s, a) => s + a.mistakeCount, 0);
	const paperTradeCount = paperAccounts.reduce((s, a) => s + a.totalTrades, 0);
	const personalTradeCount = personalAccounts.reduce((s, a) => s + a.totalTrades, 0);

	if (paperTradeCount > 0 && personalTradeCount > 0) {
		const paperMistakeRate = paperMistakes / paperTradeCount;
		const personalMistakeRate = personalMistakes / personalTradeCount;
		if (personalMistakeRate > paperMistakeRate * 1.5) {
			insights.push(
				`You make more mistakes in real trading. Consider slowing down and following your paper trading discipline.`
			);
		}
	}

	// Plan adherence comparison
	const paperPlanRate = paperAccounts.reduce((s, a) => s + (a.followedPlanRate ?? 0), 0) /
		Math.max(1, paperAccounts.filter((a) => a.followedPlanRate !== null).length);
	const personalPlanRate = personalAccounts.reduce((s, a) => s + (a.followedPlanRate ?? 0), 0) /
		Math.max(1, personalAccounts.filter((a) => a.followedPlanRate !== null).length);

	if (paperPlanRate > 0 && personalPlanRate > 0 && paperPlanRate > personalPlanRate + 15) {
		insights.push(
			`You follow your trading plan ${paperPlanRate.toFixed(0)}% of the time in paper trading but only ${personalPlanRate.toFixed(0)}% in real trading.`
		);
	}

	// Paper trading readiness
	const readinessSignals: Array<{ signal: string; met: boolean }> = [];
	if (paperAccounts.length > 0) {
		const totalPaperTrades = paperAccounts.reduce((s, a) => s + a.totalTrades, 0);
		readinessSignals.push({
			signal: 'At least 50 paper trades completed',
			met: totalPaperTrades >= 50
		});
		readinessSignals.push({
			signal: 'Paper trading win rate above 50%',
			met: paperAvgWin >= 50
		});
		readinessSignals.push({
			signal: 'Positive average P&L per trade',
			met:
				paperAccounts.reduce((s, a) => s + a.avgPnl, 0) / paperAccounts.length > 0
		});
		readinessSignals.push({
			signal: 'Plan adherence above 70%',
			met: paperPlanRate >= 70
		});
		const paperAvgConfidence = paperAccounts
			.map((a) => a.avgConfidence)
			.filter((c): c is number => c !== null);
		readinessSignals.push({
			signal: 'Average confidence score above 3',
			met:
				paperAvgConfidence.length > 0 &&
				paperAvgConfidence.reduce((s, c) => s + c, 0) / paperAvgConfidence.length >= 3
		});
	}

	return {
		accountStats,
		byType,
		insights,
		readinessSignals
	};
};
