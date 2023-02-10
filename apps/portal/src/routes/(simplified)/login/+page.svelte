<script lang="ts">
	import { login } from "$lib/mutations/login";
  import InputField from '$lib/components/InputField.svelte';

  let email = ''
  let password = ''
  let loading = false
  let error = false

  async function submit() {
    error = false
    loading = true
    const response = await login(email, password)
    loading = false
    if (!response.data.login.success) {
      error = true
    }
  }

</script>

<div class="max-w-[400px] mx-auto">
  <div class="text-4xl font-medium mb-4">Log in</div>
  {#if error}
    <div class="mb-8 p-4 border border-red-900 text-red-900 rounded bg-red-50">
      <div class="font-medium">Invalid username or password.</div>
      Please try again. <a class="text-red-900 underline underline-offset-4" href="/forgot-password">Forgot password?</a>
    </div>
  {/if}
  <form on:submit|preventDefault={submit}>
    <InputField id="email" name="email" bind:value={email}>
      Email
    </InputField>

    <InputField id="password" type="password" name="password" bind:value={password}>
      Password
    </InputField>

    <button class={`bg-blue-500 text-white w-full py-3 mt-2 ${loading ? 'bg-blue-500 text-gray-100' : ''}`}>
      Log in
    </button>
  </form>

  <div class="my-6">
    <a class="text-blue-500" href="/forgot-password">Forgot password?</a>
  </div>

</div>
