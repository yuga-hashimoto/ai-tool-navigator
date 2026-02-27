import { NextResponse } from 'next/server';

export const setApiCompressionHeaders = (response: NextResponse) => {
  response.headers.set('Content-Encoding', 'gzip');
  response.headers.set('Vary', 'Accept-Encoding');
  return response;
};
