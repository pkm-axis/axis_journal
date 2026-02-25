<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import LineChart from '$lib/components/analytics/line-chart.svelte';
	import BarChart from '$lib/components/analytics/bar-chart.svelte';
	import {
		TrendingUp,
		TrendingDown,
		Target,
		Activity,
		BarChart3,
		Filter,
		X
	} from 'lucide-svelte';

	let { data } = $props();
	const { stats } = data;

	function formatCurrency(amount: number) {
		return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
	}

	function formatPercent(val: number) {
		return `${val.toFixed(1)}%`;
	}

	function applyFilter(key: string, value: string | undefined) {
		const params = new URLSearchParams($page.url.searchParams);
		if (value) {
			params.set(key, value);
		} else {
			params.delete(key);
		}
		goto(`/analytics?${params.toString()}`);
	}

	function clearFilters() {
		goto('/analytics');
	}

	const hasFilters = $derived(
		data.filters.accountId ||
			data.filters.assetType ||
			data.filters.strategyId ||
			data.filters.dateFrom ||
			data.filters.dateTo
	);

	const assetTypes = [
		{ value: 'stocks', label: 'Stocks' },
		{ value: 'crypto', label: 'Crypto' },
		{ value: 'forex', label: 'Forex' },
		{ value: 'commodities', label: 'Commodities' },
		{ value: 'indices', label: 'Indices' }
	];

	const pnlChartData = $derived({
		labels: data.pnlOverTime.map((p) => p.date),
		datasets: [
			{
				label: 'Cumulative P&L',
				data: data.pnlOverTime.map((p) => p.cumulative),
				borderColor: stats.totalPnl >= 0 ? '#22c55e' : '#ef4444',
				backgroundColor:
					stats.totalPnl >= 0 ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
				fill: true
			}
		]
	});

	const assetTypeLabels = $derived(Object.keys(data.byAssetType));
	const assetTypeData = $derived({
		labels: assetTypeLabels,
		datasets: [
			{
				label: 'P&L',
				data: assetTypeLabels.map((k) => data.byAssetType[k].pnl),
				backgroundColor: assetTypeLabels.map((_, i) => {
					const colors = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];
					return colors[i % colors.length];
				})
			}
		]
	});
</script>

