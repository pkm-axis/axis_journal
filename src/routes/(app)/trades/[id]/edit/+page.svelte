<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import { ArrowLeft } from 'lucide-svelte';

	let { data, form } = $props();
	let loading = $state(false);

	let selectedAssetType = $state(data.trade.asset_type);
	let selectedDirection = $state(data.trade.direction);

	const assetTypes = [
		{ value: 'stocks', label: 'Stocks' },
		{ value: 'crypto', label: 'Crypto' },
		{ value: 'forex', label: 'Forex' },
		{ value: 'commodities', label: 'Commodities' },
		{ value: 'indices', label: 'Indices' }
	];

	function toLocalDatetime(isoStr: string) {
		const d = new Date(isoStr);
		const offset = d.getTimezoneOffset();
		const local = new Date(d.getTime() - offset * 60000);
		return local.toISOString().slice(0, 16);
	}
</script>

<svelte:head>
	<title>Edit Trade - Axis Journal</title>
</svelte:head>

<div class="mx-auto max-w-2xl space-y-6">
	<div class="flex items-center gap-4">
		<Button variant="ghost" size="icon" href="/trades/{data.trade.id}">
			<ArrowLeft class="size-4" />
		</Button>
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Edit Trade</h1>
			<p class="text-muted-foreground">{data.trade.asset} {data.trade.direction.toUpperCase()}</p>
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
				<div class="grid gap-4 sm:grid-cols-2">
					<div class="space-y-2">
						<Label for="asset">Asset</Label>
						<Input id="asset" name="asset" value={data.trade.asset} required />
					</div>
					<div class="space-y-2">
						<Label>Asset Type</Label>
						<input type="hidden" name="asset_type" value={selectedAssetType} />
						<Select.Root type="single" bind:value={selectedAssetType}>
							<Select.Trigger class="w-full">
								{assetTypes.find((a) => a.value === selectedAssetType)?.label}
							</Select.Trigger>
							<Select.Content>
								{#each assetTypes as type}
									<Select.Item value={type.value}>{type.label}</Select.Item>
								{/each}
							</Select.Content>
						</Select.Root>
					</div>
				</div>

				<div class="space-y-2">
					<Label>Direction</Label>
					<input type="hidden" name="direction" value={selectedDirection} />
					<div class="flex gap-2">
						<Button
							type="button"
							variant={selectedDirection === 'long' ? 'default' : 'outline'}
							class="flex-1"
							onclick={() => (selectedDirection = 'long')}
						>
							Long
						</Button>
						<Button
							type="button"
							variant={selectedDirection === 'short' ? 'default' : 'outline'}
							class="flex-1"
							onclick={() => (selectedDirection = 'short')}
						>
							Short
						</Button>
					</div>
				</div>

				<div class="grid gap-4 sm:grid-cols-3">
					<div class="space-y-2">
						<Label for="entry_price">Entry Price</Label>
						<Input
							id="entry_price"
							name="entry_price"
							type="number"
							step="any"
							value={data.trade.entry_price}
							required
						/>
					</div>
					<div class="space-y-2">
						<Label for="exit_price">Exit Price</Label>
						<Input
							id="exit_price"
							name="exit_price"
							type="number"
							step="any"
							value={data.trade.exit_price ?? ''}
						/>
					</div>
					<div class="space-y-2">
						<Label for="position_size">Position Size</Label>
						<Input
							id="position_size"
							name="position_size"
							type="number"
							step="any"
							value={data.trade.position_size}
							required
						/>
					</div>
				</div>

				<div class="grid gap-4 sm:grid-cols-3">
					<div class="space-y-2">
						<Label for="stop_loss">Stop Loss</Label>
						<Input
							id="stop_loss"
							name="stop_loss"
							type="number"
							step="any"
							value={data.trade.stop_loss ?? ''}
						/>
					</div>
					<div class="space-y-2">
						<Label for="take_profit">Take Profit</Label>
						<Input
							id="take_profit"
							name="take_profit"
							type="number"
							step="any"
							value={data.trade.take_profit ?? ''}
						/>
					</div>
					<div class="space-y-2">
						<Label for="fees">Fees</Label>
						<Input
							id="fees"
							name="fees"
							type="number"
							step="0.01"
							value={data.trade.fees}
						/>
					</div>
				</div>

				<div class="space-y-2">
					<Label for="opened_at">Opened At</Label>
					<Input
						id="opened_at"
						name="opened_at"
						type="datetime-local"
						value={toLocalDatetime(data.trade.opened_at)}
					/>
				</div>

				<div class="flex gap-3">
					<Button type="submit" disabled={loading}>
						{loading ? 'Saving...' : 'Save Changes'}
					</Button>
					<Button variant="outline" href="/trades/{data.trade.id}">Cancel</Button>
				</div>
			</form>
		</Card.Content>
	</Card.Root>
</div>
