"use client"

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CreateClient() {
    const router = useRouter()
    const [recipient, setRecipient] = useState('')
    const [sender, setSender] = useState('')
    const [amount, setAmount] = useState(10)
    const [message, setMessage] = useState('')
    const [loading, setLoading] = useState(false)

    const submit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await fetch('/api/gifts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ recipient, sender, amount, message }),
            })
            const text = await res.text()
            let data = null
            try { data = text ? JSON.parse(text) : null } catch (err) { /* ignore */ }
            if (res.ok && data?.id) {
                router.push(`/gift/${data.id}`)
                return
            }
            console.error('Create gift failed', res.status, text, data)
            alert(`Create failed: ${res.status} ${text}`)
        } catch (e) {
            console.error(e)
            alert('Error creating gift')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-pink-50 to-white">
            <form onSubmit={submit} className="w-full max-w-xl bg-white rounded-xl p-8 shadow">
                <h2 className="text-xl font-semibold mb-4">Create a Gift</h2>
                <div className="grid grid-cols-1 gap-3">
                    <input value={recipient} onChange={e => setRecipient(e.target.value)} placeholder="Recipient" className="input" />
                    <input value={sender} onChange={e => setSender(e.target.value)} placeholder="Sender" className="input" />
                    <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} placeholder="Amount" className="input" />
                    <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Message" className="input h-24" />
                    <div className="flex justify-end">
                        <button type="submit" disabled={loading} className="px-4 py-2 bg-pink-600 text-white rounded">
                            {loading ? 'Creating…' : 'Create Gift'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    )
}
