import MockAdapter from 'axios-mock-adapter'
import axios from 'axios'

export const expireDate = Math.round(new Date().getTime() / 1000) + 1000
export const responseUrl =
  'https://s58.rapidgator.net/download/7a076a3d-82eb-4595-9a9e-05bd9f3ccbf6'

const rapidgatorLoginResponse = {
  response: {
    session_id: 'qkc4ajhv1fp5t558rgeu3u5sci',
    expire_date: expireDate,
    traffic_left: '10305237961101',
  },
  response_status: 200,
  response_details: null,
}

const rapidgatorUrlResponse = {
  response: {
    url: responseUrl,
  },
  response_status: 200,
  response_details: null,
}

export const createAxiosMock = () =>
  new MockAdapter(axios)
    .onGet(/rapidgator\.net\/api\/user\/login/)
    .reply(200, JSON.stringify(rapidgatorLoginResponse))
    .onGet(/rapidgator\.net\/api\/file\/download/)
    .reply(200, JSON.stringify(rapidgatorUrlResponse))
