<script lang="ts">
	import { cn } from '$lib/utils.js';
	import Sidebar from '$lib/components/layout/sidebar.svelte';
	import AppHeader from '$lib/components/layout/app-header.svelte';

	let { data, children } = $props();
	let sidebarCollapsed = $state(false);
</script>

<div class="min-h-screen">
	<Sidebar bind:collapsed={sidebarCollapsed} />
	<AppHeader collapsed={sidebarCollapsed} user={data.user} />

	<main
		class={cn(
			'pt-16 transition-all duration-300',
			sidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'
		)}
	>
		<div class="p-6">
			{@render children()}
		</div>
	</main>
</div>
