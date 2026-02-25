<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import { Checkbox } from '$lib/components/ui/checkbox/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Select from '$lib/components/ui/select/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import { ArrowLeft } from 'lucide-svelte';

	let { data, form } = $props();
	let loading = $state(false);

	let selectedAccount = $state(data.preselectedAccount ?? '');
	let selectedAssetType = $state('crypto');
	let selectedDirection = $state('long');
	let selectedStrategies = $state<string[]>([]);
	let selectedTags = $state<string[]>([]);
	let selectedMistakes = $state<string[]>([]);
	let confidenceScore = $state(3);
	let followedPlan = $state(false);

	const assetTypes = [
		{ value: 'stocks', label: 'Stocks' },
		{ value: 'crypto', label: 'Crypto' },
		{ value: 'forex', label: 'Forex' },
		{ value: 'commodities', label: 'Commodities' },
		{ value: 'indices', label: 'Indices' }
	];

	const emotions = [
		'Confident',
		'Fearful',
		'Greedy',
		'Calm',
		'Anxious',
		'FOMO',
		'Revenge',
		'Disciplined',
		'Impatient',
		'Neutral'
	];

	let selectedEmotion = $state('');

	function toggleArrayItem(arr: string[], item: string): string[] {
		return arr.includes(item) ? arr.filter((i) => i !== item) : [...arr, item];
	}
</script>

<svelte:head>
	<title>Log Trade - Axis Journal</title>
</svelte:head>

