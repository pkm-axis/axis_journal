<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Plus, Trash2, AlertTriangle, TrendingDown } from 'lucide-svelte';

	let { data, form } = $props();
	let dialogOpen = $state(false);

	function formatCurrency(amount: number) {
		return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
	}
</script>

<svelte:head>
	<title>Mistakes - Axis Journal</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h1 class="text-2xl font-bold tracking-tight sm:text-3xl">Mistake Tracking</h1>
			<p class="text-muted-foreground">Identify and eliminate recurring bad habits.</p>
		</div>
		<Button onclick={() => (dialogOpen = true)}>
			<Plus class="mr-2 size-4" />
			Define Mistake
		</Button>
	</div>

	{#if form?.error}
		<div class="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{form.error}</div>
	{/if}

	{#if data.mistakes.length === 0}
		<Card.Root class="flex flex-col items-center justify-center py-12">
			<AlertTriangle class="text-muted-foreground mb-4 size-12" />
			<Card.Title class="mb-2">No mistakes defined</Card.Title>
			<Card.Description class="mb-4 text-center">
				Define common trading mistakes like "No stop loss", "FOMO entry", or "Moved stop loss"
				to track them across your trades.
			</Card.Description>
			<Button onclick={() => (dialogOpen = true)}>
				<Plus class="mr-2 size-4" />
				Define Your First Mistake
			</Button>
		</Card.Root>
	{:else}
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each data.mistakes as mistake}
				{@const stats = data.mistakeStats[mistake.id]}
				<Card.Root>
					<Card.Header class="flex flex-row items-start justify-between space-y-0 pb-2">
						<div>
							<Card.Title class="flex items-center gap-2 text-base">
								<AlertTriangle class="size-4 text-amber-500" />
								{mistake.name}
							</Card.Title>
							{#if mistake.description}
								<Card.Description class="mt-1">{mistake.description}</Card.Description>
							{/if}
						</div>
						<form method="POST" action="?/delete" use:enhance>
							<input type="hidden" name="id" value={mistake.id} />
							<Button variant="ghost" size="icon-sm" type="submit">
								<Trash2 class="size-4 text-muted-foreground hover:text-destructive" />
							</Button>
						</form>
					</Card.Header>
					<Card.Content>
						<div class="flex items-center gap-4">
							<div>
								<p class="text-2xl font-bold">{stats?.count ?? 0}</p>
								<p class="text-muted-foreground text-xs">occurrences</p>
							</div>
							{#if stats && stats.totalLoss < 0}
								<div>
									<p class="flex items-center gap-1 text-lg font-bold text-red-600 dark:text-red-400">
										<TrendingDown class="size-4" />
										{formatCurrency(stats.totalLoss)}
									</p>
									<p class="text-muted-foreground text-xs">total loss from mistakes</p>
								</div>
							{/if}
						</div>

						{#if stats && stats.recentTrades.length > 0}
							<div class="mt-3 space-y-1">
								<p class="text-muted-foreground text-xs">Recent trades with this mistake:</p>
								{#each stats.recentTrades.slice(0, 3) as trade}
									<div class="flex items-center justify-between text-sm">
										<span>{trade.asset}</span>
										{#if trade.pnl !== null}
											<span
												class={trade.pnl >= 0
													? 'text-green-600 dark:text-green-400'
													: 'text-red-600 dark:text-red-400'}
											>
												{formatCurrency(trade.pnl)}
											</span>
										{/if}
									</div>
								{/each}
							</div>
						{/if}
					</Card.Content>
				</Card.Root>
			{/each}
		</div>
	{/if}
</div>

<!-- Add Mistake Dialog -->
<Dialog.Root bind:open={dialogOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Define a Mistake</Dialog.Title>
			<Dialog.Description>
				Identify a common trading mistake so you can track when it occurs.
			</Dialog.Description>
		</Dialog.Header>
		<form
			method="POST"
			action="?/create"
			use:enhance={() => {
				return async ({ update }) => {
					dialogOpen = false;
					await update();
				};
			}}
			class="space-y-4"
		>
			<div class="space-y-2">
				<Label for="mistake-name">Name</Label>
				<Input
					id="mistake-name"
					name="name"
					placeholder="e.g. No stop loss, FOMO entry, Over-leveraged"
					required
				/>
			</div>
			<div class="space-y-2">
				<Label for="mistake-desc">Description</Label>
				<Textarea
					id="mistake-desc"
					name="description"
					placeholder="Describe this mistake and why it's harmful..."
					rows={3}
				/>
			</div>
			<Dialog.Footer>
				<Button variant="outline" type="button" onclick={() => (dialogOpen = false)}>
					Cancel
				</Button>
				<Button type="submit">Create Mistake</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
