import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { data: accounts, error } = await locals.supabase
		.from('accounts')
		.select('*')
		.order('created_at', { ascending: false });

	return {
		accounts: accounts ?? []
	};
};
