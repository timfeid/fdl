import { Extractor, ExtractorTest } from '../extractor'
import { spawn } from 'child_process'

class RarExtractor extends Extractor {
  get firstRar() {
    return (
      this.files.find(file => file.endsWith('part1.rar')) ||
      this.files.find(file => file.endsWith('.rar'))
    )
  }

  protected async start(): Promise<void> {
    await new Promise(resolve => {
      const extraction = spawn(this.configService.unrarBin, [
        'e',
        '-y',
        this.firstRar,
        this.directory,
      ])

      extraction.stdout.on('data', (buffer: Buffer) => {
        const data = buffer.toString()
        const match = data.match(/\d+%/g)
        const progress = match ? parseInt(match[0], 10) : 0
        if (progress > 0) {
          this.setProgress(progress)
        }
        // console.log(data)
      })

      extraction.stderr.on('data', (buffer: Buffer) => {
        const data = buffer.toString()
        console.error(`Extraction error: ${data}`)
      })

      extraction.on('exit', () => {
        resolve(true)
      })
    })
  }
}

export const rarExtractor: ExtractorTest = {
  class: RarExtractor,
  test: files => !!files.find(file => /\.rar$/.test(file)),
}
