export const config = { runtime: 'edge' };

const customerManifest = {
  name: 'Sweet News',
  short_name: 'Sweet News',
  description: 'Premium midnight snack delivery.',
  start_url: '/',
  display: 'standalone',
  orientation: 'portrait-primary',
  background_color: '#0f0a08',
  theme_color: '#0f0a08',
  icons: [
    { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
    { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
  ],
  categories: ['food', 'shopping'],
  shortcuts: [
    { name: 'Shop Now', url: '/', description: 'Browse midnight drops' },
    { name: 'My Orders', url: '/?tab=orders', description: 'Track your deliveries' },
  ],
};

const fleetManifest = {
  name: 'Sweet News Fleet',
  short_name: 'SN Fleet',
  description: 'Sweet News delivery driver portal.',
  start_url: '/',
  scope: '/',
  display: 'standalone',
  orientation: 'portrait-primary',
  background_color: '#0f0a08',
  theme_color: '#0f0a08',
  icons: [
    { src: '/fleet-icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
    { src: '/fleet-icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'maskable' },
  ],
  categories: ['productivity'],
  shortcuts: [
    { name: 'My Deliveries', url: '/', description: 'View active delivery assignments' },
  ],
};

export default function handler(request: Request) {
  const host = request.headers.get('host') ?? '';
  const manifest = host.startsWith('fleet.') ? fleetManifest : customerManifest;
  return new Response(JSON.stringify(manifest), {
    headers: {
      'Content-Type': 'application/manifest+json',
      'Cache-Control': 'no-cache',
    },
  });
}
