import { PrismaClient, User } from '@fdl/data'
import faker from 'faker'
import Container from 'typedi'
import { PasswordService } from '../../src/modules/password/password.service'
import { userFactory } from '../factories'
import { testClient } from '../test-client'

describe('login', () => {
  let user: User
  const password = faker.internet.password()
  const prisma = new PrismaClient()

  it('logs them in with laravel/legacy password', async () => {
    const user = await prisma.user.create({
      data: {
        ...userFactory(),
        password: (
          await Container.get(PasswordService).encrypt(password)
        ).replace(/\$2[a|b]\$/, '$2y$'),
      },
    })

    const response = await testClient.executeOperation({
      query: `mutation ($email: String!, $password: String!) {
        login(email: $email, password: $password) {
          success
          error
        }
      }`,
      variables: {
        email: user.email,
        password,
      },
    })

    expect(response.data.login.success).toBe(true)
  })

  it('logs them in', async () => {
    const user = await prisma.user.create({
      data: {
        ...userFactory(),
        password: await Container.get(PasswordService).encrypt(password),
      },
    })

    const response = await testClient.executeOperation({
      query: `mutation ($email: String!, $password: String!) {
        login(email: $email, password: $password) {
          success
          error
        }
      }`,
      variables: {
        email: user.email,
        password,
      },
    })

    console.log(response.http.headers)
  })
})
