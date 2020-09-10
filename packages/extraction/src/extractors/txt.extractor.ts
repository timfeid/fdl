import { Validator, Extractor } from './extractor'
import Download from '@fdl/downloader'
import path from 'path'
import { copyOrRename } from '../utils'

export default class TxtExractor extends Extractor {

  protected async start (downloads: Download[]): Promise<void> {
    for (const download of downloads) {
      const filename = path.basename(download.filepath)
      copyOrRename(download.filepath, path.join(this.finalpath, filename))
    }
  }

}

export const validator: Validator = (downloads) => !!downloads.find(download => /\.txt$/.test(download.filepath))
