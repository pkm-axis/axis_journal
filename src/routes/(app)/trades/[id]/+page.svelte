<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import MediaUpload from '$lib/components/trades/media-upload.svelte';
	import {
		ArrowLeft,
		Pencil,
		Trash2,
		CheckCircle,
		XCircle,
		Clock,
		TrendingUp,
		TrendingDown,
		Brain,
		Target,
		AlertTriangle,
		ImageIcon
	} from 'lucide-svelte';

	let { data, form } = $props();
	let deleteDialogOpen = $state(false);
	let closeDialogOpen = $state(false);

	const acct = data.trade.accounts as unknown as {
		name: string;
		currency: string;
		type: string;
	};

	function formatCurrency(amount: number | null) {
		if (amount === null) return '--';
		return new Intl.NumberFormat('en-US', { style: 'currency', currency: acct.currency }).format(
			amount
		);
	}

	function formatDate(dateStr: string | null) {
		if (!dateStr) return '--';
		return new Date(dateStr).toLocaleString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}
</script>

<svelte:head>
	<title>{data.trade.asset} {data.trade.direction.toUpperCase()} - Axis Journal</title>
</svelte:head>

<div class="mx-auto max-w-4xl space-y-6">
	<!-- Header -->
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<div class="flex items-center gap-4">
			<Button variant="ghost" size="icon" href="/trades">
				<ArrowLeft class="size-4" />
			</Button>
			<div>
				<div class="flex items-center gap-2">
					<h1 class="text-2xl font-bold tracking-tight sm:text-3xl">{data.trade.asset}</h1>
					<Badge variant={data.trade.direction === 'long' ? 'default' : 'secondary'}>
						{data.trade.direction.toUpperCase()}
					</Badge>
					<Badge variant={data.trade.status === 'open' ? 'outline' : 'secondary'}>
						{data.trade.status.toUpperCase()}
					</Badge>
				</div>
				<p class="text-muted-foreground">
					{acct.name} &middot; {data.trade.asset_type}
				</p>
			</div>
		</div>
		<div class="flex gap-2">
			{#if data.trade.status === 'open'}
				<Button size="sm" onclick={() => (closeDialogOpen = true)}>Close Trade</Button>
			{/if}
			<Button variant="outline" size="sm" href="/trades/{data.trade.id}/edit">
				<Pencil class="mr-2 size-4" />
				Edit
			</Button>
			<Button variant="ghost" size="icon-sm" onclick={() => (deleteDialogOpen = true)}>
				<Trash2 class="size-4 text-destructive" />
			</Button>
		</div>
	</div>

	{#if form?.error}
		<div class="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{form.error}</div>
	{/if}

	<!-- P&L Summary -->
	{#if data.trade.pnl !== null}
		<Card.Root
			class={data.trade.pnl >= 0
				? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30'
				: 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30'}
		>
			<Card.Content class="flex items-center justify-between pt-6">
				<div class="flex items-center gap-3">
					{#if data.trade.pnl >= 0}
						<TrendingUp class="size-8 text-green-600 dark:text-green-400" />
					{:else}
						<TrendingDown class="size-8 text-red-600 dark:text-red-400" />
					{/if}
					<div>
						<p class="text-sm font-medium text-muted-foreground">Profit / Loss</p>
						<p
							class="text-2xl font-bold sm:text-3xl {data.trade.pnl >= 0
								? 'text-green-600 dark:text-green-400'
								: 'text-red-600 dark:text-red-400'}"
						>
							{data.trade.pnl >= 0 ? '+' : ''}{formatCurrency(data.trade.pnl)}
						</p>
					</div>
				</div>
				{#if data.trade.risk_reward !== null}
					<div class="text-right">
						<p class="text-sm font-medium text-muted-foreground">Risk/Reward</p>
						<p class="text-2xl font-bold">{data.trade.risk_reward}R</p>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	{/if}

	<!-- Trade Details Grid -->
	<div class="grid gap-4 sm:grid-cols-2">
		<Card.Root>
			<Card.Header>
				<Card.Title class="text-base">Entry Details</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-3">
				<div class="flex justify-between">
					<span class="text-muted-foreground">Entry Price</span>
					<span class="font-mono font-medium">{data.trade.entry_price}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-muted-foreground">Position Size</span>
					<span class="font-mono font-medium">{data.trade.position_size}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-muted-foreground">Opened</span>
					<span class="text-sm">{formatDate(data.trade.opened_at)}</span>
				</div>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header>
				<Card.Title class="text-base">Exit Details</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-3">
				<div class="flex justify-between">
					<span class="text-muted-foreground">Exit Price</span>
					<span class="font-mono font-medium">{data.trade.exit_price ?? '--'}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-muted-foreground">Fees</span>
					<span class="font-mono font-medium">{formatCurrency(data.trade.fees)}</span>
				</div>
				<div class="flex justify-between">
					<span class="text-muted-foreground">Closed</span>
					<span class="text-sm">{formatDate(data.trade.closed_at)}</span>
				</div>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Risk Management -->
	<Card.Root>
		<Card.Header>
			<Card.Title class="text-base">Risk Management</Card.Title>
		</Card.Header>
		<Card.Content>
			<div class="grid gap-4 sm:grid-cols-3">
				<div>
					<p class="text-sm text-muted-foreground">Stop Loss</p>
					<p class="font-mono font-medium">{data.trade.stop_loss ?? 'Not set'}</p>
				</div>
				<div>
					<p class="text-sm text-muted-foreground">Take Profit</p>
					<p class="font-mono font-medium">{data.trade.take_profit ?? 'Not set'}</p>
				</div>
				<div>
					<p class="text-sm text-muted-foreground">Risk/Reward</p>
					<p class="font-mono font-medium">{data.trade.risk_reward ? `${data.trade.risk_reward}R` : 'N/A'}</p>
				</div>
			</div>
		</Card.Content>
	</Card.Root>

	<!-- Psychology -->
	{#if data.psychology}
		<Card.Root>
			<Card.Header>
				<Card.Title class="flex items-center gap-2 text-base">
					<Brain class="size-4" />
					Psychology
				</Card.Title>
			</Card.Header>
			<Card.Content class="space-y-4">
				{#if data.psychology.emotion}
					<div>
						<p class="text-sm text-muted-foreground">Emotion</p>
						<Badge variant="outline">{data.psychology.emotion}</Badge>
					</div>
				{/if}
				{#if data.psychology.confidence_score}
					<div>
						<p class="text-sm text-muted-foreground">Confidence</p>
						<div class="flex gap-1">
							{#each [1, 2, 3, 4, 5] as score}
								<div
									class="size-6 rounded {score <= data.psychology.confidence_score
										? 'bg-primary'
										: 'bg-muted'}"
								></div>
							{/each}
							<span class="ml-2 text-sm font-medium">{data.psychology.confidence_score}/5</span>
						</div>
					</div>
				{/if}
				{#if data.psychology.followed_plan !== null}
					<div class="flex items-center gap-2">
						{#if data.psychology.followed_plan}
							<CheckCircle class="size-4 text-green-600" />
							<span class="text-sm">Followed the trading plan</span>
						{:else}
							<XCircle class="size-4 text-red-600" />
							<span class="text-sm">Did not follow the trading plan</span>
						{/if}
					</div>
				{/if}
				{#if data.psychology.notes}
					<div>
						<p class="text-sm text-muted-foreground">Entry Reasoning</p>
						<p class="mt-1 text-sm">{data.psychology.notes}</p>
					</div>
				{/if}
				{#if data.psychology.review_notes}
					<Separator />
					<div>
						<p class="text-sm text-muted-foreground">Post-Trade Review</p>
						<p class="mt-1 text-sm">{data.psychology.review_notes}</p>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	{/if}

	<!-- Strategies, Tags, Mistakes -->
	{#if data.strategies.length > 0 || data.tags.length > 0 || data.mistakes.length > 0}
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#if data.strategies.length > 0}
				<Card.Root>
					<Card.Header class="pb-2">
						<Card.Title class="flex items-center gap-2 text-sm">
							<Target class="size-4" />
							Strategies
						</Card.Title>
					</Card.Header>
					<Card.Content>
						<div class="flex flex-wrap gap-1">
							{#each data.strategies as s}
								<Badge variant="secondary">{s.name}</Badge>
							{/each}
						</div>
					</Card.Content>
				</Card.Root>
			{/if}
			{#if data.tags.length > 0}
				<Card.Root>
					<Card.Header class="pb-2">
						<Card.Title class="text-sm">Tags</Card.Title>
					</Card.Header>
					<Card.Content>
						<div class="flex flex-wrap gap-1">
							{#each data.tags as t}
								<Badge variant="outline">{t.name}</Badge>
							{/each}
						</div>
					</Card.Content>
				</Card.Root>
			{/if}
			{#if data.mistakes.length > 0}
				<Card.Root>
					<Card.Header class="pb-2">
						<Card.Title class="flex items-center gap-2 text-sm">
							<AlertTriangle class="size-4" />
							Mistakes
						</Card.Title>
					</Card.Header>
					<Card.Content>
						<div class="flex flex-wrap gap-1">
							{#each data.mistakes as m}
								<Badge variant="destructive">{m.name}</Badge>
							{/each}
						</div>
					</Card.Content>
				</Card.Root>
			{/if}
		</div>
	{/if}

	<!-- Trade Media -->
	<Card.Root>
		<Card.Header>
			<Card.Title class="flex items-center gap-2 text-base">
				<ImageIcon class="size-4" />
				Screenshots & Charts
			</Card.Title>
			<Card.Description>Upload charts, screenshots, or annotations for this trade.</Card.Description>
		</Card.Header>
		<Card.Content>
			<MediaUpload
				tradeId={data.trade.id}
				userId={data.trade.user_id}
				media={data.media}
				onUpload={() => { window.location.reload(); }}
			/>
		</Card.Content>
	</Card.Root>

	<!-- Post-Trade Review Form -->
	<Card.Root>
		<Card.Header>
			<Card.Title class="text-base">Post-Trade Review</Card.Title>
			<Card.Description>Reflect on this trade. What went well? What would you change?</Card.Description>
		</Card.Header>
		<Card.Content>
			<form method="POST" action="?/review" use:enhance class="space-y-4">
				<Textarea
					name="review_notes"
					placeholder="Write your post-trade review..."
					rows={4}
					value={data.psychology?.review_notes ?? ''}
				/>
				<Button type="submit" size="sm">Save Review</Button>
			</form>
		</Card.Content>
	</Card.Root>
</div>

<!-- Close Trade Dialog -->
<Dialog.Root bind:open={closeDialogOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Close Trade</Dialog.Title>
			<Dialog.Description>Enter the exit price to close this trade.</Dialog.Description>
		</Dialog.Header>
		<form method="POST" action="?/close" use:enhance class="space-y-4">
			<div class="space-y-2">
				<Label for="exit_price">Exit Price</Label>
				<Input id="exit_price" name="exit_price" type="number" step="any" required />
			</div>
			<div class="space-y-2">
				<Label for="close_fees">Additional Fees</Label>
				<Input id="close_fees" name="close_fees" type="number" step="0.01" value="0" />
			</div>
			<Dialog.Footer>
				<Button variant="outline" type="button" onclick={() => (closeDialogOpen = false)}>
					Cancel
				</Button>
				<Button type="submit">Close Trade</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Delete Dialog -->
<Dialog.Root bind:open={deleteDialogOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>Delete Trade</Dialog.Title>
			<Dialog.Description>
				This will permanently delete this trade and all associated data. This cannot be undone.
			</Dialog.Description>
		</Dialog.Header>
		<Dialog.Footer>
			<Button variant="outline" onclick={() => (deleteDialogOpen = false)}>Cancel</Button>
			<form method="POST" action="?/delete" use:enhance>
				<Button variant="destructive" type="submit">Delete Trade</Button>
			</form>
		</Dialog.Footer>
	</Dialog.Content>
</Dialog.Root>
