import Parser from 'rss-parser'
import { Service } from 'typedi'
import { ExtractorFactory } from '../feed-extractors/extraction.factory'

@Service()
export class RssService {
  constructor(private readonly parser: Parser) {}

  async read(feedUrl: string) {
    const data = await this.parser.parseURL(feedUrl)

    const extractor = ExtractorFactory.getExtractor(feedUrl, data)

    await extractor.extract()
  }
}
