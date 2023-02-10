<script lang="ts">
	import { browser } from "$app/environment";
	import { accessToken, keepTrackOfLoginUrl, user } from "$lib/../store/user";
	import * as Apollo from '@apollo/client';
  import { onMount } from "svelte";
	import "../app.scss";
	import { client } from "../lib/request";
    import { googleMapsIsReady } from "../store/google-maps";
	import type { LayoutData } from './$types';

  export let data: LayoutData;

  keepTrackOfLoginUrl()

  $: {
    if (data.accessToken) {
      accessToken.set({accessToken: data.accessToken, skipRedirect: true})
    }
    if (browser && data.refreshToken && !$user) {
      client.mutate({
        mutation: Apollo.gql`mutation { refreshToken { success, accessToken } }`
      }).then(response => {
        accessToken.set(response.data.refreshToken.accessToken)
      })
    }
  }

  onMount(() => {
    // @ts-ignore
    if (typeof window.google !== 'undefined') {
      googleMapsIsReady.set(true)
    }
  })

</script>

<svelte:head>
	<script async defer src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAQLgaxqnzdh5Yyhdb_Z8rYqvfS9K3KLyk&callback=initMap"></script>
  <script>
    function initMap() {
    }
  </script>
</svelte:head>

<slot></slot>
