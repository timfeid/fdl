import {Download} from '@fdl/downloader'
import {findExtractor} from './extractors'
import { Extractor } from './extractors/extractor'

export async function extract (extractor: Extractor, downloads: Download[]): Promise<void> {
  // const extractor = findExtractor(info)
  return extractor.extract(downloads)
}

export {Extractor, findExtractor}
