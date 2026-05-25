export const config = {
  runtime: 'edge',
};

interface ServiceAccount {
  client_email: string;
  private_key: string;
  project_id: string;
}

interface PushBody {
  token: string;
  title: string;
  body: string;
  url?: string;
}

function base64url(obj: object): string {
  return btoa(JSON.stringify(obj))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function bufferToBase64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

async function getGoogleAccessToken(sa: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url({ alg: 'RS256', typ: 'JWT' });
  const payload = base64url({
    iss: sa.client_email,
    scope: 'https://www.googleapis.com/auth/firebase.messaging',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  });

  const signingInput = `${header}.${payload}`;

  const pemContent = sa.private_key
    .replace(/-----BEGIN PRIVATE KEY-----/g, '')
    .replace(/-----END PRIVATE KEY-----/g, '')
    .replace(/\n/g, '');
  const keyBytes = Uint8Array.from(atob(pemContent), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    keyBytes,
    { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const sigBuffer = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    new TextEncoder().encode(signingInput)
  );

  const jwt = `${signingInput}.${bufferToBase64url(sigBuffer)}`;

  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=${jwt}`,
  });

  const tokenData = await tokenRes.json() as { access_token: string };
  return tokenData.access_token;
}

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const saJsonB64 = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!saJsonB64) {
    // Silently succeed — don't break driver flow if push isn't configured
    return new Response('OK', { status: 200 });
  }

  let pushBody: PushBody;
  try {
    pushBody = await request.json() as PushBody;
  } catch {
    return new Response('Invalid body', { status: 400 });
  }

  const { token, title, body, url } = pushBody;
  if (!token || !title || !body) {
    return new Response('Missing required fields', { status: 400 });
  }

  try {
    const sa = JSON.parse(atob(saJsonB64)) as ServiceAccount;
    const accessToken = await getGoogleAccessToken(sa);

    const fcmRes = await fetch(
      `https://fcm.googleapis.com/v1/projects/${sa.project_id}/messages:send`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: {
            token,
            notification: { title, body },
            webpush: url ? { fcm_options: { link: url } } : undefined,
          },
        }),
      }
    );

    if (!fcmRes.ok) {
      const err = await fcmRes.text();
      console.error('FCM send error:', err);
    }
  } catch (err) {
    console.error('push-notify error:', err);
  }

  return new Response('OK', { status: 200 });
}
