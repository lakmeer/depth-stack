<script lang="ts">
  import StereoImage from "./StereoImage.svelte";

  let images = [
    { color: '/Hut-alternative.jpg',   depth: '/Hut-depthmap.jpg' },
    { color: '/Mango-alternative.jpg', depth: '/Mango-depthmap.jpg' },
    { color: '/1.png', depth: '/1d.png' },
    { color: '/2.png', depth: '/2d.png' },
    { color: '/3.png', depth: '/3d.png' },
    { color: '/4.png', depth: '/4d.png' },
    { color: '/5.png', depth: '/5d.png' },
  ]
</script>


<main>
  {#each images as image}
    <StereoImage {...image} auto={false} />
  {/each}
</main>


<style>
  main {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-gap: 1rem;
  }
</style>
