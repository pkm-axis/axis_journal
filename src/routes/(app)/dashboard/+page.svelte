<script lang="ts">
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import LineChart from '$lib/components/analytics/line-chart.svelte';
	import {
		TrendingUp,
		TrendingDown,
		Target,
		Activity,
		Plus,
		ArrowRight
	} from 'lucide-svelte';

	let { data } = $props();
	const { stats } = data;

	function formatCurrency(amount: number | null, currency = 'USD') {
		if (amount === null) return '--';
		return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
	}

	function formatDate(dateStr: string) {
		return new Date(dateStr).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	const dailyChartData = $derived({
		labels: data.dailyPerf.map((d) => d.date),
		datasets: [
			{
				label: 'Cumulative P&L',
				data: data.dailyPerf.map((d) => d.cumulative_pnl),
				borderColor: '#6366f1',
				backgroundColor: 'rgba(99,102,241,0.1)',
				fill: true
			}
		]
	});

	const hasData = stats.totalTrades > 0;
</script>

<svelte:head>
	<title>Dashboard - Axis Journal</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Dashboard</h1>
			<p class="text-muted-foreground">Your trading performance at a glance.</p>
		</div>
		<Button href="/trades/new">
			<Plus class="mr-2 size-4" />
			Log Trade
		</Button>
	</div>

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
				{#if hasData}
					<div
						class="text-2xl font-bold {stats.totalPnl >= 0
							? 'text-green-600 dark:text-green-400'
							: 'text-red-600 dark:text-red-400'}"
					>
						{stats.totalPnl >= 0 ? '+' : ''}{formatCurrency(stats.totalPnl)}
					</div>
					<p class="text-muted-foreground text-xs">{stats.totalTrades} trades</p>
				{:else}
					<div class="text-2xl font-bold">$0.00</div>
					<p class="text-muted-foreground text-xs">Start logging trades</p>
				{/if}
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Win Rate</Card.Title>
				<Target class="text-muted-foreground size-4" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">
					{hasData ? `${stats.winRate.toFixed(1)}%` : '--'}
				</div>
				<p class="text-muted-foreground text-xs">
					{hasData ? `${stats.wins}W / ${stats.totalTrades - stats.wins}L` : 'No trades yet'}
				</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Avg Risk/Reward</Card.Title>
				<Activity class="text-muted-foreground size-4" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">
					{hasData ? `${stats.avgRR.toFixed(2)}R` : '--'}
				</div>
				<p class="text-muted-foreground text-xs">
					{hasData ? 'across all trades' : 'No trades yet'}
				</p>
			</Card.Content>
		</Card.Root>

		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
				<Card.Title class="text-sm font-medium">Max Drawdown</Card.Title>
				<TrendingDown class="text-muted-foreground size-4" />
			</Card.Header>
			<Card.Content>
				<div class="text-2xl font-bold">
					{hasData ? `-${formatCurrency(stats.maxDrawdown)}` : '--'}
				</div>
				<p class="text-muted-foreground text-xs">
					{hasData ? 'peak to trough' : 'No data available'}
				</p>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Chart + Recent Trades -->
	<div class="grid gap-4 lg:grid-cols-3">
		<!-- P&L Chart -->
		<Card.Root class="lg:col-span-2">
			<Card.Header class="flex flex-row items-center justify-between">
				<Card.Title>Performance (30 days)</Card.Title>
				<Button variant="ghost" size="sm" href="/analytics">
					Full Analytics
					<ArrowRight class="ml-1 size-4" />
				</Button>
			</Card.Header>
			<Card.Content>
				{#if data.dailyPerf.length > 0}
					<LineChart labels={dailyChartData.labels} datasets={dailyChartData.datasets} />
				{:else}
					<div class="flex h-[300px] items-center justify-center">
						<p class="text-muted-foreground text-sm">No daily performance data yet.</p>
					</div>
				{/if}
			</Card.Content>
		</Card.Root>

		<!-- Recent Trades -->
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between">
				<Card.Title>Recent Trades</Card.Title>
				<Button variant="ghost" size="sm" href="/trades">
					View All
					<ArrowRight class="ml-1 size-4" />
				</Button>
			</Card.Header>
			<Card.Content>
				{#if data.recentTrades.length === 0}
					<p class="text-muted-foreground py-8 text-center text-sm">No trades yet.</p>
				{:else}
					<div class="space-y-3">
						{#each data.recentTrades as trade}
							{@const acct = trade.accounts as unknown as { name: string; currency: string }}
							<a
								href="/trades/{trade.id}"
								class="hover:bg-muted/50 flex items-center justify-between rounded-lg p-2 transition-colors"
							>
								<div>
									<div class="flex items-center gap-2">
										<span class="text-sm font-medium">{trade.asset}</span>
										<Badge
											variant={trade.direction === 'long' ? 'default' : 'secondary'}
											class="text-xs"
										>
											{trade.direction.charAt(0).toUpperCase()}
										</Badge>
									</div>
									<p class="text-muted-foreground text-xs">{formatDate(trade.opened_at)}</p>
								</div>
								<div class="text-right">
									{#if trade.pnl !== null}
										<span
											class="text-sm font-medium {trade.pnl >= 0
												? 'text-green-600 dark:text-green-400'
												: 'text-red-600 dark:text-red-400'}"
										>
											{trade.pnl >= 0 ? '+' : ''}{formatCurrency(trade.pnl, acct.currency)}
										</span>
									{:else}
										<Badge variant="outline" class="text-xs">Open</Badge>
									{/if}
								</div>
							</a>
						{/each}
					</div>
				{/if}
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Accounts Overview -->
	{#if data.accounts.length > 0}
		<Card.Root>
			<Card.Header class="flex flex-row items-center justify-between">
				<Card.Title>Accounts</Card.Title>
				<Button variant="ghost" size="sm" href="/accounts">
					Manage
					<ArrowRight class="ml-1 size-4" />
				</Button>
			</Card.Header>
			<Card.Content>
				<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
					{#each data.accounts.slice(0, 6) as account}
						{@const pnl = account.current_balance - account.initial_balance}
						<a
							href="/accounts/{account.id}"
							class="hover:bg-muted/50 flex items-center justify-between rounded-lg border p-3 transition-colors"
						>
							<div>
								<p class="text-sm font-medium">{account.name}</p>
								<p class="text-muted-foreground text-xs capitalize">{account.type.replace('_', ' ')}</p>
							</div>
							<div class="text-right">
								<p class="text-sm font-medium">
									{formatCurrency(account.current_balance, account.currency)}
								</p>
								<p
									class="text-xs {pnl >= 0
										? 'text-green-600 dark:text-green-400'
										: 'text-red-600 dark:text-red-400'}"
								>
									{pnl >= 0 ? '+' : ''}{formatCurrency(pnl, account.currency)}
								</p>
							</div>
						</a>
					{/each}
				</div>
			</Card.Content>
		</Card.Root>
	{:else}
		<Card.Root>
			<Card.Header>
				<Card.Title>Getting Started</Card.Title>
				<Card.Description>Set up your trading journal in a few steps</Card.Description>
			</Card.Header>
			<Card.Content>
				<div class="space-y-3">
					<div class="flex items-center gap-3">
						<div class="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-full text-xs font-bold">
							1
						</div>
						<a href="/accounts/new" class="text-sm hover:underline">Create your first trading account</a>
					</div>
					<div class="flex items-center gap-3">
						<div class="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-full text-xs font-bold">
							2
						</div>
						<a href="/trades/new" class="text-sm hover:underline">Log your first trade</a>
					</div>
					<div class="flex items-center gap-3">
						<div class="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-full text-xs font-bold">
							3
						</div>
						<a href="/strategies" class="text-sm hover:underline">Define your trading strategies</a>
					</div>
				</div>
			</Card.Content>
		</Card.Root>
	{/if}
</div>
