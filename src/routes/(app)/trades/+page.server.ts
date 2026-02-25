import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals, url }) => {
	const accountId = url.searchParams.get('account');
	const assetType = url.searchParams.get('asset_type');
	const status = url.searchParams.get('status');

	let query = locals.supabase
		.from('trades')
		.select('*, accounts!inner(name, currency)')
		.order('opened_at', { ascending: false });

	if (accountId) query = query.eq('account_id', accountId);
	if (assetType) query = query.eq('asset_type', assetType);
	if (status) query = query.eq('status', status);

	const { data: trades } = await query;

	const { data: accounts } = await locals.supabase
		.from('accounts')
		.select('id, name')
		.eq('is_active', true)
		.order('name');

	return {
		trades: trades ?? [],
		accounts: accounts ?? [],
		filters: { accountId, assetType, status }
	};
};
