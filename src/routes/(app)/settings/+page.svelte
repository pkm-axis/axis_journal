<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { Settings, User } from 'lucide-svelte';

	let { data, form } = $props();
</script>

<svelte:head>
	<title>Settings - Axis Journal</title>
</svelte:head>

<div class="mx-auto max-w-2xl space-y-6">
	<div>
		<h1 class="text-2xl font-bold tracking-tight sm:text-3xl">Settings</h1>
		<p class="text-muted-foreground">Manage your account preferences.</p>
	</div>

	{#if form?.error}
		<div class="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{form.error}</div>
	{/if}
	{#if form?.success}
		<div class="rounded-md bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400">
			Profile updated successfully.
		</div>
	{/if}

	<Card.Root>
		<Card.Header>
			<Card.Title class="flex items-center gap-2">
				<User class="size-5" />
				Profile
			</Card.Title>
			<Card.Description>Update your display name and personal information.</Card.Description>
		</Card.Header>
		<Card.Content>
			<form method="POST" action="?/updateProfile" use:enhance class="space-y-4">
				<div class="space-y-2">
					<Label for="email">Email</Label>
					<Input id="email" value={data.email} disabled />
				</div>
				<div class="space-y-2">
					<Label for="display_name">Display Name</Label>
					<Input
						id="display_name"
						name="display_name"
						value={data.profile?.display_name ?? ''}
						placeholder="Your name"
					/>
				</div>
				<Button type="submit">Save</Button>
			</form>
		</Card.Content>
	</Card.Root>

	<Card.Root>
		<Card.Header>
			<Card.Title class="flex items-center gap-2">
				<Settings class="size-5" />
				Application
			</Card.Title>
			<Card.Description>Theme and display preferences.</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-4">
			<div class="flex items-center justify-between">
				<div>
					<p class="text-sm font-medium">Dark Mode</p>
					<p class="text-muted-foreground text-xs">Toggle dark theme via the header icon.</p>
				</div>
			</div>
		</Card.Content>
	</Card.Root>
</div>
