import { Validator, Extractor } from "./extractor";
import Download from "@fdl/downloader";
import { DownloadInfo } from "@fdl/server";
import finalpath from "../finalpath";
const spawn = require('child_process').spawn;
import {config} from '@fdl/config'


export default class RarExtractor extends Extractor {
  protected async start (downloads: Download[]) {
    let rarFile = downloads[0]
    if (downloads.length > 0) {
      rarFile = this.findFirstRar(downloads)
    }

    await new Promise(resolve => {
      const extraction = spawn(config.unrarBin, ['e', '-y', rarFile.filepath, this.finalpath])
      extraction.stdout.on('data', (d: Buffer) => {
        let match = d.toString().match(/\d+%/g)
        let progress = match ? parseInt(match[0], 10) : 0
        if (progress > 0) {
          // console.log(progress)
        }
      })

      extraction.on('exit', () => {
        resolve()
      })
    })
  }

  findFirstRar (downloads: Download[]) {
    return downloads.find(d => d.filepath.endsWith('part1.rar')) || downloads[0]
  }

}

export const validator: Validator = (downloads) => !!downloads.find(download => /\.rar$/.test(download.filepath))