<svelte:head>
	<title>Analytics - Axis Journal</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Analytics</h1>
			<p class="text-muted-foreground">Deep dive into your trading performance.</p>
		</div>
		<Button variant="outline" href="/analytics/cross-account">
			Cross-Account Insights
		</Button>
	</div>

	<!-- Filters -->
	<Card.Root>
		<Card.Content class="flex flex-wrap items-end gap-3 pt-6">
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
				value={data.filters.strategyId ?? undefined}
				onValueChange={(v) => applyFilter('strategy', v)}
			>
				<Select.Trigger class="w-[160px]">
					{data.strategies.find((s) => s.id === data.filters.strategyId)?.name ??
						'All Strategies'}
				</Select.Trigger>
				<Select.Content>
					{#each data.strategies as strategy}
						<Select.Item value={strategy.id}>{strategy.name}</Select.Item>
					{/each}
				</Select.Content>
			</Select.Root>

			<div class="flex items-center gap-2">
				<Input
					type="date"
					value={data.filters.dateFrom ?? ''}
					onchange={(e) => applyFilter('from', (e.target as HTMLInputElement).value || undefined)}
					class="w-[150px]"
				/>
				<span class="text-muted-foreground text-sm">to</span>
				<Input
					type="date"
					value={data.filters.dateTo ?? ''}
					onchange={(e) => applyFilter('to', (e.target as HTMLInputElement).value || undefined)}
					class="w-[150px]"
				/>
			</div>

			{#if hasFilters}
				<Button variant="ghost" size="sm" onclick={clearFilters}>
					<X class="mr-1 size-4" />
					Clear
				</Button>
			{/if}
		</Card.Content>
	</Card.Root>

	{#if stats.totalTrades === 0}
		<Card.Root class="flex flex-col items-center justify-center py-12">
			<BarChart3 class="text-muted-foreground mb-4 size-12" />
			<Card.Title class="mb-2">No analytics data</Card.Title>
			<Card.Description>Close some trades to see performance analytics here.</Card.Description>
		</Card.Root>
	{:else}
		<!-- Key Metrics -->
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
					<Card.Title class="text-sm font-medium">Total P&L</Card.Title>
					{#if stats.totalPnl >= 0}
						<TrendingUp class="size-4 text-green-600" />
					{:else}
						<TrendingDown class="size-4 text-red-600" />
					{/if}
				</Card.Header>
				<Card.Content>
					<div
						class="text-2xl font-bold {stats.totalPnl >= 0
							? 'text-green-600 dark:text-green-400'
							: 'text-red-600 dark:text-red-400'}"
					>
						{stats.totalPnl >= 0 ? '+' : ''}{formatCurrency(stats.totalPnl)}
					</div>
					<p class="text-muted-foreground text-xs">{stats.totalTrades} closed trades</p>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
					<Card.Title class="text-sm font-medium">Win Rate</Card.Title>
					<Target class="text-muted-foreground size-4" />
				</Card.Header>
				<Card.Content>
					<div class="text-2xl font-bold">{formatPercent(stats.winRate)}</div>
					<p class="text-muted-foreground text-xs">
						{stats.wins}W / {stats.losses}L
					</p>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
					<Card.Title class="text-sm font-medium">Expectancy</Card.Title>
					<Activity class="text-muted-foreground size-4" />
				</Card.Header>
				<Card.Content>
					<div
						class="text-2xl font-bold {stats.expectancy >= 0
							? 'text-green-600 dark:text-green-400'
							: 'text-red-600 dark:text-red-400'}"
					>
						{formatCurrency(stats.expectancy)}
					</div>
					<p class="text-muted-foreground text-xs">per trade</p>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
					<Card.Title class="text-sm font-medium">Max Drawdown</Card.Title>
					<TrendingDown class="text-muted-foreground size-4" />
				</Card.Header>
				<Card.Content>
					<div class="text-2xl font-bold text-red-600 dark:text-red-400">
						-{formatCurrency(stats.maxDrawdown)}
					</div>
					<p class="text-muted-foreground text-xs">
						Profit Factor: {stats.profitFactor.toFixed(2)}
					</p>
				</Card.Content>
			</Card.Root>
		</div>

		<!-- Secondary Stats -->
		<div class="grid gap-4 sm:grid-cols-3">
			<Card.Root>
				<Card.Header class="pb-2">
					<Card.Title class="text-sm font-medium">Avg Win</Card.Title>
				</Card.Header>
				<Card.Content>
					<span class="text-xl font-bold text-green-600 dark:text-green-400">
						+{formatCurrency(stats.avgWin)}
					</span>
				</Card.Content>
			</Card.Root>
			<Card.Root>
				<Card.Header class="pb-2">
					<Card.Title class="text-sm font-medium">Avg Loss</Card.Title>
				</Card.Header>
				<Card.Content>
					<span class="text-xl font-bold text-red-600 dark:text-red-400">
						-{formatCurrency(stats.avgLoss)}
					</span>
				</Card.Content>
			</Card.Root>
			<Card.Root>
				<Card.Header class="pb-2">
					<Card.Title class="text-sm font-medium">Avg Risk/Reward</Card.Title>
				</Card.Header>
				<Card.Content>
					<span class="text-xl font-bold">{stats.avgRR.toFixed(2)}R</span>
				</Card.Content>
			</Card.Root>
		</div>

		<!-- Charts -->
		<div class="grid gap-4 lg:grid-cols-2">
			<Card.Root>
				<Card.Header>
					<Card.Title>Cumulative P&L</Card.Title>
				</Card.Header>
				<Card.Content>
					<LineChart labels={pnlChartData.labels} datasets={pnlChartData.datasets} />
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header>
					<Card.Title>P&L by Asset Type</Card.Title>
				</Card.Header>
				<Card.Content>
					<BarChart labels={assetTypeData.labels} datasets={assetTypeData.datasets} />
				</Card.Content>
			</Card.Root>
		</div>

		<!-- Direction Stats -->
		<div class="grid gap-4 sm:grid-cols-2">
			<Card.Root>
				<Card.Header>
					<Card.Title class="text-base">Long Trades</Card.Title>
				</Card.Header>
				<Card.Content class="space-y-2">
					<div class="flex justify-between">
						<span class="text-muted-foreground">Trades</span>
						<span class="font-medium">{data.directionStats.long.count}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-muted-foreground">Win Rate</span>
						<span class="font-medium">{formatPercent(data.directionStats.long.winRate)}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-muted-foreground">Total P&L</span>
						<span
							class="font-medium {data.directionStats.long.pnl >= 0
								? 'text-green-600 dark:text-green-400'
								: 'text-red-600 dark:text-red-400'}"
						>
							{formatCurrency(data.directionStats.long.pnl)}
						</span>
					</div>
				</Card.Content>
			</Card.Root>

			<Card.Root>
				<Card.Header>
					<Card.Title class="text-base">Short Trades</Card.Title>
				</Card.Header>
				<Card.Content class="space-y-2">
					<div class="flex justify-between">
						<span class="text-muted-foreground">Trades</span>
						<span class="font-medium">{data.directionStats.short.count}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-muted-foreground">Win Rate</span>
						<span class="font-medium">{formatPercent(data.directionStats.short.winRate)}</span>
					</div>
					<div class="flex justify-between">
						<span class="text-muted-foreground">Total P&L</span>
						<span
							class="font-medium {data.directionStats.short.pnl >= 0
								? 'text-green-600 dark:text-green-400'
								: 'text-red-600 dark:text-red-400'}"
						>
							{formatCurrency(data.directionStats.short.pnl)}
						</span>
					</div>
				</Card.Content>
			</Card.Root>
		</div>

		<!-- Performance by Asset Type Table -->
		{#if Object.keys(data.byAssetType).length > 0}
			<Card.Root>
				<Card.Header>
					<Card.Title>Performance by Asset Type</Card.Title>
				</Card.Header>
				<Card.Content>
					<div class="space-y-3">
						{#each Object.entries(data.byAssetType) as [assetType, perf]}
							<div class="flex items-center justify-between rounded-lg border p-3">
								<div class="flex items-center gap-3">
									<Badge variant="outline">{assetType}</Badge>
									<span class="text-muted-foreground text-sm">
										{perf.count} trades &middot; {((perf.wins / perf.count) * 100).toFixed(1)}% win rate
									</span>
								</div>
								<span
									class="font-medium {perf.pnl >= 0
										? 'text-green-600 dark:text-green-400'
										: 'text-red-600 dark:text-red-400'}"
								>
									{perf.pnl >= 0 ? '+' : ''}{formatCurrency(perf.pnl)}
								</span>
							</div>
						{/each}
					</div>
				</Card.Content>
			</Card.Root>
		{/if}
	{/if}
</div>
