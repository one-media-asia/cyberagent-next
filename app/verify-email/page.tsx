'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { djangoVerifyEmail } from '@/lib/django'

export default function VerifyEmailPage() {
  const [message, setMessage] = useState('Verifying your email address…')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function verify() {
      const params = new URLSearchParams(window.location.search)
      const uid = params.get('uid')
      const token = params.get('token')

      if (!uid || !token) {
        setMessage('This verification link is incomplete. Please check the email and try again.')
        return
      }

      try {
        const result = await djangoVerifyEmail(uid, token)
        if (!cancelled) {
          setSuccess(true)
          setMessage(result.message)
        }
      } catch (error) {
        if (!cancelled) {
          setMessage(error instanceof Error ? error.message : 'Unable to verify this email address.')
        }
      }
    }

    void verify()
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-12 text-slate-100">
      <div className="mx-auto max-w-md">
        <Link href="/" className="text-sm text-cyan-400 hover:text-cyan-300">
          ← Back to CyberLearn
        </Link>
        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-7 text-center shadow-xl">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-400/10 text-2xl">
            🛡️
          </div>
          <h1 className="text-2xl font-bold">Email verification</h1>
          <p role="status" className="mt-4 break-words rounded-lg border border-slate-700 bg-slate-950 p-4 text-sm text-slate-300">
            {message}
          </p>
          {success && (
            <Link
              href="/login"
              className="mt-5 inline-block rounded-lg bg-cyan-400 px-5 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300"
            >
              Continue to sign in
            </Link>
          )}
        </div>
      </div>
    </main>
  )
}
