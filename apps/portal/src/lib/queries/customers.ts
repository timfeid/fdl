import { client } from '$lib/request';
import * as Apollo from '@apollo/client';

const { gql } = Apollo

type GetCustomerOptions = {
  after?: string,
  search?: string,
}

export async function getCustomers(options: GetCustomerOptions = {}) {
  const {data} = await client.query({
    query: gql`query ($first: Int, $after: String, $search: String) {
      customers(first: $first, after: $after, search: $search) {
        edges {
          node {
            id
            name
            phone
            email
            address
          }
        }
        pageInfo {
          endCursor
          hasNextPage
        }
        totalCount
      }
    }`,
    variables: options,
    fetchPolicy: 'network-only',
  })

  return data.customers
}

export async function getCustomer(id: string) {
  const {data} = await client.query({
    query: gql`query ($id: String!) {
      customer(id: $id) {
        id
        name
        firstName
        lastName
        email
        picture
        phone
        title
        address {
          description
          lng
          lat
        }
        invoices {
          id
          status
          type
          dateDue
          total
        }
      }
    }`,
    variables: {
      id,
    },
    fetchPolicy: 'network-only',
  })

  return data.customer
}
