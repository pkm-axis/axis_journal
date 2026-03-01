import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { data: strategies } = await locals.supabase
		.from('strategies')
		.select('*')
		.order('created_at', { ascending: false });

	// Get trade counts per strategy
	const { data: tradeCounts } = await locals.supabase
		.from('trade_strategies')
		.select('strategy_id');

	const countMap: Record<string, number> = {};
	tradeCounts?.forEach((tc) => {
		countMap[tc.strategy_id] = (countMap[tc.strategy_id] || 0) + 1;
	});

	const { data: tags } = await locals.supabase
		.from('tags')
		.select('*')
		.order('created_at', { ascending: false });

	return {
		strategies: strategies ?? [],
		tags: tags ?? [],
		strategyCounts: countMap
	};
};

export const actions: Actions = {
	createStrategy: async ({ request, locals }) => {
		const { user } = await locals.safeGetSession();
		if (!user) return fail(401, { error: 'Not authenticated' });

		const fd = await request.formData();
		const name = fd.get('name') as string;
		const description = fd.get('description') as string;

		if (!name) return fail(400, { error: 'Name is required' });

		const { error } = await locals.supabase
			.from('strategies')
			.insert({ user_id: user.id, name, description: description || null });

		if (error) return fail(500, { error: error.message });
		return { strategySuccess: true };
	},

	updateStrategy: async ({ request, locals }) => {
		const { user } = await locals.safeGetSession();
		if (!user) return fail(401, { error: 'Not authenticated' });

		const fd = await request.formData();
		const id = fd.get('id') as string;
		const name = fd.get('name') as string;
		const description = fd.get('description') as string;

		if (!name) return fail(400, { error: 'Name is required' });

		const { error } = await locals.supabase
			.from('strategies')
			.update({ name, description: description || null })
			.eq('id', id);

		if (error) return fail(500, { error: error.message });
		return { strategySuccess: true };
	},

	deleteStrategy: async ({ request, locals }) => {
		const fd = await request.formData();
		const id = fd.get('id') as string;

		const { error } = await locals.supabase.from('strategies').delete().eq('id', id);
		if (error) return fail(500, { error: error.message });
		return { strategySuccess: true };
	},

	createTag: async ({ request, locals }) => {
		const { user } = await locals.safeGetSession();
		if (!user) return fail(401, { error: 'Not authenticated' });

		const fd = await request.formData();
		const name = fd.get('name') as string;
		const color = fd.get('color') as string;

		if (!name) return fail(400, { error: 'Name is required' });

		const { error } = await locals.supabase
			.from('tags')
			.insert({ user_id: user.id, name, color: color || null });

		if (error) return fail(500, { error: error.message });
		return { tagSuccess: true };
	},

	deleteTag: async ({ request, locals }) => {
		const fd = await request.formData();
		const id = fd.get('id') as string;

		const { error } = await locals.supabase.from('tags').delete().eq('id', id);
		if (error) return fail(500, { error: error.message });
		return { tagSuccess: true };
	}
};
