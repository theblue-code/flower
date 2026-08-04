import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

const DATA_FILE = path.join(process.cwd(), 'data', 'gifts.json')

async function readStore() {
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf-8')
    return JSON.parse(raw || '[]')
  } catch (e) {
    return []
  }
}

async function writeStore(data: any) {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true })
  await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8')
}

async function markRedeemed(giftId: string, meta: any = {}) {
  const gifts = await readStore()
  const idx = gifts.findIndex((g: any) => g.id === giftId)
  if (idx === -1) return null
  gifts[idx].redeemed = true
  gifts[idx].redeemedAt = new Date().toISOString()
  gifts[idx].payment = meta
  await writeStore(gifts)
  return gifts[idx]
}

export async function POST(request: Request) {
  try {
    const text = await request.text()
    const sig = request.headers.get('stripe-signature') || ''
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

    // If webhook secret is configured, verify signature using Stripe SDK
    if (webhookSecret && process.env.STRIPE_SECRET_KEY) {
      const Stripe = (await import('stripe')).default
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: '2022-11-15' })
      let event: any
      try {
        event = stripe.webhooks.constructEvent(text, sig, webhookSecret)
      } catch (err) {
        console.error('[/api/stripe/webhook] signature verification failed', err)
        return new Response(JSON.stringify({ error: 'Invalid signature' }), { status: 400 })
      }

      if (event.type === 'checkout.session.completed') {
        const session = event.data.object
        const giftId = session?.metadata?.giftId
        if (giftId) {
          const updated = await markRedeemed(giftId, { sessionId: session.id, paid: session.payment_status })
          return NextResponse.json({ received: true, updated })
        }
      }
      return NextResponse.json({ received: true })
    }

    // No webhook secret configured — accept a simulated event body for local dev
    let evt = {} as any
    try { evt = text ? JSON.parse(text) : {} } catch (e) { evt = {} }
    if (evt.type === 'checkout.session.completed') {
      const session = evt.data?.object || {}
      const giftId = session?.metadata?.giftId
      if (giftId) {
        const updated = await markRedeemed(giftId, { sessionId: session.id || 'mock', paid: session.payment_status || 'paid' })
        return NextResponse.json({ received: true, updated })
      }
    }

    return NextResponse.json({ received: true })
  } catch (e) {
    console.error('[/api/stripe/webhook] error', e)
    return new Response(JSON.stringify({ error: 'Webhook handler error', details: String(e) }), { status: 500 })
  }
}
