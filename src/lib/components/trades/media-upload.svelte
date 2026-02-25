<script lang="ts">
	import { createClient } from '$lib/supabase/client.js';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { Upload, X, Image, Trash2, Loader2 } from 'lucide-svelte';

	let {
		tradeId,
		userId,
		media = [],
		onUpload
	}: {
		tradeId: string;
		userId: string;
		media: Array<{ id: string; storage_path: string; caption: string | null; type: string }>;
		onUpload?: () => void;
	} = $props();

	let uploading = $state(false);
	let dragOver = $state(false);
	let viewerOpen = $state(false);
	let viewerImage = $state('');
	let fileInput: HTMLInputElement;

	const supabase = createClient();

	function getPublicUrl(path: string) {
		const { data } = supabase.storage.from('trade-media').getPublicUrl(path);
		return data.publicUrl;
	}

	async function uploadFiles(files: FileList) {
		uploading = true;
		try {
			for (const file of Array.from(files)) {
				const ext = file.name.split('.').pop();
				const path = `${userId}/${tradeId}/${Date.now()}.${ext}`;

				const { error: uploadError } = await supabase.storage
					.from('trade-media')
					.upload(path, file);

				if (uploadError) {
					console.error('Upload error:', uploadError);
					continue;
				}

				await supabase.from('trade_media').insert({
					trade_id: tradeId,
					storage_path: path,
					type: 'screenshot' as const
				});
			}
			onUpload?.();
		} finally {
			uploading = false;
		}
	}

	async function deleteMedia(id: string, path: string) {
		await supabase.storage.from('trade-media').remove([path]);
		await supabase.from('trade_media').delete().eq('id', id);
		onUpload?.();
	}

	function handleDrop(e: DragEvent) {
		e.preventDefault();
		dragOver = false;
		if (e.dataTransfer?.files) {
			uploadFiles(e.dataTransfer.files);
		}
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		dragOver = true;
	}
</script>

<div class="space-y-4">
	<!-- Upload Zone -->
	<button
		class="border-border hover:border-primary/50 hover:bg-muted/50 flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors {dragOver
			? 'border-primary bg-primary/5'
			: ''}"
		ondrop={handleDrop}
		ondragover={handleDragOver}
		ondragleave={() => (dragOver = false)}
		onclick={() => fileInput?.click()}
		type="button"
	>
		{#if uploading}
			<Loader2 class="text-muted-foreground mb-2 size-8 animate-spin" />
			<p class="text-muted-foreground text-sm">Uploading...</p>
		{:else}
			<Upload class="text-muted-foreground mb-2 size-8" />
			<p class="text-muted-foreground text-sm">
				Drop images here or click to upload
			</p>
			<p class="text-muted-foreground text-xs">PNG, JPG, GIF up to 10MB</p>
		{/if}
	</button>

	<input
		type="file"
		accept="image/*"
		multiple
		class="hidden"
		bind:this={fileInput}
		onchange={(e) => {
			const target = e.target as HTMLInputElement;
			if (target.files) uploadFiles(target.files);
		}}
	/>

	<!-- Media Gallery -->
	{#if media.length > 0}
		<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
			{#each media as item}
				<div class="group relative aspect-video overflow-hidden rounded-lg border">
					<button
						class="size-full"
						onclick={() => {
							viewerImage = getPublicUrl(item.storage_path);
							viewerOpen = true;
						}}
						type="button"
					>
						<img
							src={getPublicUrl(item.storage_path)}
							alt={item.caption ?? 'Trade screenshot'}
							class="size-full object-cover transition-transform group-hover:scale-105"
						/>
					</button>
					<button
						class="absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100"
						onclick={() => deleteMedia(item.id, item.storage_path)}
						type="button"
					>
						<Trash2 class="size-3" />
					</button>
					{#if item.caption}
						<div class="absolute bottom-0 left-0 right-0 bg-black/60 px-2 py-1">
							<p class="truncate text-xs text-white">{item.caption}</p>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	{/if}
</div>

<!-- Image Viewer Dialog -->
<Dialog.Root bind:open={viewerOpen}>
	<Dialog.Content class="max-w-4xl">
		<Dialog.Header>
			<Dialog.Title>Trade Screenshot</Dialog.Title>
		</Dialog.Header>
		{#if viewerImage}
			<img src={viewerImage} alt="Trade screenshot" class="w-full rounded-lg" />
		{/if}
	</Dialog.Content>
</Dialog.Root>