<div class="mx-auto max-w-3xl space-y-6">
	<div class="flex items-center gap-4">
		<Button variant="ghost" size="icon" href="/trades">
			<ArrowLeft class="size-4" />
		</Button>
		<div>
			<h1 class="text-3xl font-bold tracking-tight">Log Trade</h1>
			<p class="text-muted-foreground">Record a new trade with full details.</p>
		</div>
	</div>

	{#if form?.error}
		<div class="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{form.error}</div>
	{/if}

	<form
		method="POST"
		use:enhance={() => {
			loading = true;
			return async ({ update }) => {
				loading = false;
				await update();
			};
		}}
	>
		<Tabs.Root value="trade" class="space-y-6">
			<Tabs.List>
				<Tabs.Trigger value="trade">Trade Details</Tabs.Trigger>
				<Tabs.Trigger value="psychology">Psychology</Tabs.Trigger>
				<Tabs.Trigger value="tags">Tags & Strategy</Tabs.Trigger>
			</Tabs.List>

			<!-- Trade Details Tab -->
			<Tabs.Content value="trade">
				<Card.Root>
					<Card.Content class="space-y-6 pt-6">
						<!-- Account & Asset -->
						<div class="grid gap-4 sm:grid-cols-2">
							<div class="space-y-2">
								<Label for="account_id">Account *</Label>
								<input type="hidden" name="account_id" value={selectedAccount} />
								<Select.Root type="single" bind:value={selectedAccount}>
									<Select.Trigger class="w-full">
										{data.accounts.find((a) => a.id === selectedAccount)?.name ??
											'Select account'}
									</Select.Trigger>
									<Select.Content>
										{#each data.accounts as account}
											<Select.Item value={account.id}>{account.name}</Select.Item>
										{/each}
									</Select.Content>
								</Select.Root>
							</div>

							<div class="space-y-2">
								<Label for="asset">Asset *</Label>
								<Input id="asset" name="asset" placeholder="BTC/USD, AAPL, EUR/USD" required />
							</div>
						</div>

						<!-- Asset Type & Direction -->
						<div class="grid gap-4 sm:grid-cols-2">
							<div class="space-y-2">
								<Label>Asset Type *</Label>
								<input type="hidden" name="asset_type" value={selectedAssetType} />
								<Select.Root type="single" bind:value={selectedAssetType}>
									<Select.Trigger class="w-full">
										{assetTypes.find((a) => a.value === selectedAssetType)?.label ?? 'Select type'}
									</Select.Trigger>
									<Select.Content>
										{#each assetTypes as type}
											<Select.Item value={type.value}>{type.label}</Select.Item>
										{/each}
									</Select.Content>
								</Select.Root>
							</div>

							<div class="space-y-2">
								<Label>Direction *</Label>
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
						</div>

						<!-- Prices -->
						<div class="grid gap-4 sm:grid-cols-3">
							<div class="space-y-2">
								<Label for="entry_price">Entry Price *</Label>
								<Input
									id="entry_price"
									name="entry_price"
									type="number"
									step="any"
									placeholder="0.00"
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
									placeholder="Leave blank if open"
								/>
							</div>
							<div class="space-y-2">
								<Label for="position_size">Position Size *</Label>
								<Input
									id="position_size"
									name="position_size"
									type="number"
									step="any"
									placeholder="0.00"
									required
								/>
							</div>
						</div>

						<!-- Risk Management -->
						<div class="grid gap-4 sm:grid-cols-3">
							<div class="space-y-2">
								<Label for="stop_loss">Stop Loss</Label>
								<Input
									id="stop_loss"
									name="stop_loss"
									type="number"
									step="any"
									placeholder="0.00"
								/>
							</div>
							<div class="space-y-2">
								<Label for="take_profit">Take Profit</Label>
								<Input
									id="take_profit"
									name="take_profit"
									type="number"
									step="any"
									placeholder="0.00"
								/>
							</div>
							<div class="space-y-2">
								<Label for="fees">Fees</Label>
								<Input
									id="fees"
									name="fees"
									type="number"
									step="0.01"
									placeholder="0.00"
									value="0"
								/>
							</div>
						</div>

						<!-- Time -->
						<div class="space-y-2">
							<Label for="opened_at">Opened At</Label>
							<Input id="opened_at" name="opened_at" type="datetime-local" />
						</div>
					</Card.Content>
				</Card.Root>
			</Tabs.Content>

			<!-- Psychology Tab -->
			<Tabs.Content value="psychology">
				<Card.Root>
					<Card.Header>
						<Card.Title>Trade Psychology</Card.Title>
						<Card.Description>Track your mental state and decision-making process.</Card.Description>
					</Card.Header>
					<Card.Content class="space-y-6">
						<div class="space-y-2">
							<Label for="psych_notes">Why did you enter this trade?</Label>
							<Textarea
								id="psych_notes"
								name="psych_notes"
								placeholder="Describe your reasoning, setup, and conviction..."
								rows={4}
							/>
						</div>

						<div class="space-y-2">
							<Label>Emotion</Label>
							<input type="hidden" name="emotion" value={selectedEmotion} />
							<div class="flex flex-wrap gap-2">
								{#each emotions as emotion}
									<button
										type="button"
										class="rounded-full border px-3 py-1 text-sm transition-colors {selectedEmotion ===
										emotion
											? 'bg-primary text-primary-foreground'
											: 'hover:bg-muted'}"
										onclick={() =>
											(selectedEmotion = selectedEmotion === emotion ? '' : emotion)}
									>
										{emotion}
									</button>
								{/each}
							</div>
						</div>

						<div class="space-y-2">
							<Label>Confidence Score: {confidenceScore}/5</Label>
							<input type="hidden" name="confidence_score" value={confidenceScore} />
							<div class="flex gap-2">
								{#each [1, 2, 3, 4, 5] as score}
									<button
										type="button"
										class="flex size-10 items-center justify-center rounded-lg border text-sm font-medium transition-colors {confidenceScore ===
										score
											? 'bg-primary text-primary-foreground'
											: 'hover:bg-muted'}"
										onclick={() => (confidenceScore = score)}
									>
										{score}
									</button>
								{/each}
							</div>
						</div>

						<div class="flex items-center gap-3">
							<Checkbox
								id="followed_plan"
								name="followed_plan"
								checked={followedPlan}
								onCheckedChange={(v) => (followedPlan = v === true)}
							/>
							<Label for="followed_plan" class="cursor-pointer">
								Did you follow your trading plan?
							</Label>
						</div>
					</Card.Content>
				</Card.Root>
			</Tabs.Content>

			<!-- Tags & Strategy Tab -->
			<Tabs.Content value="tags">
				<div class="space-y-6">
					{#if data.strategies.length > 0}
						<Card.Root>
							<Card.Header>
								<Card.Title>Strategies</Card.Title>
								<Card.Description>Which strategies did you use for this trade?</Card.Description>
							</Card.Header>
							<Card.Content>
								<div class="flex flex-wrap gap-2">
									{#each data.strategies as strategy}
										<button
											type="button"
											class="rounded-full border px-3 py-1 text-sm transition-colors {selectedStrategies.includes(
												strategy.id
											)
												? 'bg-primary text-primary-foreground'
												: 'hover:bg-muted'}"
											onclick={() =>
												(selectedStrategies = toggleArrayItem(
													selectedStrategies,
													strategy.id
												))}
										>
											{strategy.name}
										</button>
									{/each}
								</div>
								{#each selectedStrategies as sid}
									<input type="hidden" name="strategy_ids" value={sid} />
								{/each}
							</Card.Content>
						</Card.Root>
					{/if}

					{#if data.tags.length > 0}
						<Card.Root>
							<Card.Header>
								<Card.Title>Tags</Card.Title>
								<Card.Description>Categorize this trade with tags.</Card.Description>
							</Card.Header>
							<Card.Content>
								<div class="flex flex-wrap gap-2">
									{#each data.tags as tag}
										<button
											type="button"
											class="rounded-full border px-3 py-1 text-sm transition-colors {selectedTags.includes(
												tag.id
											)
												? 'bg-primary text-primary-foreground'
												: 'hover:bg-muted'}"
											onclick={() =>
												(selectedTags = toggleArrayItem(selectedTags, tag.id))}
										>
											{tag.name}
										</button>
									{/each}
								</div>
								{#each selectedTags as tid}
									<input type="hidden" name="tag_ids" value={tid} />
								{/each}
							</Card.Content>
						</Card.Root>
					{/if}

					{#if data.mistakes.length > 0}
						<Card.Root>
							<Card.Header>
								<Card.Title>Mistakes</Card.Title>
								<Card.Description>Did you make any mistakes on this trade?</Card.Description>
							</Card.Header>
							<Card.Content>
								<div class="flex flex-wrap gap-2">
									{#each data.mistakes as mistake}
										<button
											type="button"
											class="rounded-full border px-3 py-1 text-sm transition-colors {selectedMistakes.includes(
												mistake.id
											)
												? 'bg-destructive text-white'
												: 'hover:bg-muted'}"
											onclick={() =>
												(selectedMistakes = toggleArrayItem(
													selectedMistakes,
													mistake.id
												))}
										>
											{mistake.name}
										</button>
									{/each}
								</div>
								{#each selectedMistakes as mid}
									<input type="hidden" name="mistake_ids" value={mid} />
								{/each}
							</Card.Content>
						</Card.Root>
					{/if}

					{#if data.strategies.length === 0 && data.tags.length === 0 && data.mistakes.length === 0}
						<Card.Root class="py-8 text-center">
							<Card.Content>
								<p class="text-muted-foreground mb-4">
									No strategies, tags, or mistakes defined yet.
								</p>
								<div class="flex justify-center gap-3">
									<Button variant="outline" href="/strategies">Add Strategies</Button>
									<Button variant="outline" href="/mistakes">Add Mistakes</Button>
								</div>
							</Card.Content>
						</Card.Root>
					{/if}
				</div>
			</Tabs.Content>
		</Tabs.Root>

		<div class="mt-6 flex gap-3">
			<Button type="submit" disabled={loading}>
				{loading ? 'Saving...' : 'Save Trade'}
			</Button>
			<Button variant="outline" href="/trades">Cancel</Button>
		</div>
	</form>
</div>
