'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) throw error
      setMessage('If an account exists for that email, a password reset link has been sent. Please check your inbox.')
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to send the reset email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-12 text-slate-100">
      <div className="mx-auto max-w-md">
        <Link href="/login" className="text-sm text-cyan-400 hover:text-cyan-300">
          ← Back to sign in
        </Link>
        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-7 shadow-xl">
          <h1 className="text-2xl font-bold">Reset your password</h1>
          <p className="mt-2 mb-6 text-sm text-slate-400">
            Enter the email address linked to your CyberLearn account and we’ll send you a reset link.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1 block text-sm text-slate-300">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 outline-none focus:border-cyan-400"
                placeholder="you@example.com"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-60"
            >
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
          {message && (
            <p role="status" className="mt-4 break-words rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-slate-300">
              {message}
            </p>
          )}
        </div>
      </div>
    </main>
  )
}
