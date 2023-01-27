<script lang="ts">
  import { load } from './utils';
  import { onMount } from "svelte";

  const { sin, cos, max, min, sign } = Math;


  // Props

  export let color:string;
  export let depth:string;
  export let auto:boolean = false;


  // Const

  const DEPTH_RES = 4;


  // Dom

  let container:HTMLDivElement;


  // State

  let focusPoint = { x: 0, y: 0, z: 0.5 };
  let loading = true;
  let running = true;


  //
  // Asynchronously Generate Layers
  //

  let currentDepth = 0;
  let layers = [];

  let colorData:ImageData;
  let depthData:ImageData;

  const layerCanvas = ():HTMLCanvasElement => {
    const layer  = document.createElement("canvas");
    layer.width  = 512;
    layer.height = 512;
    return layer;
  }

  const genLayer = (depth:number):HTMLCanvasElement => {
    const layer = layerCanvas();
    const ctx = layer.getContext("2d");
    ctx.putImageData(colorData, 0, 0);

    const layerData = ctx.getImageData(0, 0, 512, 512);

    for (let x = 0; x < 512; x++) {
      for (let y = 0; y < 512; y++) {
        const pixelIx = (y * 512 + x) * 4;

        if (depthData.data[pixelIx] < depth) {
          layerData.data[(y * 512 + x) * 4 + 3] = 0;
        }
      }
    }

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
    layers.map((layer, ix) => {
      const x = focusPoint.x * (layers.length * focusPoint.z - ix);
      const y = focusPoint.y * (layers.length * focusPoint.z - ix);
      layer.style.transform = `translate(${x}px, ${y}px)`;
    });

    if (auto) {
      focusPoint.x = sin(Date.now() / 1000);
      focusPoint.y = cos(Date.now() / 1000);
    }

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
    const colorImage = await load(color);
    colorData = colorImage.getContext("2d").getImageData(0, 0, 512, 512);

    const depthImage = await load(depth);
    depthData = depthImage.getContext("2d").getImageData(0, 0, 512, 512);

    // Begin with generate loop, render loop will be started from there
    generate();

    // Attach events
    if (!auto) {
      container.addEventListener('mousemove', trackMouse);
      container.addEventListener('mousewheel', (e:WheelEvent) => {
        e.preventDefault();
        focusPoint.z = min(1, max(0, focusPoint.z - sign(e.deltaY) / 20));
        console.log(focusPoint.z);
      });
    }

    return () => {
      container.removeEventListener('mousemove', trackMouse);
    };
  });

</script>


<div bind:this={container}>
  {#if loading}
    <div class="loader">
      <span>.</span>
      <span>.</span>
      <span>.</span>
    </div>
  {/if}
</div>


<style>

  div {
    width:    512px;
    height:   512px;
    position: relative;
    overflow: hidden;
  }

  div :global(canvas) {
    display: block;
    position: absolute;
    top:  0px;
    left: 0px;
    pointer-events: none;
    border: 2px solid black;
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

  @keyframes blink {
    0%   { opacity: 0; }
    50%  { opacity: 1; }
    100% { opacity: 0; }
  }
</style>
