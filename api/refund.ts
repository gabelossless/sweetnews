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

  let paymentIntentId: string;
  try {
    const body = await request.json() as { paymentIntentId?: unknown };
    if (typeof body.paymentIntentId !== 'string' || !body.paymentIntentId.startsWith('pi_')) {
      throw new Error('invalid paymentIntentId');
    }
    paymentIntentId = body.paymentIntentId;
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'content-type': 'application/json' },
    });
  }

  // Fetch the PaymentIntent to get the latest charge ID
  const piRes = await fetch(`https://api.stripe.com/v1/payment_intents/${paymentIntentId}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  });
  const piData = await piRes.json() as { latest_charge?: string; error?: { message: string } };

  if (!piRes.ok || !piData.latest_charge) {
    return new Response(
      JSON.stringify({ error: piData.error?.message ?? 'Could not find payment record' }),
      { status: 400, headers: { 'content-type': 'application/json' } }
    );
  }

  // Issue full refund against the charge
  const refundParams = new URLSearchParams();
  refundParams.set('charge', piData.latest_charge);
  refundParams.set('reason', 'requested_by_customer');

  const refundRes = await fetch('https://api.stripe.com/v1/refunds', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: refundParams.toString(),
  });

  const refundData = await refundRes.json() as { id?: string; status?: string; error?: { message: string } };

  if (!refundRes.ok) {
    return new Response(
      JSON.stringify({ error: refundData.error?.message ?? 'Refund failed' }),
      { status: 400, headers: { 'content-type': 'application/json' } }
    );
  }

  return new Response(
    JSON.stringify({ refundId: refundData.id, status: refundData.status }),
    { status: 200, headers: { 'content-type': 'application/json' } }
  );
}
