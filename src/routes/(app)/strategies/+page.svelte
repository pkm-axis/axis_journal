<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import { Textarea } from '$lib/components/ui/textarea/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { Plus, Trash2, LineChart, Tags } from 'lucide-svelte';

	let { data, form } = $props();
	let strategyDialogOpen = $state(false);
	let tagDialogOpen = $state(false);
</script>

<svelte:head>
	<title>Strategies & Tags - Axis Journal</title>
</svelte:head>

<div class="space-y-8">
	<div>
		<h1 class="text-3xl font-bold tracking-tight">Strategies & Tags</h1>
		<p class="text-muted-foreground">Organize and categorize your trades.</p>
	</div>

	{#if form?.error}
		<div class="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{form.error}</div>
	{/if}

	<!-- Strategies Section -->
	<section class="space-y-4">
		<div class="flex items-center justify-between">
			<h2 class="flex items-center gap-2 text-xl font-semibold">
				<LineChart class="size-5" />
				Strategies
			</h2>
			<Button size="sm" onclick={() => (strategyDialogOpen = true)}>
				<Plus class="mr-2 size-4" />
				Add Strategy
			</Button>
		</div>

		{#if data.strategies.length === 0}
			<Card.Root class="py-8 text-center">
				<Card.Content>
					<p class="text-muted-foreground">
						No strategies defined yet. Add strategies like "Breakout", "Scalping", "Swing" to
						categorize your trades.
					</p>
				</Card.Content>
			</Card.Root>
		{:else}
			<div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
				{#each data.strategies as strategy}
					<Card.Root>
						<Card.Header class="flex flex-row items-start justify-between space-y-0 pb-2">
							<div>
								<Card.Title class="text-base">{strategy.name}</Card.Title>
								{#if strategy.description}
									<Card.Description class="mt-1">{strategy.description}</Card.Description>
								{/if}
							</div>
							<form method="POST" action="?/deleteStrategy" use:enhance>
								<input type="hidden" name="id" value={strategy.id} />
								<Button variant="ghost" size="icon-sm" type="submit">
									<Trash2 class="size-4 text-muted-foreground hover:text-destructive" />
								</Button>
							</form>
						</Card.Header>
						<Card.Content>
							<Badge variant="secondary">
								{data.strategyCounts[strategy.id] ?? 0} trades
							</Badge>
						</Card.Content>
					</Card.Root>
				{/each}
			</div>
		{/if}
	</section>

	<Separator />

	<!-- Tags Section -->
	<section class="space-y-4">
		<div class="flex items-center justify-between">
			<h2 class="flex items-center gap-2 text-xl font-semibold">
				<Tags class="size-5" />
				Tags
			</h2>
			<Button size="sm" onclick={() => (tagDialogOpen = true)}>
				<Plus class="mr-2 size-4" />
				Add Tag
			</Button>
		</div>

		{#if data.tags.length === 0}
			<Card.Root class="py-8 text-center">
				<Card.Content>
					<p class="text-muted-foreground">
						No tags defined yet. Add tags to add flexible labels to your trades.
					</p>
				</Card.Content>
			</Card.Root>
		{:else}
			<div class="flex flex-wrap gap-2">
				{#each data.tags as tag}
					<div class="flex items-center gap-1 rounded-full border px-3 py-1">
						{#if tag.color}
							<div class="size-3 rounded-full" style="background-color: {tag.color}"></div>
						{/if}
						<span class="text-sm">{tag.name}</span>
						<form method="POST" action="?/deleteTag" use:enhance class="ml-1">
							<input type="hidden" name="id" value={tag.id} />
							<button type="submit" class="text-muted-foreground hover:text-destructive">
								<Trash2 class="size-3" />
							</button>
						</form>
					</div>
				{/each}
			</div>
		{/if}
	</section>
</div>

<!-- Add Strategy Dialog -->
<Dialog.Root bind:open={strategyDialogOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>New Strategy</Dialog.Title>
			<Dialog.Description>Define a trading strategy to categorize your trades.</Dialog.Description>
		</Dialog.Header>
		<form
			method="POST"
			action="?/createStrategy"
			use:enhance={() => {
				return async ({ update }) => {
					strategyDialogOpen = false;
					await update();
				};
			}}
			class="space-y-4"
		>
			<div class="space-y-2">
				<Label for="strategy-name">Name</Label>
				<Input id="strategy-name" name="name" placeholder="e.g. Breakout, Scalping, Mean Reversion" required />
			</div>
			<div class="space-y-2">
				<Label for="strategy-desc">Description</Label>
				<Textarea id="strategy-desc" name="description" placeholder="Describe this strategy..." rows={3} />
			</div>
			<Dialog.Footer>
				<Button variant="outline" type="button" onclick={() => (strategyDialogOpen = false)}>
					Cancel
				</Button>
				<Button type="submit">Create Strategy</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>

<!-- Add Tag Dialog -->
<Dialog.Root bind:open={tagDialogOpen}>
	<Dialog.Content>
		<Dialog.Header>
			<Dialog.Title>New Tag</Dialog.Title>
			<Dialog.Description>Create a tag to label your trades.</Dialog.Description>
		</Dialog.Header>
		<form
			method="POST"
			action="?/createTag"
			use:enhance={() => {
				return async ({ update }) => {
					tagDialogOpen = false;
					await update();
				};
			}}
			class="space-y-4"
		>
			<div class="space-y-2">
				<Label for="tag-name">Name</Label>
				<Input id="tag-name" name="name" placeholder="e.g. High Conviction, News Play" required />
			</div>
			<div class="space-y-2">
				<Label for="tag-color">Color</Label>
				<Input id="tag-color" name="color" type="color" value="#6366f1" />
			</div>
			<Dialog.Footer>
				<Button variant="outline" type="button" onclick={() => (tagDialogOpen = false)}>
					Cancel
				</Button>
				<Button type="submit">Create Tag</Button>
			</Dialog.Footer>
		</form>
	</Dialog.Content>
</Dialog.Root>
