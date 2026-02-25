import { error, redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const { data: trade } = await locals.supabase
		.from('trades')
		.select('*')
		.eq('id', params.id)
		.single();

	if (!trade) error(404, 'Trade not found');

	const { data: accounts } = await locals.supabase
		.from('accounts')
		.select('id, name, currency')
		.eq('is_active', true)
		.order('name');

	return { trade, accounts: accounts ?? [] };
};

export const actions: Actions = {
	default: async ({ request, params, locals }) => {
		const fd = await request.formData();

		const updates: Record<string, unknown> = {};
		const fields = [
			'asset',
			'asset_type',
			'direction',
			'entry_price',
			'exit_price',
			'position_size',
			'stop_loss',
			'take_profit',
			'fees',
			'opened_at'
		];

		for (const field of fields) {
			const val = fd.get(field) as string;
			if (val === '' || val === null) {
				if (['exit_price', 'stop_loss', 'take_profit'].includes(field)) {
					updates[field] = null;
				}
				continue;
			}
			if (
				['entry_price', 'exit_price', 'position_size', 'stop_loss', 'take_profit', 'fees'].includes(
					field
				)
			) {
				updates[field] = parseFloat(val);
			} else {
				updates[field] = field === 'asset' ? val.toUpperCase() : val;
			}
		}

		if (updates.exit_price !== null && updates.exit_price !== undefined) {
			updates.status = 'closed';
		}

		const { error: err } = await locals.supabase
			.from('trades')
			.update(updates)
			.eq('id', params.id);

		if (err) return fail(500, { error: err.message });

		redirect(303, `/trades/${params.id}`);
	}
};
