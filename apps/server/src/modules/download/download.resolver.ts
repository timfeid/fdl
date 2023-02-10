import { Arg, Args, Mutation, Resolver } from 'type-graphql'
import { Service } from 'typedi'
import { BooleanResponse } from '../graphql/boolean-response.schema'
import { CreateDownloadArgs } from './download.schema'
import { DownloadService } from './download.service'

@Service()
@Resolver()
export class DownloadResolver {
  constructor(private readonly downloadService: DownloadService) {}

  @Mutation(() => BooleanResponse)
  startDownload(@Args() args: CreateDownloadArgs) {
    this.downloadService.startDownload(args)

    return {
      success: true,
    }
  }
}
