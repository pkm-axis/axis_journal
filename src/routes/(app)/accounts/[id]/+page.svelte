<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import {
		ArrowLeft,
		Pencil,
		Trash2,
		TrendingUp,
		TrendingDown,
		Plus,
		Shield
	} from 'lucide-svelte';
	import type { AccountType } from '$lib/supabase/types.js';

	let { data, form } = $props();
	let editing = $state(false);
	let deleteDialogOpen = $state(false);

	const typeLabels: Record<string, string> = {
		personal: 'Personal',
		prop_firm: 'Prop Firm',
		paper: 'Paper'
	};

	function formatCurrency(amount: number, currency: string) {
		return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
	}

	const pnl = $derived(data.account.current_balance - data.account.initial_balance);
	const pnlPercent = $derived(
		data.account.initial_balance > 0
			? ((pnl / data.account.initial_balance) * 100).toFixed(2)
			: '0.00'
	);
</script>

<svelte:head>
	<title>{data.account.name} - Axis Journal</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div class="flex items-center gap-4">
			<Button variant="ghost" size="icon" href="/accounts">
				<ArrowLeft class="size-4" />
			</Button>
			<div>
				<div class="flex items-center gap-2">
					<h1 class="text-2xl font-bold tracking-tight sm:text-3xl">{data.account.name}</h1>
					<Badge variant={data.account.is_active ? 'default' : 'secondary'}>
						{data.account.is_active ? 'Active' : 'Inactive'}
					</Badge>
				</div>
				<p class="text-muted-foreground">
					{typeLabels[data.account.type]}
					{#if data.account.platform}
						&middot; {data.account.platform}
					{/if}
				</p>
			</div>
		</div>
		<div class="flex gap-2">
			<Button variant="outline" size="sm" onclick={() => (editing = !editing)}>
				<Pencil class="mr-2 size-4" />
				{editing ? 'Cancel' : 'Edit'}
			</Button>
			{#if data.account.type === 'prop_firm'}
				<Button variant="outline" size="sm" href="/accounts/{data.account.id}/prop-rules">
					<Shield class="mr-2 size-4" />
					Rules
				</Button>
			{/if}
		</div>
	</div>

	{#if form?.error}
		<div class="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{form.error}</div>
	{/if}

	<!-- Stats -->
	<div class="grid gap-4 sm:grid-cols-3">
		<Card.Root>
			<Card.Header class="pb-2">
				<Card.Title class="text-sm font-medium">Current Balance</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">
					{formatCurrency(data.account.current_balance, data.account.currency)}
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="pb-2">
				<Card.Title class="text-sm font-medium">Total P&L</Card.Title>
			</Card.Header>
			<Card.Content>
				<div
					class="flex items-center gap-2 text-2xl font-bold {pnl >= 0
						? 'text-green-600 dark:text-green-400'
						: 'text-red-600 dark:text-red-400'}"
				>
					{#if pnl >= 0}
						<TrendingUp class="size-5" />
					{:else}
						<TrendingDown class="size-5" />
					{/if}
					{pnl >= 0 ? '+' : ''}{formatCurrency(pnl, data.account.currency)} ({pnlPercent}%)
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="pb-2">
				<Card.Title class="text-sm font-medium">Initial Balance</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">
					{formatCurrency(data.account.initial_balance, data.account.currency)}
				</div>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Edit Form -->
	{#if editing}
		<Card.Root>
			<Card.Header>
				<Card.Title>Edit Account</Card.Title>
			</Card.Header>
			<Card.Content>
				<form method="POST" action="?/update" use:enhance class="space-y-4">
					<div class="space-y-2">
						<Label for="name">Name</Label>
						<Input id="name" name="name" value={data.account.name} required />
					</div>
					<div class="space-y-2">
						<Label for="platform">Platform</Label>
						<Input id="platform" name="platform" value={data.account.platform ?? ''} />
					</div>
					<input type="hidden" name="is_active" value={data.account.is_active ? 'true' : 'false'} />
					<div class="flex gap-3">
						<Button type="submit">Save Changes</Button>
						<Button variant="outline" onclick={() => (editing = false)}>Cancel</Button>
						<Button
							variant="destructive"
							type="button"
							onclick={() => (deleteDialogOpen = true)}
						>
							<Trash2 class="mr-2 size-4" />
							Delete
						</Button>
					</div>
				</form>
			</Card.Content>
		</Card.Root>
	{/if}

	<!-- Recent Trades -->
	<Card.Root>
		<Card.Header class="flex flex-row items-center justify-between">
			<div>
				<Card.Title>Recent Trades</Card.Title>
				<Card.Description>Latest trades for this account</Card.Description>
			</div>
			<Button size="sm" href="/trades/new?account={data.account.id}">
				<Plus class="mr-2 size-4" />
				Log Trade
			</Button>
		</Card.Header>
		<Card.Content>
			{#if data.recentTrades.length === 0}
				<p class="text-muted-foreground py-8 text-center text-sm">
					No trades logged yet for this account.
				</p>
			{:else}
				<div class="space-y-2">
					{#each data.recentTrades as trade}
						<a
							href="/trades/{trade.id}"
							class="hover:bg-muted/50 flex items-center justify-between rounded-lg border p-3 transition-colors"
						>
							<div class="flex flex-wrap items-center gap-2">
								<Badge variant={trade.direction === 'long' ? 'default' : 'secondary'}>
									{trade.direction.toUpperCase()}
								</Badge>
								<span class="font-medium">{trade.asset}</span>
								<Badge variant="outline">{trade.asset_type}</Badge>
							</div>
							<div class="text-right">
								{#if trade.pnl !== null}
									<span
										class="font-medium {trade.pnl >= 0
											? 'text-green-600 dark:text-green-400'
											: 'text-red-600 dark:text-red-400'}"
									>
										{trade.pnl >= 0 ? '+' : ''}{formatCurrency(trade.pnl, data.account.currency)}
									</span>
								{:else}
									<Badge variant="outline">Open</Badge>
								{/if}
							</div>
						</a>
					{/each}
				</div>
			{/if}
		</Card.Content>
	</Card.Root>
</div>

<!-- Delete Confirmation Dialog -->
<Dialog.Root bind:open={deleteDialogOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Delete Account</Dialog.Title>
			<Dialog.Description>
				This will permanently delete "{data.account.name}" and all associated trades. This action
				cannot be undone.
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (deleteDialogOpen = false)}>Cancel</Button>
			<form method="POST" action="?/delete" use:enhance>
				<Button variant="destructive" type="submit">Delete Account</Button>
			</form>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
