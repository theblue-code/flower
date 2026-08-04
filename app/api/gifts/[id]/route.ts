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

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { id } = params
  const gifts = await readStore()
  const gift = gifts.find((g: any) => g.id === id)
  if (!gift) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
  return NextResponse.json(gift)
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET,POST,OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } })
}

export async function POST(request: Request, { params }: { params: { id: string } }) {
  // Use POST to mark redeemed
  try {
    const { id } = params
    const body = await request.json()
    const redeemer = body?.redeemer || 'unknown'
    const gifts = await readStore()
    const idx = gifts.findIndex((g: any) => g.id === id)
    if (idx === -1) return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 })
    gifts[idx].redeemed = true
    gifts[idx].redeemedAt = new Date().toISOString()
    gifts[idx].redeemer = redeemer
    await writeStore(gifts)
    return NextResponse.json(gifts[idx])
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Bad request' }), { status: 400 })
  }
}
