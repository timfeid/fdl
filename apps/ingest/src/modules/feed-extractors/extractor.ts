import Parser from 'rss-parser'

export interface ExtractorTest {
  test: (url: string) => boolean
  class: new (
    data: {
      [key: string]: any
    } & Parser.Output<{
      [key: string]: any
    }>,
  ) => Extractor
}

export abstract class Extractor {
  constructor(
    protected readonly data: {
      [key: string]: any
    } & Parser.Output<{
      [key: string]: any
    }>,
  ) {}

  abstract extract(): Promise<void>
}
