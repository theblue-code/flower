import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id, amount } = body || {}

    // If STRIPE_SECRET_KEY is not set, return a mock checkout URL so the flow still works locally.
    const key = process.env.STRIPE_SECRET_KEY
    const sessionId = `mock_${Date.now()}`
    const successUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/gift/${id}?paid=true`
    const cancelUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3001'}/gift/${id}?canceled=true`

    if (!key) {
      return NextResponse.json({ checkoutUrl: `https://example.com/checkout/${sessionId}?id=${encodeURIComponent(id)}&amount=${encodeURIComponent(amount)}&success=${encodeURIComponent(successUrl)}` })
    }

    // Dynamically import stripe to avoid build-time errors when env not configured.
    const Stripe = (await import('stripe')).default
    const stripe = new Stripe(key, { apiVersion: '2022-11-15' })

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: { name: `Gift ${id}` },
            unit_amount: Math.round(Number(amount || 0) * 100),
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: { giftId: id },
    })

    return NextResponse.json({ checkoutUrl: session.url })
  } catch (e) {
    console.error('[/api/stripe/checkout] error', e)
    return new Response(JSON.stringify({ error: 'Checkout failed', details: String(e) }), { status: 500 })
  }
}
