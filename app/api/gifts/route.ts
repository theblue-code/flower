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

export async function GET() {
  const gifts = await readStore()
  return NextResponse.json(gifts)
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } })
}

export async function POST(request: Request) {
  try {
    console.log('[/api/gifts] incoming request')
    const text = await request.text()
    console.log('[/api/gifts] raw body:', text)
    const body = text ? JSON.parse(text) : {}
    const { recipient, sender, amount, message, image } = body || {}
    const gifts = await readStore()
    const id = `g_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`
    const gift = { id, recipient, sender, amount: Number(amount) || 0, message, image, createdAt: new Date().toISOString(), redeemed: false }
    gifts.push(gift)
    await writeStore(gifts)
    return NextResponse.json(gift)
  } catch (e) {
    console.error('[/api/gifts] error', e)
    return new Response(JSON.stringify({ error: 'Bad request', details: String(e) }), { status: 400 })
  }
}
