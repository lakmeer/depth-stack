<script lang="ts" context="module">
  type LayerCache = { [key: string]: Array<ImageData> }
  let layerCache:LayerCache = {};
</script>

<script lang="ts">
  import { load } from './utils';
  import { onMount } from "svelte";

  const { sin, cos, max, min, sign } = Math;


  // Props

  export let color:string;
  export let depth:string;
  export let auto:boolean = false;
  export let focus:number = 0.5;

  export let showIndicator:boolean = true;


  // Const

  const DEPTH_RES = 8;
  const EXCURSION_PERCENT = 10;


  // Dom

  let container:HTMLDivElement;


  // State

  let naturalSize = { width: 1, height: 1 };
  let focusPoint = { x: 0, y: 0, z: focus };
  let loading = true;
  let running = true;
  let shown = 1;


  //
  // Asynchronously Generate Layers
  //

  let currentDepth = 0;
  let layers = [];

  let colorData:ImageData;
  let depthData:ImageData;

  const layerCanvas = ():HTMLCanvasElement => {
    const layer  = document.createElement("canvas");
    layer.width  = naturalSize.width;
    layer.height = naturalSize.height;
    return layer;
  }

  const genLayer = (depth:number):HTMLCanvasElement => {
    const layer = layerCanvas();
    const ctx = layer.getContext("2d");

    if (layerCache[color][depth]) {
      ctx.putImageData(layerCache[color][depth], 0, 0);
      return layer;
    }

    ctx.putImageData(colorData, 0, 0);

    const layerData = ctx.getImageData(0, 0, naturalSize.width, naturalSize.height);

    for (let x = 0; x < naturalSize.width; x++) {
      for (let y = 0; y < naturalSize.height; y++) {
        const pixelIx = (y * naturalSize.width + x) * 4;

        if (depthData.data[pixelIx] < depth) {
          layerData.data[pixelIx + 3] = 0;
        }
      }
    }

    if (!layerCache[color]) layerCache[color] = [];
    layerCache[color][depth] = layerData;

    ctx.putImageData(layerData, 0, 0);

    return layer;
  };

  const generate = () => {
    if (currentDepth >= 255) {
      loading = false;
      running = true;
      render();
    } else {
      const layer = genLayer(currentDepth);
      currentDepth += DEPTH_RES;
      layers.push(layer);
      container.appendChild(layer);
    }

    if (loading) requestAnimationFrame(generate);
  }


  //
  // Animation loop
  //

  const render = () => {
    if (auto) {
      focusPoint.x = sin(Date.now() / 1000 * 3);
      focusPoint.y = cos(Date.now() / 1000 * 3);
    }

    if (shown > 0) shown *= 0.9;
    if (shown < 0.05) shown = 0;

    console.log(shown);

    layers.map((layer, ix) => {
      const p = (layers.length * focusPoint.z - ix) / layers.length * EXCURSION_PERCENT;
      const x = focusPoint.x * p;
      const y = focusPoint.y * p;
      layer.style.transform = `translate(${x}%, ${y}%) scale(${1 + EXCURSION_PERCENT/50})`;
    });

    if (running) requestAnimationFrame(render);
  }


  // Event Handler

  const trackMouse = ({ clientX, clientY }) => {
    const { left, top, width, height } = container.getBoundingClientRect();
    focusPoint.x = ((clientX - left) /  width - 0.5) * 2;
    focusPoint.y = ((clientY - top ) / height - 0.5) * 2;
  };


  // Init

  onMount(async () => {
    layerCache[color] = [];

    const colorImage = await load(color);
    naturalSize.width = colorImage.width;
    naturalSize.height = colorImage.height;
    colorData = colorImage.getContext("2d").getImageData(0, 0, naturalSize.width, naturalSize.height);

    const depthImage = await load(depth);
    depthData = depthImage.getContext("2d").getImageData(0, 0, naturalSize.width, naturalSize.height);

    // Begin with generate loop, render loop will be started from there
    generate();

    // Attach events
    if (!auto) {
      container.addEventListener('mousemove', trackMouse);
      container.addEventListener('mousewheel', (e:WheelEvent) => {
        e.preventDefault();
        shown = 1;
        focusPoint.z = min(1, max(0, focusPoint.z + sign(e.deltaY) / 20));
      });
    }

    return () => {
      container.removeEventListener('mousemove', trackMouse);
    };
  });

  $: css = `
    --w: ${naturalSize.width}px;
    --h: ${naturalSize.height}px;
    --a: ${naturalSize.width / naturalSize.height};
    --i: ${shown};
  `;
</script>


<div class="StereoImage" bind:this={container} style="{css}">
  {#if loading}
    <div class="loader">
      <span>.</span>
      <span>.</span>
      <span>.</span>
    </div>
  {/if}
  {#if showIndicator}
    <div class="indicator" style="top: {focusPoint.z * 100}%"></div>
  {/if}
</div>


<style>

  .StereoImage {
    position: relative;
    overflow: hidden;
    aspect-ratio: var(--a);
  }

  .StereoImage :global(canvas) {
    display: block;
    position: absolute;
    top:  0px;
    left: 0px;
    width: 100%;
    height: 100%;
    pointer-events: none;
    border: 3px solid black;
  }

  .StereoImage :global(canvas:first-child) {
    position: relative;
    border: none;
  }

  .loader {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(5px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }

  .loader span {
    display: block;
    color: white;
    margin: 0.1em;
    font-size: 10em;
    transform: translateY(-15%);
    animation: 2s infinite blink;
  }

  .loader span:nth-child(1) { animation-delay: 0.00s; }
  .loader span:nth-child(2) { animation-delay: 0.33s; }
  .loader span:nth-child(3) { animation-delay: 0.66s; }

  .indicator {
    position: absolute;
    border: 20px solid transparent;
    border-left-width: 0;
    border-right-color: white;
    top: 50%;
    right: 0;
    z-index: 1000;
    transform: translate(0, -50%);
    opacity: var(--i);
  }

  @keyframes blink {
    0%   { opacity: 0; }
    50%  { opacity: 1; }
    100% { opacity: 0; }
  }
</style>
