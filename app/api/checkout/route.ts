import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id, amount } = body || {}
    const session = `mock_${Date.now()}`

    // In a real app, you'd call a payment provider here and return their checkout URL.
    const checkoutUrl = `https://example.com/checkout/${session}?id=${encodeURIComponent(id)}&amount=${encodeURIComponent(amount)}`

    return NextResponse.json({ checkoutUrl })
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Bad request' }), { status: 400 })
  }
}
