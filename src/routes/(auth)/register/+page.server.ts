import { redirect, fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const { session } = await locals.safeGetSession();
	if (session) redirect(303, '/dashboard');
};

export const actions: Actions = {
	register: async ({ request, locals }) => {
		const formData = await request.formData();
		const name = formData.get('name') as string;
		const email = formData.get('email') as string;
		const password = formData.get('password') as string;

		const { error } = await locals.supabase.auth.signUp({
			email,
			password,
			options: {
				data: { full_name: name }
			}
		});

		if (error) {
			return fail(400, { error: error.message });
		}

		return { success: true };
	},

	oauth: async ({ request, locals, url }) => {
		const formData = await request.formData();
		const provider = formData.get('provider') as 'google' | 'github';

		const { data, error } = await locals.supabase.auth.signInWithOAuth({
			provider,
			options: {
				redirectTo: `${url.origin}/callback`
			}
		});

		if (error) {
			return fail(400, { error: error.message });
		}

		if (data.url) {
			redirect(303, data.url);
		}
	}
};
