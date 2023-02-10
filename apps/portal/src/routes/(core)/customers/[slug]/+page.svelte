<script lang="ts">

  import Section from "$lib/components/Section.svelte";
  import Page from "$lib/components/Page.svelte";
  import Map from '$lib/components/Map.svelte'
  import type { PageData } from "./$types";
    import MapMarker from "$lib/components/MapMarker.svelte";
    import SectionHeader from "$lib/components/SectionHeader.svelte";
    import Grid from "gridjs-svelte/gridjs.svelte"

  export let data: PageData

</script>
<Page title="Customer details">
  <div class="flex space-x-12">
    <div class="w-1/4 space-y-8">
      <Section>
        <div class="flex flex-col items-center space-y-2">
          <img class="rounded-full w-24 h-24 mb-8" src={data.customer.picture} alt={data.customer.name}>
          <div class="font-semibold">
            {data.customer.name}
          </div>
          {#if data.customer.title}
            <div class="text-gray-500">
              {data.customer.title}
            </div>
          {/if}
        </div>
      </Section>
      <Section>
        <SectionHeader slot="section-header" title="Details"></SectionHeader>
        <div class="space-y-4">
          <div>
            <div class="font-semibold">
              ID
            </div>
            <div class="text-slate-500">
              {data.customer.id}
            </div>
          </div>
          <div>
            <div class="font-semibold">
              Email
            </div>
            <div class="text-slate-500">
              {data.customer.email}
            </div>
          </div>
          <div>
            <div class="font-semibold">
              Address
            </div>
            <div class="text-slate-500">
              {data.customer.address.description}
            </div>
          </div>
        </div>
      </Section>
    </div>
    <div class="w-3/4 space-y-8">
      {#if data.customer.invoices.length > 0}
      <Section>
        <SectionHeader slot="section-header" title="Invoices/Estimates"></SectionHeader>
        <Grid data={data.customer.invoices} />
      </Section>
      {/if}

      <Section>
        <SectionHeader slot="section-header" title="Location"></SectionHeader>
        <div class="-ml-6 -mr-6 -mb-6">

          <Map center={{lat: data.customer.address.lat, lng: data.customer.address.lng}} let:map={map}>
            <MapMarker lat={data.customer.address.lat} lng={data.customer.address.lng} map={map} />
          </Map>
        </div>
      </Section>
    </div>
  </div>
</Page>
