import { Arg, Args, Mutation, Resolver } from 'type-graphql'
import { Service } from 'typedi'
import { BooleanResponse } from '../graphql/boolean-response.schema'
import { CreateDownloadableArgs } from './downloadable.schema'
import { DownloadableService } from './downloadable.service'

@Service()
@Resolver()
export class DownloadableResolver {
  constructor(private readonly downloadableService: DownloadableService) {}

  @Mutation(() => BooleanResponse)
  async createDownloadable(@Args() args: CreateDownloadableArgs) {
    await this.downloadableService.addDownloadable(args)

    return {
      success: true,
    }
  }
}
