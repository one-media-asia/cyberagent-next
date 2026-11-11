'use client'

import { useState } from 'react'
import Link from 'next/link'
import { djangoConfirmPasswordReset } from '@/lib/django'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setMessage('')

    if (password !== confirmPassword) {
      setMessage('The passwords do not match.')
      return
    }

    const params = new URLSearchParams(window.location.search)
    const uid = params.get('uid')
    const token = params.get('token')

    if (!uid || !token) {
      setMessage('This password-reset link is incomplete. Please request a new one.')
      return
    }

    setLoading(true)
    try {
      const result = await djangoConfirmPasswordReset(uid, token, password)
      setSuccess(true)
      setMessage(result.message)
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Unable to update your password. Please request a new reset link.')
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
          <h1 className="text-2xl font-bold">Choose a new password</h1>
          <p className="mt-2 mb-6 text-sm text-slate-400">
            Enter your new password below.
          </p>
          {success ? (
            <div>
              <p role="status" className="break-words rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-slate-300">
                {message}
              </p>
              <Link href="/login" className="mt-4 inline-block font-semibold text-cyan-400 hover:text-cyan-300">
                Go to sign in
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="mb-1 block text-sm text-slate-300">
                  New password
                </label>
                <input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 outline-none focus:border-cyan-400"
                  placeholder="Enter a new password"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="mb-1 block text-sm text-slate-300">
                  Confirm new password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 outline-none focus:border-cyan-400"
                  placeholder="Repeat your new password"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-60"
              >
                {loading ? 'Updating…' : 'Update password'}
              </button>
              {message && (
                <p role="status" className="break-words rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-slate-300">
                  {message}
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </main>
  )
}
