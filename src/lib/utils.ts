import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { Snippet } from 'svelte';

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & {
	ref?: U | null;
};

type WithChild<T> = T & { child?: Snippet<[T & { props: Record<string, unknown> }]> };
type WithChildren<T> = T & { children?: Snippet };

export type WithoutChildrenOrChild<T> = Omit<T, 'children' | 'child'>;
export type WithoutChildren<T> = Omit<T, 'children'>;
export type WithoutChild<T> = Omit<T, 'child'>;
export type { WithChild, WithChildren };
