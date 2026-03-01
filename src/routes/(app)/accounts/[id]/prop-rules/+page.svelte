<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import {
		ArrowLeft,
		Shield,
		AlertTriangle,
		CheckCircle,
		XCircle,
		Target,
		Calendar
	} from 'lucide-svelte';

	let { data, form } = $props();
	let selectedStatus = $state('active');
	$effect(() => {
		selectedStatus = data.rules?.status ?? 'active';
	});

	function formatCurrency(amount: number) {
		return new Intl.NumberFormat('en-US', {
			style: 'currency',
			currency: data.account.currency
		}).format(amount);
	}

	function progressPercent(current: number, limit: number) {
		return Math.min(100, (current / limit) * 100);
	}

	// Challenge progress days
	const challengeDaysTotal = $derived(() => {
		if (!data.rules?.challenge_start || !data.rules?.challenge_end) return 0;
		const start = new Date(data.rules.challenge_start);
		const end = new Date(data.rules.challenge_end);
		return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
	});

	const challengeDaysElapsed = $derived(() => {
		if (!data.rules?.challenge_start) return 0;
		const start = new Date(data.rules.challenge_start);
		const now = new Date();
		return Math.max(0, Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
	});
</script>

<svelte:head>
	<title>Prop Firm Rules - {data.account.name} - Axis Journal</title>
</svelte:head>

<div class="mx-auto max-w-4xl space-y-6">
	<div class="flex items-center gap-4">
		<Button variant="ghost" size="icon" href="/accounts/{data.account.id}">
			<ArrowLeft class="size-4" />
		</Button>
		<div>
			<div class="flex items-center gap-2">
				<Shield class="size-5" />
				<h1 class="text-2xl font-bold tracking-tight sm:text-3xl">Prop Firm Rules</h1>
			</div>
			<p class="text-muted-foreground">{data.account.name}</p>
		</div>
		{#if data.rules}
			<Badge
				variant={data.rules.status === 'active'
					? 'default'
					: data.rules.status === 'passed'
						? 'secondary'
						: 'destructive'}
				class="ml-auto"
			>
				{data.rules.status.toUpperCase()}
			</Badge>
		{/if}
	</div>

	{#if form?.error}
		<div class="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{form.error}</div>
	{/if}
	{#if form?.success}
		<div class="rounded-md bg-green-500/10 p-3 text-sm text-green-600 dark:text-green-400">
			Rules saved successfully.
		</div>
	{/if}

	<!-- Rule Monitoring -->
	{#if data.violations.length > 0}
		<div class="space-y-4">
			<h2 class="text-lg font-semibold">Rule Monitoring</h2>

			<div class="grid gap-4 sm:grid-cols-2">
				{#each data.violations as violation}
					<Card.Root
						class={violation.breached
							? 'border-red-300 bg-red-50 dark:border-red-900 dark:bg-red-950/30'
							: ''}
					>
						<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
							<Card.Title class="text-sm font-medium">{violation.rule}</Card.Title>
							{#if violation.breached}
								<XCircle class="size-5 text-red-600" />
							{:else if violation.rule === 'Profit Target' && violation.current >= violation.limit}
								<CheckCircle class="size-5 text-green-600" />
							{:else}
								<CheckCircle class="size-5 text-muted-foreground" />
							{/if}
						</Card.Header>
						<Card.Content>
							<div class="space-y-2">
								<div class="flex justify-between text-sm">
									<span>
										{violation.rule === 'Min Trading Days'
											? `${violation.current} days`
											: formatCurrency(violation.current)}
									</span>
									<span class="text-muted-foreground">
										/ {violation.rule === 'Min Trading Days'
											? `${violation.limit} days`
											: formatCurrency(violation.limit)}
									</span>
								</div>
								<div class="bg-muted h-2 overflow-hidden rounded-full">
									<div
										class="h-full rounded-full transition-all {violation.breached
											? 'bg-red-500'
											: violation.rule === 'Profit Target'
												? 'bg-green-500'
												: 'bg-primary'}"
										style="width: {progressPercent(violation.current, violation.limit)}%"
									></div>
								</div>
								{#if violation.breached}
									<p class="flex items-center gap-1 text-xs text-red-600">
										<AlertTriangle class="size-3" />
										Rule breached!
									</p>
								{/if}
							</div>
						</Card.Content>
					</Card.Root>
				{/each}
			</div>
		</div>

		<Separator />
	{/if}

	<!-- Today's Metrics -->
	<div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
		<Card.Root>
			<Card.Header class="pb-2">
				<Card.Title class="text-xs font-medium text-muted-foreground">Today's P&L</Card.Title>
			</Card.Header>
			<Card.Content>
				<span
					class="text-lg font-bold {data.metrics.todayPnl >= 0
						? 'text-green-600 dark:text-green-400'
						: 'text-red-600 dark:text-red-400'}"
				>
					{formatCurrency(data.metrics.todayPnl)}
				</span>
			</Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Header class="pb-2">
				<Card.Title class="text-xs font-medium text-muted-foreground">Total P&L</Card.Title>
			</Card.Header>
			<Card.Content>
				<span
					class="text-lg font-bold {data.metrics.totalPnl >= 0
						? 'text-green-600 dark:text-green-400'
						: 'text-red-600 dark:text-red-400'}"
				>
					{formatCurrency(data.metrics.totalPnl)}
				</span>
			</Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Header class="pb-2">
				<Card.Title class="text-xs font-medium text-muted-foreground">Max Drawdown</Card.Title>
			</Card.Header>
			<Card.Content>
				<span class="text-lg font-bold text-red-600 dark:text-red-400">
					-{formatCurrency(data.metrics.maxDrawdown)}
				</span>
			</Card.Content>
		</Card.Root>
		<Card.Root>
			<Card.Header class="pb-2">
				<Card.Title class="text-xs font-medium text-muted-foreground">Trading Days</Card.Title>
			</Card.Header>
			<Card.Content>
				<span class="text-lg font-bold">{data.metrics.tradingDays}</span>
			</Card.Content>
		</Card.Root>
	</div>

	<!-- Challenge Progress -->
	{#if data.rules?.challenge_start && data.rules?.challenge_end}
		<Card.Root>
			<Card.Header>
				<Card.Title class="flex items-center gap-2 text-base">
					<Calendar class="size-4" />
					Challenge Timeline
				</Card.Title>
			</Card.Header>
			<Card.Content>
				<div class="space-y-2">
					<div class="flex justify-between text-sm">
						<span>{data.rules.challenge_start}</span>
						<span>{data.rules.challenge_end}</span>
					</div>
					<div class="bg-muted h-3 overflow-hidden rounded-full">
						<div
							class="bg-primary h-full rounded-full transition-all"
							style="width: {Math.min(100, (challengeDaysElapsed() / Math.max(1, challengeDaysTotal())) * 100)}%"
						></div>
					</div>
					<p class="text-muted-foreground text-xs text-center">
						Day {challengeDaysElapsed()} of {challengeDaysTotal()}
					</p>
				</div>
			</Card.Content>
		</Card.Root>
	{/if}

	<Separator />

	<!-- Rules Configuration -->
	<Card.Root>
		<Card.Header>
			<Card.Title>Configure Rules</Card.Title>
			<Card.Description>Set the rules for this prop firm challenge.</Card.Description>
		</Card.Header>
		<Card.Content>
			<form method="POST" action="?/save" use:enhance class="space-y-6">
				<div class="grid gap-4 sm:grid-cols-2">
					<div class="space-y-2">
						<Label for="max_daily_loss">Max Daily Loss ({data.account.currency})</Label>
						<Input
							id="max_daily_loss"
							name="max_daily_loss"
							type="number"
							step="0.01"
							placeholder="500.00"
							value={data.rules?.max_daily_loss ?? ''}
						/>
					</div>
					<div class="space-y-2">
						<Label for="max_drawdown">Max Total Drawdown ({data.account.currency})</Label>
						<Input
							id="max_drawdown"
							name="max_drawdown"
							type="number"
							step="0.01"
							placeholder="2500.00"
							value={data.rules?.max_drawdown ?? ''}
						/>
					</div>
				</div>

				<div class="grid gap-4 sm:grid-cols-2">
					<div class="space-y-2">
						<Label for="profit_target">Profit Target ({data.account.currency})</Label>
						<Input
							id="profit_target"
							name="profit_target"
							type="number"
							step="0.01"
							placeholder="5000.00"
							value={data.rules?.profit_target ?? ''}
						/>
					</div>
					<div class="space-y-2">
						<Label for="min_trading_days">Minimum Trading Days</Label>
						<Input
							id="min_trading_days"
							name="min_trading_days"
							type="number"
							placeholder="10"
							value={data.rules?.min_trading_days ?? ''}
						/>
					</div>
				</div>

				<div class="grid gap-4 sm:grid-cols-2">
					<div class="space-y-2">
						<Label for="challenge_start">Challenge Start</Label>
						<Input
							id="challenge_start"
							name="challenge_start"
							type="date"
							value={data.rules?.challenge_start ?? ''}
						/>
					</div>
					<div class="space-y-2">
						<Label for="challenge_end">Challenge End</Label>
						<Input
							id="challenge_end"
							name="challenge_end"
							type="date"
							value={data.rules?.challenge_end ?? ''}
						/>
					</div>
				</div>

				<div class="space-y-2">
					<Label>Challenge Status</Label>
					<input type="hidden" name="status" value={selectedStatus} />
					<Select.Root type="single" bind:value={selectedStatus}>
						<Select.Trigger class="w-full sm:w-[200px]">
							{selectedStatus === 'active'
								? 'Active'
								: selectedStatus === 'passed'
									? 'Passed'
									: 'Failed'}
						</Select.Trigger>
						<Select.Content>
							<Select.Item value="active">Active</Select.Item>
							<Select.Item value="passed">Passed</Select.Item>
							<Select.Item value="failed">Failed</Select.Item>
						</Select.Content>
					</Select.Root>
				</div>

				<Button type="submit">Save Rules</Button>
			</form>
		</Card.Content>
	</Card.Root>
</div>
