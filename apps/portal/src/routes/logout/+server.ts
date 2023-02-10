import type { RequestHandler } from './$types';

export const GET: RequestHandler = ({ cookies }) => {
  cookies.delete('koa.sess')
  cookies.delete('koa.sess.sig')

  return new Response(null, {status: 307, headers: { Location: '/' }})
}
