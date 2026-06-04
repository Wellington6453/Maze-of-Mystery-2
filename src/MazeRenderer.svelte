<script>
  export let maze = [];
  export let playerPosition = { x: 0, y: 0 };
  export let tileSize = 32;
  export let cameraOffsetX = 0;
  export let cameraOffsetY = 0;

  $: cols = maze[0] ? maze[0].length : 0;
  $: rows = maze.length;
</script>

<div
  class="maze"
>
  <div
    class="maze-layer"
    style={`--tile-size: ${tileSize}px; --cols: ${cols}; --rows: ${rows}; transform: translate(${-cameraOffsetX}px, ${-cameraOffsetY}px);`}
  >
    {#each maze as row, y}
      {#each row as cell, x}
        <div
          class={`maze-cell ${cell === 1 ? 'wall' : ''} ${
            x === playerPosition.x && y === playerPosition.y ? 'player' : ''
          }`}
        />
      {/each}
    {/each}
  </div>
</div>
