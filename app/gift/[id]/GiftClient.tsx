"use client"

import React, { useEffect, useState } from 'react'
import QRCode from 'qrcode'

type Props = { id: string }

export default function GiftClient({ id }: Props) {
    const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const [gift, setGift] = useState<any | null>(null)

    useEffect(() => {
        const load = async () => {
            try {
                const res = await fetch(`/api/gifts/${id}`)
                if (!res.ok) return
                const data = await res.json()
                setGift(data)
            } catch (e) {
                console.error('Failed to load gift', e)
            }
        }
        load()
    }, [id])

    useEffect(() => {
        const generate = async () => {
            try {
                if (!gift) return
                const payload = JSON.stringify({ type: 'gift', id: gift.id, amount: gift.amount })
                const url = await QRCode.toDataURL(payload)
                setQrDataUrl(url)
            } catch (e) {
                console.error('QR generation failed', e)
            }
        }
        generate()
    }, [gift])

    const startCheckout = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: gift?.id ?? id, amount: gift?.amount ?? 0 }),
            })
            const data = await res.json()
            if (data?.checkoutUrl) window.location.href = data.checkoutUrl
            else alert('Failed to start checkout')
        } catch (e) {
            console.error(e)
            alert('Checkout error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-pink-50 to-white">
            <div className="max-w-4xl w-full bg-white rounded-2xl shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-2">
                <div className="p-8 flex flex-col gap-4">
                    {gift ? (
                        <>
                            <img src={gift.image || '/placeholder.svg'} alt="gift" className="w-full h-56 object-cover rounded-lg bg-gray-100" />
                            <h2 className="text-2xl font-semibold">For {gift.recipient}</h2>
                            <p className="text-gray-600">{gift.message}</p>
                            <div className="mt-4">
                                <div className="text-sm text-gray-500">From</div>
                                <div className="font-medium">{gift.sender}</div>
                            </div>
                        </>
                    ) : (
                        <div>Loading gift…</div>
                    )}
                </div>

                <div className="p-8 border-l">
                    <div className="flex flex-col items-center gap-4">
                        <div className="text-sm text-gray-500">Amount</div>
                        <div className="text-3xl font-bold">${gift?.amount ?? '—'}</div>

                        {qrDataUrl ? (
                            <img src={qrDataUrl} alt="QR code" className="w-48 h-48 bg-white p-2 rounded-lg" />
                        ) : (
                            <div className="w-48 h-48 flex items-center justify-center bg-gray-100 rounded-lg">Generating QR…</div>
                        )}

                        <div className="flex gap-3 mt-2">
                            {qrDataUrl && (
                                <a href={qrDataUrl} download={`gift-${gift?.id ?? id}.png`} className="px-4 py-2 bg-gray-100 rounded">Download QR</a>
                            )}
                            <button onClick={startCheckout} disabled={loading} className="px-4 py-2 bg-pink-600 text-white rounded">
                                {loading ? 'Processing…' : 'Send Gift / Pay'}
                            </button>
                        </div>

                        <div className="text-xs text-gray-400 mt-4">Share this QR with the recipient to redeem the gift.</div>
                    </div>
                </div>
            </div>
        </div>
    )
}
