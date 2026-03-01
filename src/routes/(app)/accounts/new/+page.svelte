<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { ArrowLeft } from 'lucide-svelte';

	let { form } = $props();
	let loading = $state(false);
	let selectedType = $state('personal');
</script>

<svelte:head>
	<title>New Account - Axis Journal</title>
</svelte:head>

<div class="mx-auto max-w-2xl space-y-6">
	<div class="flex items-center gap-4">
		<Button variant="ghost" size="icon" href="/accounts">
			<ArrowLeft class="size-4" />
		</Button>
		<div>
			<h1 class="text-2xl font-bold tracking-tight sm:text-3xl">New Account</h1>
			<p class="text-muted-foreground">Add a trading account to track performance.</p>
		</div>
	</div>

	{#if form?.error}
		<div class="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{form.error}</div>
	{/if}

	<Card.Root>
		<Card.Content class="pt-6">
			<form
				method="POST"
				use:enhance={() => {
					loading = true;
					return async ({ update }) => {
						loading = false;
						await update();
					};
				}}
				class="space-y-6"
			>
				<div class="space-y-2">
					<Label for="name">Account Name</Label>
					<Input id="name" name="name" placeholder="My Trading Account" required />
				</div>

				<div class="space-y-2">
					<Label for="type">Account Type</Label>
					<input type="hidden" name="type" value={selectedType} />
					<Select.Root type="single" bind:value={selectedType}>
						<Select.Trigger class="w-full">
							{selectedType === 'personal'
								? 'Personal'
								: selectedType === 'prop_firm'
									? 'Prop Firm'
									: 'Paper Trading'}
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="personal">Personal (Real Money)</Select.Item>
							<Select.Item value="prop_firm">Prop Firm</Select.Item>
							<Select.Item value="paper">Paper Trading (Demo)</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>

				<div class="space-y-2">
					<Label for="platform">Platform</Label>
					<Input id="platform" name="platform" placeholder="e.g. Binance, MetaTrader, TradingView" />
				</div>

				<div class="grid gap-4 sm:grid-cols-2">
					<div class="space-y-2">
						<Label for="initial_balance">Initial Balance</Label>
						<Input
							id="initial_balance"
							name="initial_balance"
							type="number"
							step="0.01"
							placeholder="10000.00"
							required
						/>
					</div>
					<div class="space-y-2">
						<Label for="currency">Currency</Label>
						<Input id="currency" name="currency" placeholder="USD" value="USD" />
					</div>
				</div>

				{#if selectedType === 'prop_firm'}
					<Card.Root class="bg-muted/50">
						<Card.Header>
							<Card.Title class="text-base">Prop Firm Rules</Card.Title>
							<Card.Description>You can configure these in detail after creating the account.</Card.Description>
						</Card.Header>
					</Card.Root>
				{/if}

				<div class="flex gap-3">
					<Button type="submit" disabled={loading}>
						{loading ? 'Creating...' : 'Create Account'}
					</Button>
					<Button variant="outline" href="/accounts">Cancel</Button>
				</div>
			</form>
		</Card.Content>
	</Card.Root>
</div>
