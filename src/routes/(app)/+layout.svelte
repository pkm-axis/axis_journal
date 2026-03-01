<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import AppSidebar from '$lib/components/layout/sidebar.svelte';
	import AppHeader from '$lib/components/layout/app-header.svelte';

	let { data, children } = $props();
</script>

<Sidebar.Provider open={data.sidebarOpen}>
	<AppSidebar />
	<Sidebar.Inset>
		<AppHeader user={data.user} />
		<div class="p-4 sm:p-6">
			{@render children()}
		</div>
	</Sidebar.Inset>
</Sidebar.Provider>
