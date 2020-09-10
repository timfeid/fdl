import {InfoResponse} from '../../info/src/types/InfoResponse'
import { app } from "./app";
import {logger} from '@fdl/logger'
import { config } from '../../config/src';

export interface DownloadInfo extends InfoResponse {
  urls: string[]
}

app.listen(4242, '0.0.0.0', 0, () => {
  logger.verbose(`listening on port ${4242}`)
})
