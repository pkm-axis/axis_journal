import { error, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { data: account } = await locals.supabase
		.from('accounts')
		.select('*')
		.eq('id', params.id)
		.single();

	if (!account) error(404, 'Account not found');
	if (account.type !== 'prop_firm') error(400, 'Not a prop firm account');

	const { data: rules } = await locals.supabase
		.from('prop_firm_rules')
		.select('*')
		.eq('account_id', params.id)
		.single();

	// Get daily performance for rule checking
	const { data: dailyPerf } = await locals.supabase
		.from('daily_performance')
		.select('*')
		.eq('account_id', params.id)
		.order('date', { ascending: true });

	// Get trades for this account
	const { data: trades } = await locals.supabase
		.from('trades')
		.select('pnl, closed_at, status')
		.eq('account_id', params.id)
		.eq('status', 'closed');

	// Calculate violations
	const dailyData = dailyPerf ?? [];
	const closedTrades = trades ?? [];

	// Days traded
	const tradingDays = new Set(dailyData.map((d) => d.date)).size;

	// Today's P&L
	const today = new Date().toISOString().split('T')[0];
	const todayPerf = dailyData.find((d) => d.date === today);
	const todayPnl = todayPerf?.pnl ?? 0;

	// Total P&L from initial
	const totalPnl = account.current_balance - account.initial_balance;

	// Max drawdown from peak
	let peak = 0;
	let maxDrawdown = 0;
	let cumPnl = 0;
	for (const day of dailyData) {
		cumPnl += day.pnl;
		if (cumPnl > peak) peak = cumPnl;
		const dd = peak - cumPnl;
		if (dd > maxDrawdown) maxDrawdown = dd;
	}

	// Check violations
	const violations: Array<{ rule: string; current: number; limit: number; breached: boolean }> = [];

	if (rules) {
		if (rules.max_daily_loss !== null) {
			violations.push({
				rule: 'Max Daily Loss',
				current: Math.abs(Math.min(0, todayPnl)),
				limit: rules.max_daily_loss,
				breached: Math.abs(Math.min(0, todayPnl)) >= rules.max_daily_loss
			});
		}
		if (rules.max_drawdown !== null) {
			violations.push({
				rule: 'Max Drawdown',
				current: maxDrawdown,
				limit: rules.max_drawdown,
				breached: maxDrawdown >= rules.max_drawdown
			});
		}
		if (rules.profit_target !== null) {
			violations.push({
				rule: 'Profit Target',
				current: Math.max(0, totalPnl),
				limit: rules.profit_target,
				breached: false // This is a goal, not a violation
			});
		}
		if (rules.min_trading_days !== null) {
			violations.push({
				rule: 'Min Trading Days',
				current: tradingDays,
				limit: rules.min_trading_days,
				breached: false
			});
		}
	}

	return {
		account,
		rules,
		violations,
		metrics: {
			todayPnl,
			totalPnl,
			maxDrawdown,
			tradingDays
		},
		dailyPerf: dailyData
	};
};

export const actions: Actions = {
	save: async ({ request, params, locals }) => {
		const fd = await request.formData();

		const ruleData = {
			account_id: params.id,
			max_daily_loss: fd.get('max_daily_loss') ? parseFloat(fd.get('max_daily_loss') as string) : null,
			max_drawdown: fd.get('max_drawdown') ? parseFloat(fd.get('max_drawdown') as string) : null,
			profit_target: fd.get('profit_target') ? parseFloat(fd.get('profit_target') as string) : null,
			min_trading_days: fd.get('min_trading_days') ? parseInt(fd.get('min_trading_days') as string) : null,
			challenge_start: (fd.get('challenge_start') as string) || null,
			challenge_end: (fd.get('challenge_end') as string) || null,
			status: (fd.get('status') as 'active' | 'passed' | 'failed') || 'active'
		};

		const { data: existing } = await locals.supabase
			.from('prop_firm_rules')
			.select('id')
			.eq('account_id', params.id)
			.single();

		if (existing) {
			const { error: err } = await locals.supabase
				.from('prop_firm_rules')
				.update(ruleData)
				.eq('account_id', params.id);
			if (err) return fail(500, { error: err.message });
		} else {
			const { error: err } = await locals.supabase.from('prop_firm_rules').insert(ruleData);
			if (err) return fail(500, { error: err.message });
		}

		return { success: true };
	}
};
