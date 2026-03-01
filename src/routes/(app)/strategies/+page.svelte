<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Badge } from '$lib/components/ui/badge/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';
	import { Plus, Trash2, Pencil, LineChart, Tags } from 'lucide-svelte';
	import RichTextEditor from '$lib/components/rich-text-editor.svelte';

	let { data, form } = $props();
	let strategyDialogOpen = $state(false);
	let editStrategyDialogOpen = $state(false);
	let tagDialogOpen = $state(false);

	let newStrategyDescription = $state('');
	let editingStrategy = $state<{ id: string; name: string; description: string | null } | null>(
		null
	);
	let editDescription = $state('');

	function openEditDialog(strategy: { id: string; name: string; description: string | null }) {
		editingStrategy = strategy;
		editDescription = strategy.description ?? '';
		editStrategyDialogOpen = true;
	}
</script>

<svelte:head>
	<title>Strategies & Tags - Axis Journal</title>
</svelte:head>

<div class="space-y-8">
	<div>
		<h1 class="text-2xl font-bold tracking-tight sm:text-3xl">Strategies & Tags</h1>
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
					<Card.Header class="flex flex-row items-start justify-between space-y-0">
						<Card.Title class="text-base">{strategy.name}</Card.Title>
						<div class="flex items-center gap-0.5">
							<Button
								variant="ghost"
								size="icon-sm"
								onclick={() => openEditDialog(strategy)}
							>
								<Pencil class="size-4 text-muted-foreground hover:text-foreground" />
							</Button>
							<form method="POST" action="?/deleteStrategy" use:enhance>
								<input type="hidden" name="id" value={strategy.id} />
								<Button variant="ghost" size="icon-sm" type="submit">
									<Trash2 class="size-4 text-muted-foreground hover:text-destructive" />
								</Button>
							</form>
						</div>
					</Card.Header>
				<Card.Content class="space-y-3">
					{#if strategy.description}
						<div class="prose prose-sm max-w-none text-muted-foreground [&_ul]:my-0 [&_ol]:my-0 [&_li]:my-0 [&_p]:my-0 [&_h2]:mt-0 [&_h2]:mb-1 [&_h3]:mt-0 [&_h3]:mb-1">
							{@html strategy.description}
						</div>
					{/if}
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
	<Dialog.Content class="sm:max-w-lg">
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
					newStrategyDescription = '';
					await update();
				};
			}}
			class="space-y-4"
		>
			<div class="space-y-2">
				<Label for="strategy-name">Name</Label>
				<Input
					id="strategy-name"
					name="name"
					placeholder="e.g. Breakout, Scalping, Mean Reversion"
					required
				/>
			</div>
			<div class="space-y-2">
				<Label>Description</Label>
				<input type="hidden" name="description" value={newStrategyDescription} />
				<RichTextEditor
					placeholder="Describe this strategy..."
					onchange={(html) => (newStrategyDescription = html)}
				/>
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

<!-- Edit Strategy Dialog -->
<Dialog.Root bind:open={editStrategyDialogOpen}>
	<Dialog.Content class="sm:max-w-lg">
		<Dialog.Header>
			<Dialog.Title>Edit Strategy</Dialog.Title>
			<Dialog.Description>Update strategy details and description.</Dialog.Description>
		</Dialog.Header>
		{#if editingStrategy}
			<form
				method="POST"
				action="?/updateStrategy"
				use:enhance={() => {
					return async ({ update }) => {
						editStrategyDialogOpen = false;
						editingStrategy = null;
						await update();
					};
				}}
				class="space-y-4"
			>
				<input type="hidden" name="id" value={editingStrategy.id} />
				<div class="space-y-2">
					<Label for="edit-strategy-name">Name</Label>
					<Input
						id="edit-strategy-name"
						name="name"
						value={editingStrategy.name}
						required
					/>
				</div>
				<div class="space-y-2">
					<Label>Description</Label>
					<input type="hidden" name="description" value={editDescription} />
					<RichTextEditor
						content={editingStrategy.description ?? ''}
						placeholder="Describe this strategy..."
						onchange={(html) => (editDescription = html)}
					/>
				</div>
				<Dialog.Footer>
					<Button
						variant="outline"
						type="button"
						onclick={() => (editStrategyDialogOpen = false)}
					>
						Cancel
					</Button>
					<Button type="submit">Save Changes</Button>
				</Dialog.Footer>
			</form>
		{/if}
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
