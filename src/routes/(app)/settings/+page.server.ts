import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { user } = await locals.safeGetSession();

	const { data: profile } = await locals.supabase
		.from('profiles')
		.select('*')
		.eq('id', user!.id)
		.single();

	return { profile, email: user?.email };
};

export const actions: Actions = {
	updateProfile: async ({ request, locals }) => {
		const { user } = await locals.safeGetSession();
		if (!user) return fail(401, { error: 'Not authenticated' });

		const fd = await request.formData();
		const display_name = fd.get('display_name') as string;

		const { error } = await locals.supabase
			.from('profiles')
			.update({ display_name })
			.eq('id', user.id);

		if (error) return fail(500, { error: error.message });
		return { success: true };
	}
};
