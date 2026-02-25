import { redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const { user } = await locals.safeGetSession();
		if (!user) return fail(401, { error: 'Not authenticated' });

		const formData = await request.formData();
		const name = formData.get('name') as string;
		const type = formData.get('type') as string;
		const platform = formData.get('platform') as string;
		const initial_balance = parseFloat(formData.get('initial_balance') as string) || 0;
		const currency = (formData.get('currency') as string) || 'USD';

		if (!name || !type) {
			return fail(400, { error: 'Name and type are required' });
		}

		const { data: account, error } = await locals.supabase
			.from('accounts')
			.insert({
				user_id: user.id,
				name,
				type: type as 'personal' | 'prop_firm' | 'paper',
				platform: platform || null,
				initial_balance,
				current_balance: initial_balance,
				currency
			})
			.select()
			.single();

		if (error) {
			return fail(500, { error: error.message });
		}

		redirect(303, `/accounts/${account.id}`);
	}
};
