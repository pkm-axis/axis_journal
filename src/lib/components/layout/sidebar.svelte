<script lang="ts">
	import { page } from '$app/stores';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import {
		LayoutDashboard,
		Wallet,
		LineChart,
		BarChart3,
		TrendingUp,
		AlertTriangle,
		Settings
	} from 'lucide-svelte';

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

<Sidebar.Root collapsible="icon">
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton size="lg" class="pointer-events-none">
					<div
						class="bg-primary text-primary-foreground flex size-8 shrink-0 items-center justify-center rounded-lg font-bold"
					>
						A
					</div>
					<span class="text-lg font-semibold tracking-tight">Axis Journal</span>
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>

	<Sidebar.Content>
		<Sidebar.Group>
			<Sidebar.GroupLabel>Navigation</Sidebar.GroupLabel>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					{#each navItems as item}
						{@const active = isActive(item.href, $page.url.pathname)}
						<Sidebar.MenuItem>
							<Sidebar.MenuButton isActive={active} tooltipContent={item.label}>
								{#snippet child({ props })}
									<a href={item.href} {...props}>
										<item.icon />
										<span>{item.label}</span>
									</a>
								{/snippet}
							</Sidebar.MenuButton>
						</Sidebar.MenuItem>
					{/each}
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>
	</Sidebar.Content>

	<Sidebar.Footer>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.Trigger />
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Footer>

	<Sidebar.Rail />
</Sidebar.Root>
