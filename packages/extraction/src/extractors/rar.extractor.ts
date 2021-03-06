import { Validator, Extractor } from './extractor'
import {Download} from '@fdl/downloader'
import {spawn} from 'child_process'
import {config} from '@fdl/config'
import { logger } from '@fdl/logger'


export default class RarExtractor extends Extractor {
  protected _deleteAfterDownload = true
  protected async start (downloads: Download[]): Promise<void> {
    let rarFile = downloads[0]
    if (downloads.length > 0) {
      rarFile = this.findFirstRar(downloads)
    }

    await new Promise(resolve => {
      const extraction = spawn(config.unrarBin, ['e', '-y', rarFile.filepath, this.finalpath])
      extraction.stdout.on('data', (buffer: Buffer) => {
        const data = buffer.toString()
        const match = data.match(/\d+%/g)
        const progress = match ? parseInt(match[0], 10) : 0
        if (progress > 0) {
          this.setProgress(progress)
        }
        logger.verbose(data)
      })

      extraction.stderr.on('data', (buffer: Buffer) => {
        const data = buffer.toString()
        logger.error(`Extraction error: ${data}`)
      })

      extraction.on('exit', () => {
        resolve()
      })
    })
  }

  findFirstRar (downloads: Download[]): Download {
    return downloads.find(d => d.filepath.endsWith('part1.rar')) || downloads[0]
  }

}

export const validator: Validator = (downloads) => !!downloads.find(download => /\.rar$/.test(download.filepath))
