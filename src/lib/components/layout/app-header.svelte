<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu/index.js';
	import * as Avatar from '$lib/components/ui/avatar/index.js';
	import * as Sidebar from '$lib/components/ui/sidebar/index.js';
	import { LogOut, User, Sun, Moon } from 'lucide-svelte';

	import type { Snippet } from 'svelte';

	let {
		user,
		children
	}: {
		user: { email?: string; user_metadata?: { full_name?: string; avatar_url?: string } } | null;
		children?: Snippet;
	} = $props();

	let darkMode = $state(false);

	$effect(() => {
		darkMode = document.documentElement.classList.contains('dark');
	});

	function toggleTheme() {
		darkMode = !darkMode;
		document.documentElement.classList.toggle('dark', darkMode);
		localStorage.setItem('theme', darkMode ? 'dark' : 'light');
	}
</script>

<header
	class="flex h-16 shrink-0 items-center justify-between border-b px-4"
>
	<div class="flex items-center gap-2">
		<Sidebar.Trigger class="md:hidden" />
		{#if children}{@render children()}{/if}
	</div>

	<div class="flex items-center gap-2">
		<Button variant="ghost" size="icon" onclick={toggleTheme}>
			{#if darkMode}
				<Sun class="size-4" />
			{:else}
				<Moon class="size-4" />
			{/if}
		</Button>

		<DropdownMenu.Root>
			<DropdownMenu.Trigger>
				<Avatar.Root class="size-8 cursor-pointer">
					{#if user?.user_metadata?.avatar_url}
						<Avatar.Image src={user.user_metadata.avatar_url} alt="Avatar" />
					{/if}
					<Avatar.Fallback class="text-xs">
						{user?.email?.charAt(0).toUpperCase() ?? 'U'}
					</Avatar.Fallback>
				</Avatar.Root>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end" class="w-48">
				<DropdownMenu.Label>
					{user?.user_metadata?.full_name ?? user?.email ?? 'User'}
				</DropdownMenu.Label>
				<DropdownMenu.Separator />
				<DropdownMenu.Item
					onSelect={() => {
						window.location.href = '/settings';
					}}
				>
					<User class="mr-2 size-4" />
					Settings
				</DropdownMenu.Item>
				<DropdownMenu.Separator />
				<form method="POST" action="/logout">
					<DropdownMenu.Item
						class="text-destructive"
						onclick={(e: MouseEvent) => {
							e.preventDefault();
							(e.currentTarget as HTMLElement).closest('form')?.submit();
						}}
					>
						<LogOut class="mr-2 size-4" />
						Sign out
					</DropdownMenu.Item>
				</form>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
</header>
