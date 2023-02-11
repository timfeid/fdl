import { ExtractorTest } from './extractor'
import { hdeExtractor } from './extractors/hde.extractor'
import Parser from 'rss-parser'

const extractors: ExtractorTest[] = [hdeExtractor]

export class ExtractorFactory {
  static getExtractor(
    url: string,
    data: {
      [key: string]: any
    } & Parser.Output<{
      [key: string]: any
    }>,
  ) {
    for (const extractor of extractors) {
      if (extractor.test(url)) {
        return new extractor.class(data)
      }
    }
  }
}
