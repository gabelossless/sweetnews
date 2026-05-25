export const config = {
  runtime: 'edge',
};

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
}

interface NotifyOrderBody {
  orderId: string;
  customerName: string;
  address: string;
  items: OrderItem[];
  total: number;
}

export default async function handler(request: Request) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Silently succeed — don't break checkout if email isn't configured yet
    return new Response('OK', { status: 200 });
  }

  let body: NotifyOrderBody;
  try {
    body = await request.json() as NotifyOrderBody;
  } catch {
    return new Response('Invalid body', { status: 400 });
  }

  const { orderId, customerName, address, items, total } = body;

  const itemRows = items
    .map(
      (i) =>
        `<tr>
          <td style="padding:6px 12px;border-bottom:1px solid #1a1a1a">${i.name}</td>
          <td style="padding:6px 12px;border-bottom:1px solid #1a1a1a;text-align:center">×${i.quantity}</td>
          <td style="padding:6px 12px;border-bottom:1px solid #1a1a1a;text-align:right">$${(i.price * i.quantity).toFixed(2)}</td>
        </tr>`
    )
    .join('');

  const timestamp = new Date().toLocaleString('en-US', {
    timeZone: 'America/Denver',
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:500px;margin:0 auto;background:#000;color:#fff;padding:32px;border-radius:20px;border:1px solid #1a1a1a">
      <div style="margin-bottom:24px">
        <h1 style="margin:0 0 4px;font-size:26px;font-weight:900;letter-spacing:-0.5px">🦉 New Order In</h1>
        <p style="margin:0;color:#666;font-size:12px;text-transform:uppercase;letter-spacing:2px">#${orderId.slice(-6).toUpperCase()} · ${timestamp} MT</p>
      </div>

      <div style="background:#0a0a0a;border-radius:12px;padding:16px;margin-bottom:20px;border:1px solid #1a1a1a">
        <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#666">Customer</p>
        <p style="margin:0;font-size:18px;font-weight:800">${customerName}</p>
        <p style="margin:4px 0 0;font-size:13px;color:#888">${address}</p>
      </div>

      <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:8px">
        <thead>
          <tr style="background:#111">
            <th style="padding:8px 12px;text-align:left;font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#555;font-weight:700">Item</th>
            <th style="padding:8px 12px;text-align:center;font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#555;font-weight:700">Qty</th>
            <th style="padding:8px 12px;text-align:right;font-size:10px;text-transform:uppercase;letter-spacing:2px;color:#555;font-weight:700">Price</th>
          </tr>
        </thead>
        <tbody>${itemRows}</tbody>
        <tfoot>
          <tr>
            <td colspan="2" style="padding:12px;font-weight:900;font-size:14px;text-transform:uppercase;letter-spacing:1px">Total</td>
            <td style="padding:12px;text-align:right;font-weight:900;font-size:18px;color:#e60023">$${total.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>

      <a href="https://sweetnews.shop/admin"
        style="display:block;margin-top:24px;padding:14px 24px;background:linear-gradient(135deg,#e60023,#ff2060);color:#fff;text-decoration:none;border-radius:50px;font-weight:900;font-size:12px;text-transform:uppercase;letter-spacing:2px;text-align:center">
        Open Dispatcher →
      </a>
    </div>
  `;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'orders@sweetnews.shop',
      to: 'sweetnewsowl@gmail.com',
      subject: `🦉 New Order — ${customerName} · $${total.toFixed(2)}`,
      html,
    }),
  });

  return new Response('OK', { status: 200 });
}
