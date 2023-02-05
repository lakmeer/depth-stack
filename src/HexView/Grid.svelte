<script lang="ts">
  export let rowSize:number = 5;

  console.log("HexView.Grid.svelte");
</script>


<div class="HexView main" style="--n: {rowSize};">
  <div class="container">
    <slot></slot>
  </div>

  <div class="debug" />
</div>


<style>

  .main {
    display: flex;
    position: relative;

    --s: calc(100vw / (var(--n) + 1));
    --m: calc((100vw - (var(--s) * var(--n))) / (var(--n) * (var(--n) + 1)));
    --f: calc(1.732 * var(--s) + 4 * var(--m));
    --z: calc(-1 * (var(--m) - var(--s) * 0.2885));
    --g: #0000 0 calc(var(--f) - 10px), #fff 0 calc(var(--f) - 1px);
  }

  .container {
    font-size: 0;
    padding-bottom: calc(var(--z) + var(--m));
  }

  .container::before {
    content: "";
    float: left;
    width: calc(var(--s)/2 + var(--m));
    height: 100%;
    shape-outside: repeating-linear-gradient(var(--g));
  }

  .container::after {
    content: "";
    clear: both;
    display: block;
  }

  :global(.HexView__Cell) {
    display: inline-block;
    width: var(--s);
    height: calc(var(--s) * 1.1547);
    margin: var(--m);
    margin-bottom: calc(-1 * var(--z));
  }

</style>
