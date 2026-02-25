<script lang="ts">
	import { page } from '$app/stores';
	import { cn } from '$lib/utils.js';
	import {
		LayoutDashboard,
		Wallet,
		LineChart,
		BarChart3,
		Tags,
		AlertTriangle,
		Settings,
		LogOut,
		TrendingUp,
		Menu,
		X
	} from 'lucide-svelte';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';

	let { collapsed = $bindable(false) }: { collapsed?: boolean } = $props();
	let mobileOpen = $state(false);

	const navItems = [
		{ href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
		{ href: '/accounts', label: 'Accounts', icon: Wallet },
		{ href: '/trades', label: 'Trades', icon: TrendingUp },
		{ href: '/analytics', label: 'Analytics', icon: BarChart3 },
		{ href: '/strategies', label: 'Strategies', icon: LineChart },
		{ href: '/mistakes', label: 'Mistakes', icon: AlertTriangle },
		{ href: '/settings', label: 'Settings', icon: Settings }
	];

	function isActive(href: string, pathname: string): boolean {
		if (href === '/dashboard') return pathname === '/dashboard' || pathname === '/';
		return pathname.startsWith(href);
	}
</script>

<!-- Mobile hamburger -->
<button
	class="fixed top-4 left-4 z-50 rounded-md bg-background p-2 shadow-md lg:hidden"
	onclick={() => (mobileOpen = !mobileOpen)}
	aria-label="Toggle menu"
>
	{#if mobileOpen}
		<X class="size-5" />
	{:else}
		<Menu class="size-5" />
	{/if}
</button>

<!-- Mobile overlay -->
{#if mobileOpen}
	<button
		class="fixed inset-0 z-30 bg-black/50 lg:hidden"
		onclick={() => (mobileOpen = false)}
		aria-label="Close menu"
	></button>
{/if}

<!-- Sidebar -->
<aside
	class={cn(
		'bg-sidebar text-sidebar-foreground border-sidebar-border fixed inset-y-0 left-0 z-40 flex flex-col border-r transition-all duration-300',
		collapsed ? 'w-16' : 'w-64',
		mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
	)}
>
	<!-- Logo -->
	<div class="flex h-16 items-center gap-3 px-4">
		<div
			class="bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-lg font-bold"
		>
			A
		</div>
		{#if !collapsed}
			<span class="text-lg font-semibold tracking-tight">Axis Journal</span>
		{/if}
	</div>

	<Separator />

	<!-- Navigation -->
	<nav class="flex-1 space-y-1 overflow-y-auto p-3">
		{#each navItems as item}
			{@const active = isActive(item.href, $page.url.pathname)}
			<a
				href={item.href}
				class={cn(
					'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
					active
						? 'bg-sidebar-accent text-sidebar-accent-foreground'
						: 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
				)}
				onclick={() => (mobileOpen = false)}
			>
				<item.icon class="size-5 shrink-0" />
				{#if !collapsed}
					<span>{item.label}</span>
				{/if}
			</a>
		{/each}
	</nav>

	<Separator />

	<!-- Collapse toggle (desktop only) -->
	<div class="hidden p-3 lg:block">
		<Button variant="ghost" size="sm" class="w-full" onclick={() => (collapsed = !collapsed)}>
			{#if collapsed}
				<Menu class="size-4" />
			{:else}
				<span class="text-xs">Collapse</span>
			{/if}
		</Button>
	</div>
</aside>
