<script lang="ts">
  function typeAction(node: any) {
    node.type = type;
  }

  export let type = 'button'
  export let loading = false

  let classes = 'bg-purple-900 text-white hover:bg-purple-700'

  export { classes as class}
</script>

<button
  class="{classes} px-4 rounded shadow-lg py-2"
  class:opacity-80={loading}
  use:typeAction
  on:click
>
  <slot></slot>
</button>
