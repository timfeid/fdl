import Rapidgator from "../../src/site/rapidgator"
import { createAxiosMock, expireDate, responseUrl } from "../mock"

describe('site', () => {
  let mock = createAxiosMock()

  afterAll(() => {
    mock.restore()
  })

  it('should NOT reauthenticate when SID is in good condition', async () => {
    const rapidgator = new Rapidgator()
    rapidgator.sid = {
      expire_date: (new Date().getTime() / 1000)+100,
      session_id: '',
      traffic_left: '',
    }
    const refreshSid = jest.spyOn(rapidgator, 'refreshSid')

    const transformedUrl = await rapidgator.transformUrl('https://rapidgator.net/file/20c0a07084b0b232d39b33d722ccd5b7/NISHwiiS0E1370HDTx24SNOY.rar')

    expect(refreshSid).not.toBeCalled()
    expect(transformedUrl).toBe(responseUrl)
  })

  it('should reauthenticate when SID is expired', async () => {
    const rapidgator = new Rapidgator()
    rapidgator.sid = {
      expire_date: (new Date().getTime() / 1000)-1,
      session_id: '',
      traffic_left: '',
    }
    const refreshSid = jest.spyOn(rapidgator, 'refreshSid')

    const transformedUrl = await rapidgator.transformUrl('https://rapidgator.net/file/20c0a07084b0b232d39b33d722ccd5b7/NISHwiiS0E1370HDTx24SNOY.rar')

    expect(refreshSid).toBeCalled()
    expect(rapidgator.sid.expire_date).toBe(expireDate)
    expect(transformedUrl).toBe(responseUrl)
  })

  it('transform url should log us in and return new url endpoint', async () => {
    const rapidgator = new Rapidgator()

    const authenticate = jest.spyOn(rapidgator, 'authenticate')

    const transformedUrl = await rapidgator.transformUrl('https://rapidgator.net/file/20c0a07084b0b232d39b33d722ccd5b7/NISHwiiS0E1370HDTx24SNOY.rar')

    expect(authenticate).toBeCalled()
    expect(rapidgator.sid.expire_date).toBe(expireDate)
    expect(transformedUrl).toBe(responseUrl)

    authenticate.mockRestore()
  })
})
