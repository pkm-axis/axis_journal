<script lang="ts">
	import { enhance } from '$app/forms';
	import { Button } from '$lib/components/ui/button/index.js';
	import { Input } from '$lib/components/ui/input/index.js';
	import { Label } from '$lib/components/ui/label/index.js';
	import * as Card from '$lib/components/ui/card/index.js';
	import { Separator } from '$lib/components/ui/separator/index.js';

	let { form } = $props();
	let loading = $state(false);
</script>

<svelte:head>
	<title>Sign In - Axis Journal</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center p-4">
	<Card.Root class="w-full max-w-md">
		<Card.Header class="text-center">
			<div class="mx-auto mb-2 flex size-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-xl">
				A
			</div>
			<Card.Title class="text-2xl">Welcome back</Card.Title>
			<Card.Description>Sign in to your trading journal</Card.Description>
		</Card.Header>
		<Card.Content class="space-y-4">
			{#if form?.error}
				<div class="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
					{form.error}
				</div>
			{/if}

			<form method="POST" action="?/login" use:enhance={() => {
				loading = true;
				return async ({ update }) => {
					loading = false;
					await update();
				};
			}}>
				<div class="space-y-4">
					<div class="space-y-2">
						<Label for="email">Email</Label>
						<Input id="email" name="email" type="email" placeholder="you@example.com" required />
					</div>
					<div class="space-y-2">
						<Label for="password">Password</Label>
						<Input id="password" name="password" type="password" placeholder="••••••••" required />
					</div>
					<Button type="submit" class="w-full" disabled={loading}>
						{loading ? 'Signing in...' : 'Sign in'}
					</Button>
				</div>
			</form>

			<div class="relative">
				<div class="absolute inset-0 flex items-center">
					<Separator />
				</div>
				<div class="relative flex justify-center text-xs uppercase">
					<span class="bg-card text-muted-foreground px-2">Or continue with</span>
				</div>
			</div>

			<div class="grid grid-cols-2 gap-3">
				<form method="POST" action="?/oauth" use:enhance>
					<input type="hidden" name="provider" value="google" />
					<Button variant="outline" type="submit" class="w-full">Google</Button>
				</form>
				<form method="POST" action="?/oauth" use:enhance>
					<input type="hidden" name="provider" value="github" />
					<Button variant="outline" type="submit" class="w-full">GitHub</Button>
				</form>
			</div>
		</Card.Content>
		<Card.Footer class="justify-center">
			<p class="text-sm text-muted-foreground">
				Don't have an account? <a href="/register" class="text-primary hover:underline font-medium">Sign up</a>
			</p>
		</Card.Footer>
	</Card.Root>
</div>
