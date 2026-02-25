<script lang="ts">
	import { onMount } from 'svelte';
	import {
		Chart,
		LineController,
		LineElement,
		PointElement,
		LinearScale,
		CategoryScale,
		Filler,
		Tooltip,
		Legend
	} from 'chart.js';

	Chart.register(
		LineController,
		LineElement,
		PointElement,
		LinearScale,
		CategoryScale,
		Filler,
		Tooltip,
		Legend
	);

	let {
		labels,
		datasets,
		height = '300px'
	}: {
		labels: string[];
		datasets: Array<{
			label: string;
			data: number[];
			borderColor?: string;
			backgroundColor?: string;
			fill?: boolean;
		}>;
		height?: string;
	} = $props();

	let canvas: HTMLCanvasElement;
	let chart: Chart | undefined;

	onMount(() => {
		chart = new Chart(canvas, {
			type: 'line',
			data: { labels, datasets },
			options: {
				responsive: true,
				maintainAspectRatio: false,
				interaction: { intersect: false, mode: 'index' },
				plugins: { legend: { display: datasets.length > 1 } },
				scales: {
					x: { grid: { display: false } },
					y: { grid: { color: 'rgba(0,0,0,0.06)' } }
				},
				elements: {
					point: { radius: 2, hoverRadius: 5 },
					line: { tension: 0.3 }
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
