<script>
  import InputField from "$lib/components/InputField.svelte";

</script>

<div class="hidden lg:w-96 h-screen fixed bg-zinc-900 text-white lg:flex flex-col">
  <div>it stays</div>
  <div class="flex-grow overflow-y-hidden">
    <div class="overflow-y-auto h-full">
      <a href="/customers" class="py-2 px-4 block">Customers</a>
    </div>
  </div>
  <div class="h-10">it stays</div>
</div>
<div class="lg:ml-96">
  <slot></slot>
</div>
