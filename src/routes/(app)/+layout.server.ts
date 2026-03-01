import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, cookies }) => {
	const { session, user } = await locals.safeGetSession();

	if (!session) {
		redirect(303, '/login');
	}

	const sidebarState = cookies.get('sidebar:state');

	return {
		session,
		user,
		sidebarOpen: sidebarState === undefined ? true : sidebarState === 'true'
	};
};
