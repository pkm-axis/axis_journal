import { error, redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { data: trade } = await locals.supabase
		.from('trades')
		.select('*, accounts!inner(name, currency, type)')
		.eq('id', params.id)
		.single();

	if (!trade) error(404, 'Trade not found');

	const { data: psychology } = await locals.supabase
		.from('trade_psychology')
		.select('*')
		.eq('trade_id', params.id)
		.single();

	const { data: strategies } = await locals.supabase
		.from('trade_strategies')
		.select('strategy_id, strategies(id, name)')
		.eq('trade_id', params.id);

	const { data: tags } = await locals.supabase
		.from('trade_tags')
		.select('tag_id, tags(id, name, color)')
		.eq('trade_id', params.id);

	const { data: mistakes } = await locals.supabase
		.from('trade_mistakes')
		.select('mistake_id, mistakes(id, name)')
		.eq('trade_id', params.id);

	const { data: media } = await locals.supabase
		.from('trade_media')
		.select('*')
		.eq('trade_id', params.id)
		.order('created_at');

	return {
		trade,
		psychology,
		strategies: strategies?.map((s) => (s.strategies as unknown as { id: string; name: string })) ?? [],
		tags: tags?.map((t) => (t.tags as unknown as { id: string; name: string; color: string | null })) ?? [],
		mistakes: mistakes?.map((m) => (m.mistakes as unknown as { id: string; name: string })) ?? [],
		media: media ?? []
	};
};

export const actions: Actions = {
	close: async ({ request, params, locals }) => {
		const fd = await request.formData();
		const exit_price = parseFloat(fd.get('exit_price') as string);
		const fees = parseFloat(fd.get('close_fees') as string) || 0;

		if (isNaN(exit_price)) {
			return fail(400, { error: 'Exit price is required' });
		}

		const { data: existing } = await locals.supabase
			.from('trades')
			.select('fees')
			.eq('id', params.id)
			.single();

		const { error: err } = await locals.supabase
			.from('trades')
			.update({
				exit_price,
				fees: (existing?.fees ?? 0) + fees,
				status: 'closed' as const
			})
			.eq('id', params.id);

		if (err) return fail(500, { error: err.message });
		return { success: true };
	},

	review: async ({ request, params, locals }) => {
		const fd = await request.formData();
		const review_notes = fd.get('review_notes') as string;

		const { data: existing } = await locals.supabase
			.from('trade_psychology')
			.select('id')
			.eq('trade_id', params.id)
			.single();

		if (existing) {
			await locals.supabase
				.from('trade_psychology')
				.update({ review_notes })
				.eq('trade_id', params.id);
		} else {
			await locals.supabase.from('trade_psychology').insert({
				trade_id: params.id,
				review_notes
			});
		}

		return { success: true };
	},

	delete: async ({ params, locals }) => {
		const { error: err } = await locals.supabase.from('trades').delete().eq('id', params.id);
		if (err) return fail(500, { error: err.message });
		redirect(303, '/trades');
	}
};
