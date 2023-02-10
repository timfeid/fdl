export abstract class Site {
  abstract match (url: string): boolean

  async transformUrl (url: string) {
    return url
  }
}
