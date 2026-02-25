import { error, redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { data: account } = await locals.supabase
		.from('accounts')
		.select('*')
		.eq('id', params.id)
		.single();

	if (!account) {
		error(404, 'Account not found');
	}

	const { data: trades } = await locals.supabase
		.from('trades')
		.select('*')
		.eq('account_id', params.id)
		.order('opened_at', { ascending: false })
		.limit(10);

	const { data: propRules } = await locals.supabase
		.from('prop_firm_rules')
		.select('*')
		.eq('account_id', params.id)
		.single();

	return {
		account,
		recentTrades: trades ?? [],
		propRules
	};
};

export const actions: Actions = {
	update: async ({ request, params, locals }) => {
		const formData = await request.formData();
		const name = formData.get('name') as string;
		const platform = formData.get('platform') as string;
		const is_active = formData.get('is_active') === 'true';

		const { error: err } = await locals.supabase
			.from('accounts')
			.update({
				name,
				platform: platform || null,
				is_active
			})
			.eq('id', params.id);

		if (err) {
			return fail(500, { error: err.message });
		}

		return { success: true };
	},

	delete: async ({ params, locals }) => {
		const { error: err } = await locals.supabase.from('accounts').delete().eq('id', params.id);

		if (err) {
			return fail(500, { error: err.message });
		}

		redirect(303, '/accounts');
	}
};
