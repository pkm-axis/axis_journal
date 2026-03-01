<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Editor } from '@tiptap/core';
	import StarterKit from '@tiptap/starter-kit';
	import Underline from '@tiptap/extension-underline';
	import Placeholder from '@tiptap/extension-placeholder';
	import Link from '@tiptap/extension-link';
	import TextAlign from '@tiptap/extension-text-align';
	import Highlight from '@tiptap/extension-highlight';
	import CodeBlock from '@tiptap/extension-code-block';
	import {
		Undo2,
		Redo2,
		Bold,
		Italic,
		Underline as UnderlineIcon,
		Strikethrough,
		Code,
		List,
		ListOrdered,
		Quote,
		Minus,
		AlignLeft,
		AlignCenter,
		AlignRight,
		Highlighter,
		Link as LinkIcon,
		Unlink,
		Heading1,
		Heading2,
		Heading3,
		Pilcrow
	} from 'lucide-svelte';

	interface Props {
		content?: string;
		placeholder?: string;
		onchange?: (html: string) => void;
	}

	let { content = '', placeholder = 'Write something...', onchange }: Props = $props();

	let element: HTMLDivElement;
	let editor: Editor | undefined = $state(undefined);
	let linkUrl = $state('');
	let showLinkInput = $state(false);
	let editorTick = $state(0);

	function isActive(name: string, attrs?: Record<string, unknown>): boolean {
		editorTick;
		return editor?.isActive(name, attrs) ?? false;
	}

	function canUndo(): boolean {
		editorTick;
		return editor?.can().undo() ?? false;
	}

	function canRedo(): boolean {
		editorTick;
		return editor?.can().redo() ?? false;
	}

	onMount(() => {
		editor = new Editor({
			element,
			extensions: [
				StarterKit.configure({
					heading: { levels: [1, 2, 3] },
					codeBlock: false,
					blockquote: false
				}),
				Underline,
				Placeholder.configure({ placeholder }),
				Link.configure({
					openOnClick: false,
					HTMLAttributes: {
						class: 'text-primary underline cursor-pointer'
					}
				}),
				TextAlign.configure({
					types: ['heading', 'paragraph']
				}),
				Highlight.configure({
					multicolor: false
				}),
				CodeBlock.configure({
					HTMLAttributes: {
						class: 'bg-muted rounded-md p-3 font-mono text-sm'
					}
				})
			],
			content,
			editorProps: {
				attributes: {
					class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[120px] px-3 py-2 [&_ul]:my-1 [&_ol]:my-1 [&_li]:my-0 [&_p]:my-1 [&_h1]:mt-2 [&_h1]:mb-1 [&_h2]:mt-2 [&_h2]:mb-1 [&_h3]:mt-1 [&_h3]:mb-0.5 [&_blockquote]:border-l-2 [&_blockquote]:border-muted-foreground [&_blockquote]:pl-3 [&_blockquote]:italic'
				}
			},
			onTransaction: () => {
				editorTick++;
			},
			onUpdate: ({ editor: e }) => {
				const html = e.getHTML();
				onchange?.(html === '<p></p>' ? '' : html);
			}
		});
	});

	onDestroy(() => {
		editor?.destroy();
	});

	export function setContent(html: string) {
		editor?.commands.setContent(html);
	}

	function addLink() {
		if (!editor || !linkUrl) return;
		editor.chain().focus().extendMarkRange('link').setLink({ href: linkUrl }).run();
		linkUrl = '';
		showLinkInput = false;
	}

	function removeLink() {
		editor?.chain().focus().unsetLink().run();
	}

	type ToolbarButton = {
		icon: typeof Bold;
		action: () => void;
		name: string;
		attrs?: Record<string, unknown>;
		title: string;
	};

	const formatButtons: ToolbarButton[] = [
		{
			icon: Bold,
			action: () => editor?.chain().focus().toggleBold().run(),
			name: 'bold',
			title: 'Bold'
		},
		{
			icon: Italic,
			action: () => editor?.chain().focus().toggleItalic().run(),
			name: 'italic',
			title: 'Italic'
		},
		{
			icon: UnderlineIcon,
			action: () => editor?.chain().focus().toggleUnderline().run(),
			name: 'underline',
			title: 'Underline'
		}
	];

	const headingButtons: ToolbarButton[] = [
		{
			icon: Heading1,
			action: () => editor?.chain().focus().toggleHeading({ level: 1 }).run(),
			name: 'heading',
			attrs: { level: 1 },
			title: 'Heading 1'
		},
		{
			icon: Heading2,
			action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(),
			name: 'heading',
			attrs: { level: 2 },
			title: 'Heading 2'
		},
		{
			icon: Heading3,
			action: () => editor?.chain().focus().toggleHeading({ level: 3 }).run(),
			name: 'heading',
			attrs: { level: 3 },
			title: 'Heading 3'
		}
	];

	const listButtons: ToolbarButton[] = [
		{
			icon: List,
			action: () => editor?.chain().focus().toggleBulletList().run(),
			name: 'bulletList',
			title: 'Bullet List'
		},
		{
			icon: ListOrdered,
			action: () => editor?.chain().focus().toggleOrderedList().run(),
			name: 'orderedList',
			title: 'Numbered List'
		}
	];

	const alignButtons: ToolbarButton[] = [
		{
			icon: AlignLeft,
			action: () => editor?.chain().focus().setTextAlign('left').run(),
			name: 'textAlign',
			attrs: { textAlign: 'left' },
			title: 'Align Left'
		},
		{
			icon: AlignCenter,
			action: () => editor?.chain().focus().setTextAlign('center').run(),
			name: 'textAlign',
			attrs: { textAlign: 'center' },
			title: 'Align Center'
		},
		{
			icon: AlignRight,
			action: () => editor?.chain().focus().setTextAlign('right').run(),
			name: 'textAlign',
			attrs: { textAlign: 'right' },
			title: 'Align Right'
		}
	];
