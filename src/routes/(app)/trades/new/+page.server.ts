import { redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const preselectedAccount = url.searchParams.get('account');

	const { data: accounts } = await locals.supabase
		.from('accounts')
		.select('id, name, type, currency')
		.eq('is_active', true)
		.order('name');

	const { data: strategies } = await locals.supabase
		.from('strategies')
		.select('id, name')
		.order('name');

	const { data: tags } = await locals.supabase.from('tags').select('id, name, color').order('name');

	const { data: mistakes } = await locals.supabase
		.from('mistakes')
		.select('id, name')
		.order('name');

	return {
		accounts: accounts ?? [],
		strategies: strategies ?? [],
		tags: tags ?? [],
		mistakes: mistakes ?? [],
		preselectedAccount
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const { user } = await locals.safeGetSession();
		if (!user) return fail(401, { error: 'Not authenticated' });

		const fd = await request.formData();

		const account_id = fd.get('account_id') as string;
		const asset = fd.get('asset') as string;
		const asset_type = fd.get('asset_type') as string;
		const direction = fd.get('direction') as string;
		const entry_price = parseFloat(fd.get('entry_price') as string);
		const exit_price = fd.get('exit_price') ? parseFloat(fd.get('exit_price') as string) : null;
		const position_size = parseFloat(fd.get('position_size') as string);
		const stop_loss = fd.get('stop_loss') ? parseFloat(fd.get('stop_loss') as string) : null;
		const take_profit = fd.get('take_profit') ? parseFloat(fd.get('take_profit') as string) : null;
		const fees = parseFloat(fd.get('fees') as string) || 0;
		const status = exit_price !== null ? 'closed' : 'open';
		const opened_at = (fd.get('opened_at') as string) || new Date().toISOString();

		if (!account_id || !asset || !asset_type || !direction || isNaN(entry_price) || isNaN(position_size)) {
			return fail(400, { error: 'Please fill in all required fields' });
		}

		const { data: trade, error } = await locals.supabase
			.from('trades')
			.insert({
				user_id: user.id,
				account_id,
				asset: asset.toUpperCase(),
				asset_type: asset_type as 'stocks' | 'crypto' | 'forex' | 'commodities' | 'indices',
				direction: direction as 'long' | 'short',
				entry_price,
				exit_price,
				position_size,
				stop_loss,
				take_profit,
				fees,
				status: status as 'open' | 'closed',
				opened_at
			})
			.select()
			.single();

		if (error) {
			return fail(500, { error: error.message });
		}

		// Save psychology data
		const notes = fd.get('psych_notes') as string;
		const emotion = fd.get('emotion') as string;
		const confidence_score = fd.get('confidence_score')
			? parseInt(fd.get('confidence_score') as string)
			: null;
		const followed_plan = fd.get('followed_plan') === 'on';

		if (notes || emotion || confidence_score || followed_plan) {
			await locals.supabase.from('trade_psychology').insert({
				trade_id: trade.id,
				notes: notes || null,
				emotion: emotion || null,
				confidence_score,
				followed_plan
			});
		}

		// Save strategy links
		const strategyIds = fd.getAll('strategy_ids') as string[];
		if (strategyIds.length > 0) {
			await locals.supabase.from('trade_strategies').insert(
				strategyIds.map((sid) => ({ trade_id: trade.id, strategy_id: sid }))
			);
		}

		// Save tag links
		const tagIds = fd.getAll('tag_ids') as string[];
		if (tagIds.length > 0) {
			await locals.supabase
				.from('trade_tags')
				.insert(tagIds.map((tid) => ({ trade_id: trade.id, tag_id: tid })));
		}

		// Save mistake links
		const mistakeIds = fd.getAll('mistake_ids') as string[];
		if (mistakeIds.length > 0) {
			await locals.supabase
				.from('trade_mistakes')
				.insert(mistakeIds.map((mid) => ({ trade_id: trade.id, mistake_id: mid })));
		}

		redirect(303, `/trades/${trade.id}`);
	}
};
