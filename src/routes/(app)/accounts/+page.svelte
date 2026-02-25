<script lang="ts">
	import { Button } from '$lib/components/ui/button/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { Plus, Wallet, Building2, FlaskConical } from 'lucide-svelte';
	import type { AccountType } from '$lib/supabase/types.js';

	let { data } = $props();

	const typeIcons: Record<AccountType, typeof Wallet> = {
		personal: Wallet,
		prop_firm: Building2,
		paper: FlaskConical
	};

	const typeLabels: Record<AccountType, string> = {
		personal: 'Personal',
		prop_firm: 'Prop Firm',
		paper: 'Paper'
	};

	const typeVariants: Record<AccountType, 'default' | 'secondary' | 'outline'> = {
		personal: 'default',
		prop_firm: 'secondary',
		paper: 'outline'
	};

	function formatCurrency(amount: number, currency: string) {
		return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
	}

	function getAccountType(account: Record<string, any>): AccountType {
		return account.type as AccountType;
	}

	function getPnl(account: Record<string, any>) {
		return account.current_balance - account.initial_balance;
	}
</script>

<svelte:head>
	<title>Accounts - Axis Journal</title>
</svelte:head>

<div class="space-y-6">
	<div class="flex items-center justify-between">
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Accounts</h1>
			<p class="text-muted-foreground">Manage your trading accounts across platforms.</p>
		</div>
		<Button href="/accounts/new">
			<Plus class="mr-2 size-4" />
			New Account
		</Button>
	</div>

	{#if data.accounts.length === 0}
		<Card.Root class="flex flex-col items-center justify-center py-12">
			<Wallet class="text-muted-foreground mb-4 size-12" />
			<Card.Title class="mb-2">No accounts yet</Card.Title>
			<Card.Description class="mb-4">Create your first trading account to get started.</Card.Description>
			<Button href="/accounts/new">
				<Plus class="mr-2 size-4" />
				Create Account
			</Button>
		</Card.Root>
	{:else}
		<div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
			{#each data.accounts as account}
				{@const pnl = getPnl(account)}
				{@const acctType = getAccountType(account)}
				{@const Icon = typeIcons[acctType]}
				<a href="/accounts/{account.id}" class="group">
					<Card.Root class="transition-shadow group-hover:shadow-md">
						<Card.Header class="flex flex-row items-center justify-between space-y-0 pb-2">
							<div class="flex items-center gap-2">
								<Icon class="text-muted-foreground size-5" />
								<Card.Title class="text-base">{account.name}</Card.Title>
							</div>
							<Badge variant={typeVariants[acctType]}>{typeLabels[acctType]}</Badge>
						</Card.Header>
						<Card.Content>
							<div class="text-2xl font-bold">
								{formatCurrency(account.current_balance, account.currency)}
							</div>
							<div class="mt-1 flex items-center justify-between">
								<span class="text-muted-foreground text-sm">
									{account.platform ?? 'No platform'}
								</span>
								<span
									class="text-sm font-medium {pnl >= 0
										? 'text-green-600 dark:text-green-400'
										: 'text-red-600 dark:text-red-400'}"
								>
									{pnl >= 0 ? '+' : ''}{formatCurrency(pnl, account.currency)}
								</span>
							</div>
						</Card.Content>
					</Card.Root>
				</a>
			{/each}
		</div>
	{/if}
</div>