</script>

<div class="rounded-md border border-input bg-background overflow-hidden">
	{#if editor}
		<div class="flex flex-wrap items-center gap-0.5 border-b border-input bg-muted/30 px-1 py-1">
			<!-- Headings -->
			{#each headingButtons as btn}
				<button
					type="button"
					class="rounded p-1.5 transition-colors {isActive(btn.name, btn.attrs)
						? 'bg-accent text-accent-foreground'
						: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}"
					onclick={btn.action}
					title={btn.title}
				>
					<btn.icon class="size-4" />
				</button>
			{/each}

			<div class="mx-1 h-5 w-px bg-border"></div>

			<!-- Formatting -->
			{#each formatButtons as btn}
				<button
					type="button"
					class="rounded p-1.5 transition-colors {isActive(btn.name, btn.attrs)
						? 'bg-accent text-accent-foreground'
						: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}"
					onclick={btn.action}
					title={btn.title}
				>
					<btn.icon class="size-4" />
				</button>
			{/each}

			<div class="mx-1 h-5 w-px bg-border"></div>

			<!-- Lists & Quote -->
			{#each listButtons as btn}
				<button
					type="button"
					class="rounded p-1.5 transition-colors {isActive(btn.name, btn.attrs)
						? 'bg-accent text-accent-foreground'
						: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}"
					onclick={btn.action}
					title={btn.title}
				>
					<btn.icon class="size-4" />
				</button>
			{/each}

			<div class="mx-1 h-5 w-px bg-border"></div>

			<!-- Alignment -->
			{#each alignButtons as btn}
				<button
					type="button"
					class="rounded p-1.5 transition-colors {isActive(btn.name, btn.attrs)
						? 'bg-accent text-accent-foreground'
						: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}"
					onclick={btn.action}
					title={btn.title}
				>
					<btn.icon class="size-4" />
				</button>
			{/each}

			<div class="mx-1 h-5 w-px bg-border"></div>

			<!-- Link -->
			{#if showLinkInput}
				<div class="flex items-center gap-1">
					<input
						type="url"
						class="h-7 w-40 rounded border border-input bg-background px-2 text-xs"
						placeholder="https://..."
						bind:value={linkUrl}
						onkeydown={(e) => e.key === 'Enter' && addLink()}
					/>
					<button
						type="button"
						class="rounded bg-primary px-2 py-1 text-xs text-primary-foreground hover:bg-primary/90"
						onclick={addLink}
					>
						Add
					</button>
					<button
						type="button"
						class="rounded px-2 py-1 text-xs text-muted-foreground hover:bg-accent"
						onclick={() => (showLinkInput = false)}
					>
						Cancel
					</button>
				</div>
			{:else}
				<button
					type="button"
					class="rounded p-1.5 transition-colors {isActive('link')
						? 'bg-accent text-accent-foreground'
						: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'}"
					onclick={() => (showLinkInput = true)}
					title="Add Link"
				>
					<LinkIcon class="size-4" />
				</button>
				{#if isActive('link')}
					<button
						type="button"
						class="rounded p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
						onclick={removeLink}
						title="Remove Link"
					>
						<Unlink class="size-4" />
					</button>
				{/if}
			{/if}

			<div class="mx-1 h-5 w-px bg-border"></div>

			<!-- Horizontal Rule -->
			<button
				type="button"
				class="rounded p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
				onclick={() => editor?.chain().focus().setHorizontalRule().run()}
				title="Horizontal Rule"
			>
				<Minus class="size-4" />
			</button>
		</div>
	{/if}
	<div bind:this={element}></div>
</div>

<style>
	:global(.tiptap p.is-editor-empty:first-child::before) {
		color: var(--muted-foreground);
		content: attr(data-placeholder);
		float: left;
		height: 0;
		pointer-events: none;
	}

	:global(.tiptap mark) {
		background-color: rgb(255, 213, 0);
		border-radius: 0.125rem;
		padding: 0.125rem 0;
	}

	:global(.dark .tiptap mark) {
		background-color: rgb(200, 170, 0);
	}
</style>
