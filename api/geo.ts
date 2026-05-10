export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  const city = request.headers.get('x-vercel-ip-city') || 'Denver';
  const region = request.headers.get('x-vercel-ip-country-region') || 'CO';
  const country = request.headers.get('x-vercel-ip-country') || 'US';
  const latitude = request.headers.get('x-vercel-ip-latitude') || '39.7392';
  const longitude = request.headers.get('x-vercel-ip-longitude') || '-104.9903';
  const timezone = request.headers.get('x-vercel-ip-timezone') || 'America/Denver';

  return new Response(
    JSON.stringify({
      city,
      region,
      country,
      latitude,
      longitude,
      timezone,
    }),
    {
      status: 200,
      headers: {
        'content-type': 'application/json',
        'cache-control': 'public, max-age=0, s-maxage=3600',
      },
    }
  );
}
