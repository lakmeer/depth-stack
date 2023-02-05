<script>

</script>


<div class="HexView__Cell">
  <div class="inner">
    <slot></slot>
  </div>
</div>


<style>
  .HexView__Cell {
    position: relative;
    overflow: hidden;
    border: 2px solid white;
    background: white;
    clip-path:  polygon(0% 25%, 0% 75%, 50% 100%, 100% 75%, 100% 25%, 50% 0%);
  }

  .inner {
    position:   relative;
    background: rgba(255, 0, 255, 0.3);
    width:      100%;
    height:     100%;
    clip-path:  polygon(0% 25%, 0% 75%, 50% 100%, 100% 75%, 100% 25%, 50% 0%);
  }
</style>

