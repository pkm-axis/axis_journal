<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import * as Table from '$lib/components/ui/table/index.js';
	import {
		ArrowLeft,
		GitCompareArrows,
		Lightbulb,
		CheckCircle,
		XCircle,
		Rocket,
		TrendingUp,
		TrendingDown,
		AlertTriangle
	} from 'lucide-svelte';

	let { data } = $props();

	const typeLabels: Record<string, string> = {
		personal: 'Personal',
		prop_firm: 'Prop Firm',
		paper: 'Paper'
	};

	function formatCurrency(amount: number) {
		return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
	}

	function formatPercent(val: number) {
		return `${val.toFixed(1)}%`;
	}

	const readinessMet = $derived(
		data.readinessSignals.length > 0 &&
			data.readinessSignals.filter((s) => s.met).length >= Math.ceil(data.readinessSignals.length * 0.8)
	);
</script>

<svelte:head>
	<title>Cross-Account Insights - Axis Journal</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center gap-4">
		<Button variant="ghost" size="icon" href="/analytics">
			<ArrowLeft class="size-4" />
		</Button>
		<div>
			<h1 class="flex items-center gap-2 text-3xl font-bold tracking-tight">
				<GitCompareArrows class="size-7" />
				Cross-Account Insights
			</h1>
			<p class="text-muted-foreground">Compare behavior and performance across all your accounts.</p>
		</div>
	</div>

	{#if data.accountStats.length === 0}
		<Card.Root class="py-12 text-center">
			<Card.Content>
				<GitCompareArrows class="text-muted-foreground mx-auto mb-4 size-12" />
				<Card.Title class="mb-2">No accounts to compare</Card.Title>
				<Card.Description>Create multiple accounts to see cross-account insights.</Card.Description>
			</Card.Content>
		</Card.Root>
	{:else}
		<!-- AI Insights -->
		{#if data.insights.length > 0}
			<Card.Root class="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30">
				<Card.Header>
					<Card.Title class="flex items-center gap-2">
						<Lightbulb class="size-5 text-amber-600" />
						Behavioral Insights
					</Card.Title>
				</Card.Header>
				<Card.Content>
					<div class="space-y-3">
						{#each data.insights as insight}
							<div class="flex items-start gap-3">
								<AlertTriangle class="mt-0.5 size-4 shrink-0 text-amber-600" />
								<p class="text-sm">{insight}</p>
							</div>
						{/each}
					</div>
				</Card.Content>
			</Card.Root>
		{/if}

		<!-- Account Comparison Table -->
		<Card.Root>
			<Card.Header>
				<Card.Title>Account Comparison</Card.Title>
			</Card.Header>
			<Card.Content>
				<Table.Root>
					<Table.Header>
						<Table.Row>
							<Table.Head>Account</Table.Head>
							<Table.Head>Type</Table.Head>
							<Table.Head class="text-right">Trades</Table.Head>
							<Table.Head class="text-right">Win Rate</Table.Head>
							<Table.Head class="text-right">Total P&L</Table.Head>
							<Table.Head class="text-right">Avg P&L</Table.Head>
							<Table.Head class="text-right">Avg R:R</Table.Head>
							<Table.Head class="text-right">Plan %</Table.Head>
							<Table.Head class="text-right">Mistakes</Table.Head>
						</Table.Row>
					</Table.Header>
					<Table.Body>
						{#each data.accountStats as account}
							<Table.Row>
								<Table.Cell class="font-medium">
									<a href="/accounts/{account.id}" class="hover:underline">{account.name}</a>
								</Table.Cell>
								<Table.Cell>
									<Badge variant="outline">{typeLabels[account.type] ?? account.type}</Badge>
								</Table.Cell>
								<Table.Cell class="text-right">{account.totalTrades}</Table.Cell>
								<Table.Cell class="text-right">
									{account.totalTrades > 0 ? formatPercent(account.winRate) : '--'}
								</Table.Cell>
								<Table.Cell class="text-right">
									{#if account.totalTrades > 0}
										<span
											class={account.totalPnl >= 0
												? 'text-green-600 dark:text-green-400'
												: 'text-red-600 dark:text-red-400'}
										>
											{formatCurrency(account.totalPnl)}
										</span>
									{:else}
										--
									{/if}
								</Table.Cell>
								<Table.Cell class="text-right">
									{account.totalTrades > 0 ? formatCurrency(account.avgPnl) : '--'}
								</Table.Cell>
								<Table.Cell class="text-right">
									{account.totalTrades > 0 ? account.avgRR.toFixed(2) : '--'}
								</Table.Cell>
								<Table.Cell class="text-right">
									{account.followedPlanRate !== null
										? formatPercent(account.followedPlanRate)
										: '--'}
								</Table.Cell>
								<Table.Cell class="text-right">{account.mistakeCount}</Table.Cell>
							</Table.Row>
						{/each}
					</Table.Body>
				</Table.Root>
			</Card.Content>
		</Card.Root>

		<!-- By Account Type Comparison -->
		{#if Object.keys(data.byType).length > 1}
			<div class="grid gap-4 sm:grid-cols-{Math.min(Object.keys(data.byType).length, 3)}">
				{#each Object.entries(data.byType) as [type, accts]}
					{@const totalTrades = accts.reduce((s, a) => s + a.totalTrades, 0)}
					{@const avgWinRate =
						totalTrades > 0
							? accts.reduce((s, a) => s + a.winRate * a.totalTrades, 0) / totalTrades
							: 0}
					{@const totalPnl = accts.reduce((s, a) => s + a.totalPnl, 0)}
					<Card.Root>
						<Card.Header>
							<Card.Title class="text-base">
								{typeLabels[type] ?? type} Accounts
							</Card.Title>
							<Card.Description>{accts.length} account(s)</Card.Description>
						</Card.Header>
						<Card.Content class="space-y-3">
							<div class="flex justify-between">
								<span class="text-muted-foreground text-sm">Total Trades</span>
								<span class="font-medium">{totalTrades}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-muted-foreground text-sm">Win Rate</span>
								<span class="font-medium">{formatPercent(avgWinRate)}</span>
							</div>
							<div class="flex justify-between">
								<span class="text-muted-foreground text-sm">Total P&L</span>
								<span
									class="font-medium {totalPnl >= 0
										? 'text-green-600 dark:text-green-400'
										: 'text-red-600 dark:text-red-400'}"
								>
									{formatCurrency(totalPnl)}
								</span>
							</div>
						</Card.Content>
					</Card.Root>
				{/each}
			</div>
		{/if}

		<!-- Paper Trading Readiness -->
		{#if data.readinessSignals.length > 0}
			<Card.Root
				class={readinessMet
					? 'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30'
					: ''}
			>
				<Card.Header>
					<Card.Title class="flex items-center gap-2">
						<Rocket class="size-5" />
						Paper Trading Readiness
					</Card.Title>
					<Card.Description>
						{readinessMet
							? 'You are showing strong signs of readiness to go live!'
							: 'Keep practicing. Here are the signals we look for before going live.'}
					</Card.Description>
				</Card.Header>
				<Card.Content>
					<div class="space-y-3">
						{#each data.readinessSignals as signal}
							<div class="flex items-center gap-3">
								{#if signal.met}
									<CheckCircle class="size-5 text-green-600" />
								{:else}
									<XCircle class="size-5 text-muted-foreground" />
								{/if}
								<span class="text-sm {signal.met ? 'font-medium' : 'text-muted-foreground'}">
									{signal.signal}
								</span>
							</div>
						{/each}
					</div>
					{#if readinessMet}
						<div class="mt-4 rounded-lg bg-green-100 p-3 dark:bg-green-900/30">
							<p class="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-300">
								<TrendingUp class="size-4" />
								You are ready to go live! Your paper trading metrics are solid.
							</p>
						</div>
					{/if}
				</Card.Content>
			</Card.Root>
		{/if}
	{/if}
</div>
