<script lang="ts">
  import * as HexView from "./HexView";
  import StereoImage  from "./StereoImage.svelte";

  let images = [
    { color: '/1.png', depth: '/1d.png' },
    { color: '/2.png', depth: '/2d.png' },
    { color: '/3.png', depth: '/3d.png' },
    { color: '/4.png', depth: '/4d.png' },
    { color: '/5.png', depth: '/5d.png' },
  ]

  // Number of duplicate rows for testing
  const r = Array(2);

  // TODO
  // - Proper drawing instead of dom layers
  // - Support combined rgb/depth images with alpha channel
  // - Fancy bit hackery for performance

</script>


<main>

  <HexView.Grid rowSize={5}>
    {#each r as i}
      {#each images as image}
        <HexView.Cell>
          <StereoImage color={image.color} depth={image.depth} />
        </HexView.Cell>
      {/each}
    {/each}
  </HexView.Grid>

</main>


<style>

  main :global(.HexView__Cell .StereoImage) {
    position: absolute;
    top: 50%;
    left: 50%;
    height: 100%;
    transform: translate(-50%, -50%);
  }

</style>
