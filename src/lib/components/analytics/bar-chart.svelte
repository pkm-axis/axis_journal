<script lang="ts">
	import { onMount } from 'svelte';
	import {
		Chart,
		BarController,
		BarElement,
		LinearScale,
		CategoryScale,
		Tooltip,
		Legend
	} from 'chart.js';

	Chart.register(BarController, BarElement, LinearScale, CategoryScale, Tooltip, Legend);

	let {
		labels,
		datasets,
		height = '250px'
	}: {
		labels: string[];
		datasets: Array<{
			label: string;
			data: number[];
			backgroundColor?: string | string[];
		}>;
		height?: string;
	} = $props();

	let canvas: HTMLCanvasElement;
	let chart: Chart | undefined;

	onMount(() => {
		chart = new Chart(canvas, {
			type: 'bar',
			data: { labels, datasets },
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: { legend: { display: datasets.length > 1 } },
				scales: {
					x: { grid: { display: false } },
					y: { grid: { color: 'rgba(0,0,0,0.06)' } }
				}
			}
		});

		return () => chart?.destroy();
	});

	$effect(() => {
		if (chart) {
			chart.data.labels = labels;
			chart.data.datasets = datasets;
			chart.update();
		}
	});
</script>

<div style="height: {height}">
	<canvas bind:this={canvas}></canvas>
</div>
