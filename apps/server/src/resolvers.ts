import { NonEmptyArray } from 'type-graphql'
import { DownloadResolver } from './modules/download/download.resolver'
import { DownloadableResolver } from './modules/downloadable/downloadable.resolver'
import { LoginResolver } from './modules/login/login.resolver'
import { MediaResolver } from './modules/media/media.resolver'
import { UserResolver } from './modules/user/user.resolver'

export const resolvers: NonEmptyArray<any> = [
  LoginResolver,
  UserResolver,
  DownloadResolver,
  MediaResolver,
  DownloadableResolver,
]
