export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'content-type': 'application/json' },
    });
  }

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    return new Response(JSON.stringify({ error: 'Payment service not configured' }), {
      status: 500,
      headers: { 'content-type': 'application/json' },
    });
  }

  let amount: number;
  let customerUid = '';
  let customerEmail = '';
  try {
    const body = await request.json() as { amount: unknown; customerUid?: unknown; customerEmail?: unknown };
    if (typeof body.amount !== 'number') throw new Error('amount must be a number');
    amount = Math.round(body.amount);
    if (!Number.isInteger(amount) || amount < 50) throw new Error('invalid amount');
    if (typeof body.customerUid === 'string') customerUid = body.customerUid;
    if (typeof body.customerEmail === 'string') customerEmail = body.customerEmail;
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }

  const params = new URLSearchParams();
  params.set('amount', String(amount));
  params.set('currency', 'usd');
  params.append('payment_method_types[]', 'card');
  if (customerUid) params.set('metadata[customerUid]', customerUid);
  if (customerEmail) params.set('metadata[customerEmail]', customerEmail);

  const stripeRes = await fetch('https://api.stripe.com/v1/payment_intents', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  const data = await stripeRes.json() as { client_secret?: string; error?: { message: string } };

  if (!stripeRes.ok) {
    return new Response(
      JSON.stringify({ error: data.error?.message ?? 'Payment service error' }),
      { status: 400, headers: { 'content-type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ clientSecret: data.client_secret }),
    { status: 200, headers: { 'content-type': 'application/json' } }
  );
}
