import bcrypt from 'bcrypt'
import faker from 'faker'
import Container from 'typedi'
import { JWTService } from '../../src/modules/jwt/jwt.service'
import { LoginResolver } from '../../src/modules/login/login.resolver'
import { LoginService } from '../../src/modules/login/login.service'
import { UserService } from '../../src/modules/user/user.service'
import { googleResponse } from '../example-data/google-response'
import { meResponse } from '../example-data/linkedin-responses'
import { userFactory } from '../factories'
import { defaultContext } from '../test-client'

describe('Unit::login.resolver', () => {
  const user = userFactory()
  const loginService = Container.get(LoginService)
  const jwtService = Container.get(JWTService)
  const userService = Container.get(UserService)
  const loginResolver = new LoginResolver(loginService, jwtService)

  beforeAll(async () => {
    jest.spyOn(userService, 'findByEmail').mockImplementation(async inputEmail => {
      if (inputEmail === user.email) {
        return {
          ...user,
          password: bcrypt.hashSync(user.password, 1),
        }
      }
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('invalid email', async () => {
    const response = await loginResolver.login(
      defaultContext,
      faker.internet.email(),
      user.password,
    )

    expect(response.accessToken).toBeUndefined()
    expect(response.refreshToken).toBeUndefined()
    expect(response.success).toBeFalsy()
    expect(response.error).not.toBeNull()
  })

  it('invalid password', async () => {
    const response = await loginResolver.login(
      defaultContext,
      user.email,
      faker.internet.password() + '1',
    )

    expect(response.accessToken).toBeUndefined()
    expect(response.refreshToken).toBeUndefined()
    expect(response.success).toBeFalsy()
    expect(response.error).not.toBeNull()
  })

  it('validates login with password', async () => {
    const response = await loginResolver.login(defaultContext, user.email, user.password)

    expect(response.accessToken).toBeTruthy()
    const decodedToken = jwtService.validate(response.accessToken)

    expect(response.success).toBeTruthy()
    expect(response.error).toBeUndefined()
    expect(decodedToken).toHaveProperty('sub')
    expect(decodedToken.sub).toEqual(user.id)
    expect(decodedToken.permissions).not.toBeUndefined()
  })

  it('login with google', async () => {
    const token = faker.datatype.uuid() // should really be a jwt
    const userServiceCreate = jest.spyOn(userService, 'create').mockImplementation()
    jest.spyOn(userService, 'update').mockImplementation()
    jest.spyOn(jwtService, 'validateGoogleToken').mockImplementation(async t => {
      if (t === token) {
        return googleResponse
      }
    })

    await loginResolver.loginWithGoogle({}, token)

    expect(userServiceCreate).toBeCalledWith(
      expect.objectContaining({ googleId: googleResponse.sub }),
    )
  })

  it('login with linkedin', async () => {
    const state = faker.datatype.uuid()
    const code = faker.datatype.uuid()
    const userServiceCreate = jest.spyOn(userService, 'create').mockImplementation()

    await loginResolver.loginWithLinkedin({}, code, state)

    expect(userServiceCreate).toBeCalledWith(expect.objectContaining({ linkedinId: meResponse.id }))
  })
})
