import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { data: mistakes } = await locals.supabase
		.from('mistakes')
		.select('*')
		.order('created_at', { ascending: false });

	const { data: tradeMistakes } = await locals.supabase
		.from('trade_mistakes')
		.select('mistake_id, trade_id, trades(id, asset, pnl, opened_at)');

	const mistakeStats: Record<
		string,
		{ count: number; totalLoss: number; recentTrades: { asset: string; pnl: number | null; date: string }[] }
	> = {};

	tradeMistakes?.forEach((tm) => {
		const trade = tm.trades as unknown as {
			id: string;
			asset: string;
			pnl: number | null;
			opened_at: string;
		};
		if (!mistakeStats[tm.mistake_id]) {
			mistakeStats[tm.mistake_id] = { count: 0, totalLoss: 0, recentTrades: [] };
		}
		const stats = mistakeStats[tm.mistake_id];
		stats.count++;
		if (trade.pnl !== null && trade.pnl < 0) {
			stats.totalLoss += trade.pnl;
		}
		if (stats.recentTrades.length < 5) {
			stats.recentTrades.push({ asset: trade.asset, pnl: trade.pnl, date: trade.opened_at });
		}
	});

	return {
		mistakes: mistakes ?? [],
		mistakeStats
	};
};

export const actions: Actions = {
	create: async ({ request, locals }) => {
		const { user } = await locals.safeGetSession();
		if (!user) return fail(401, { error: 'Not authenticated' });

		const fd = await request.formData();
		const name = fd.get('name') as string;
		const description = fd.get('description') as string;

		if (!name) return fail(400, { error: 'Name is required' });

		const { error } = await locals.supabase
			.from('mistakes')
			.insert({ user_id: user.id, name, description: description || null });

		if (error) return fail(500, { error: error.message });
		return { success: true };
	},

	delete: async ({ request, locals }) => {
		const fd = await request.formData();
		const id = fd.get('id') as string;

		const { error } = await locals.supabase.from('mistakes').delete().eq('id', id);
		if (error) return fail(500, { error: error.message });
		return { success: true };
	}
};
