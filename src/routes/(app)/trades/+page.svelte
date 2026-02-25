<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import { Plus, Filter, X } from 'lucide-svelte';

	let { data } = $props();

	const assetTypes = [
		{ value: 'stocks', label: 'Stocks' },
		{ value: 'crypto', label: 'Crypto' },
		{ value: 'forex', label: 'Forex' },
		{ value: 'commodities', label: 'Commodities' },
		{ value: 'indices', label: 'Indices' }
	];

	function formatCurrency(amount: number | null, currency = 'USD') {
		if (amount === null) return '--';
		return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
	}

	function formatDate(dateStr: string) {
		return new Date(dateStr).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function applyFilter(key: string, value: string | undefined) {
		const params = new URLSearchParams($page.url.searchParams);
		if (value) {
			params.set(key, value);
		} else {
			params.delete(key);
		}
		goto(`/trades?${params.toString()}`);
	}

	function clearFilters() {
		goto('/trades');
	}

	const hasFilters = $derived(
		data.filters.accountId || data.filters.assetType || data.filters.status
	);
</script>

<svelte:head>
	<title>Trades - Axis Journal</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Trades</h1>
			<p class="text-muted-foreground">View and manage all your trades.</p>
		</div>
		<Button href="/trades/new">
			<Plus class="mr-2 size-4" />
			Log Trade
		</Button>
	</div>

	<!-- Filters -->
	<Card.Root>
		<Card.Content class="flex flex-wrap items-center gap-3 pt-6">
			<Filter class="text-muted-foreground size-4" />

			<Select.Root
				type="single"
				value={data.filters.accountId ?? undefined}
				onValueChange={(v) => applyFilter('account', v)}
			>
				<Select.Trigger class="w-[180px]">
					{data.accounts.find((a) => a.id === data.filters.accountId)?.name ?? 'All Accounts'}
				</Select.Trigger>
				<Select.Content>
					{#each data.accounts as account}
						<Select.Item value={account.id}>{account.name}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>

			<Select.Root
				type="single"
				value={data.filters.assetType ?? undefined}
				onValueChange={(v) => applyFilter('asset_type', v)}
			>
				<Select.Trigger class="w-[160px]">
					{assetTypes.find((a) => a.value === data.filters.assetType)?.label ?? 'All Assets'}
				</Select.Trigger>
				<Select.Content>
					{#each assetTypes as type}
						<Select.Item value={type.value}>{type.label}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>

			<Select.Root
				type="single"
				value={data.filters.status ?? undefined}
				onValueChange={(v) => applyFilter('status', v)}
			>
				<Select.Trigger class="w-[140px]">
					{data.filters.status === 'open'
						? 'Open'
						: data.filters.status === 'closed'
							? 'Closed'
							: 'All Status'}
				</Select.Trigger>
				<Select.Content>
					<Select.Item value="open">Open</Select.Item>
					<Select.Item value="closed">Closed</Select.Item>
				</Select.Content>
			</Select.Root>

			{#if hasFilters}
				<Button variant="ghost" size="sm" onclick={clearFilters}>
					<X class="mr-1 size-4" />
					Clear
				</Button>
			{/if}
		</Card.Content>
	</Card.Root>

	<!-- Trades Table -->
	{#if data.trades.length === 0}
		<Card.Root class="flex flex-col items-center justify-center py-12">
			<Plus class="text-muted-foreground mb-4 size-12" />
			<Card.Title class="mb-2">No trades found</Card.Title>
			<Card.Description class="mb-4"
				>{hasFilters ? 'Try adjusting your filters.' : 'Log your first trade to get started.'}</Card.Description
			>
			<Button href="/trades/new">
				<Plus class="mr-2 size-4" />
				Log Trade
			</Button>
		</Card.Root>
	{:else}
		<Card.Root>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head>Asset</Table.Head>
						<Table.Head>Direction</Table.Head>
						<Table.Head>Account</Table.Head>
						<Table.Head class="text-right">Entry</Table.Head>
						<Table.Head class="text-right">Exit</Table.Head>
						<Table.Head class="text-right">P&L</Table.Head>
						<Table.Head class="text-right">R:R</Table.Head>
						<Table.Head>Status</Table.Head>
						<Table.Head>Date</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#each data.trades as trade}
						{@const acct = trade.accounts as unknown as { name: string; currency: string }}
						<Table.Row class="cursor-pointer" onclick={() => goto(`/trades/${trade.id}`)}>
							<Table.Cell>
								<div class="flex items-center gap-2">
									<span class="font-medium">{trade.asset}</span>
									<Badge variant="outline" class="text-xs">{trade.asset_type}</Badge>
								</div>
							</Table.Cell>
							<Table.Cell>
								<Badge variant={trade.direction === 'long' ? 'default' : 'secondary'}>
									{trade.direction.toUpperCase()}
								</Badge>
							</Table.Cell>
							<Table.Cell class="text-muted-foreground">{acct.name}</Table.Cell>
							<Table.Cell class="text-right font-mono">{trade.entry_price}</Table.Cell>
							<Table.Cell class="text-right font-mono">{trade.exit_price ?? '--'}</Table.Cell>
							<Table.Cell class="text-right">
								{#if trade.pnl !== null}
									<span
										class="font-medium {trade.pnl >= 0
											? 'text-green-600 dark:text-green-400'
											: 'text-red-600 dark:text-red-400'}"
									>
										{formatCurrency(trade.pnl, acct.currency)}
									</span>
								{:else}
									<span class="text-muted-foreground">--</span>
								{/if}
							</Table.Cell>
							<Table.Cell class="text-right font-mono">
								{trade.risk_reward !== null ? `${trade.risk_reward}R` : '--'}
							</Table.Cell>
							<Table.Cell>
								<Badge variant={trade.status === 'open' ? 'outline' : 'secondary'}>
									{trade.status}
								</Badge>
							</Table.Cell>
							<Table.Cell class="text-muted-foreground text-sm">
								{formatDate(trade.opened_at)}
							</Table.Cell>
						</Table.Row>
					{/each}
				</Table.Body>
			</Table.Root>
		</Card.Root>
	{/if}
</div>
