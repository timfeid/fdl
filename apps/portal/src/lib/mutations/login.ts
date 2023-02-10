import { accessToken } from "../../store/user"
import { client } from "../request"
import * as Apollo from '@apollo/client'

export async function login(email: string, password: string) {
  const mutation = Apollo.gql`mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      success
      accessToken
    }
  }`

  const response = await client.mutate({
    mutation,
    variables: {
      email,
      password,
    }
  })

  if (response.data.login.success) {
    accessToken.set(response.data.login.accessToken)
  }

  return response
}
