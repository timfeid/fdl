<script lang="ts">
  import Section from "$lib/components/Section.svelte";
  import type { PageData } from "./$types";
  import type { PageInfo } from "../../../../../server/src/modules/connection/page-info";
	import type { Customer } from "../../../../../server/src/modules/customer/customer.schema";
  import { extractNode } from "../../../lib/utils";
  import Page from '$lib/components/Page.svelte'
  import Grid from "gridjs-svelte/gridjs.svelte"
  import { html } from 'gridjs'
    import PageHeader from "../../../lib/components/PageHeader.svelte";
    import CreateCustomerButton from "../../../lib/components/customers/CreateCustomerButton.svelte";

  export let data: PageData

  let pageInfo: PageInfo
  let customers: Customer[] = []

  function setData(response: {edges: {node: any}[], pageInfo: PageInfo}) {
    customers = [...customers, ...extractNode(response.edges)]
    pageInfo = response.pageInfo
  }

  const columns = [
    {
      name: 'id',
      hidden: true,
    },
    {
      name: 'Name',
      formatter: (cellValue: any, row: any) => {
        return html(`<a href="/customers/${row._cells[0].data}">${cellValue}</a>`)
      }
    },
    'Phone',
    'Email',
    'Address',
  ]

  let gridData: any[] = []

  $: {
    gridData = customers.map(customer => [customer.id, customer.name, customer.phone, customer.email, customer.address])
  }

  setData(data.customers)
</script>

<Page>
  <PageHeader title="Customers">
    <CreateCustomerButton />
  </PageHeader>
  <Section>
    <Grid data={gridData} {columns} />
  </Section>
</Page>
