<script lang="ts">
  import {ulid} from 'ulidx'

  let className = ''

  function typeAction(node: any) {
    node.type = type;
  }

  export { className as class }
  export let inputClasses: string = 'px-4 py-2'
  export let id: string = ulid()
  export let name = ''
  export let autocomplete = name
  export let type = 'text'
  export let value = ''
  export let placeholder = ''
  export let error: string | null = null
</script>

<div class={`${className}`}>
  {#if $$slots.default}
    <label for={id} class="block mb-2">
      <slot></slot>
    </label>
  {/if}
  <input
    class="block w-full bg-gray-100 rounded hover:outline-primary-300 {error ? 'border-red' : 'border-insights-gray-100'} {inputClasses}"
    {autocomplete}
    {name}
    {id}
    {placeholder}
    use:typeAction
    bind:value={value}
  />
  {#if error}
    <div class="mt-2 text-sm text-red">
      {error}
    </div>
  {/if}
</div>
