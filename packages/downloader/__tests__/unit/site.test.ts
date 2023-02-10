import { findWebsite } from "../../src/site"

describe('site', () => {

  it('gets rapidgator', () => {
    const site: any = findWebsite('https://rapidgator.net/file/20c0a07084b0b232d39b33d722ccd5b7/NISHwiiS0E1370HDTx24SNOY.rar')

    expect(site.username).toBe(process.env.RAPIDGATOR_USERNAME)
    expect(site.password).toBe(process.env.RAPIDGATOR_PASSWORD)
  })

  it('gets default', () => {
    const site: any = findWebsite('https://google.com')

    expect(site.username).toBeUndefined()
  })
})
