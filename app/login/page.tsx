'use client'

import { useState } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/login`,
          },
        })

        if (error) throw error

        setMessage(
          data.session
            ? 'Account created! You are now signed in.'
            : 'Account created. Check your email for a confirmation link, then sign in.'
        )
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        window.location.href = '/'
      }
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : 'Something went wrong.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 px-5 py-12 text-slate-100">
      <div className="mx-auto max-w-md">
        <Link href="/" className="text-sm text-cyan-400 hover:text-cyan-300">
          ← Back to CyberLearn
        </Link>

        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-7 shadow-xl">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-400/10 text-2xl">
              🛡️
            </div>
            <h1 className="text-2xl font-bold">Welcome to CyberLearn</h1>
            <p className="mt-2 text-sm text-slate-400">
              Create an account to start tracking your learning.
            </p>
          </div>

          <div className="mb-6 grid grid-cols-2 rounded-lg bg-slate-800 p-1">
            <button
              type="button"
              onClick={() => {
                setMode('signup')
                setMessage('')
              }}
              className={`rounded-md px-3 py-2 text-sm font-medium ${
                mode === 'signup'
                  ? 'bg-cyan-400 text-slate-950'
                  : 'text-slate-300'
              }`}
            >
              Create account
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('login')
                setMessage('')
              }}
              className={`rounded-md px-3 py-2 text-sm font-medium ${
                mode === 'login'
                  ? 'bg-cyan-400 text-slate-950'
                  : 'text-slate-300'
              }`}
            >
              Sign in
            </button>
          </div>

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

            <div>
              <label htmlFor="password" className="mb-1 block text-sm text-slate-300">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                minLength={6}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-3 outline-none focus:border-cyan-400"
                placeholder="At least 6 characters"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-cyan-400 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:opacity-60"
            >
              {loading
                ? 'Please wait…'
                : mode === 'signup'
                  ? 'Create free account'
                  : 'Sign in'}
            </button>
          </form>

          {message && (
            <p
              role="status"
              className="mt-4 break-words rounded-lg border border-slate-700 bg-slate-950 p-3 text-sm text-slate-300"
            >
              {message}
            </p>
          )}

          <p className="mt-6 text-center text-xs text-slate-500">
            Your learning progress will be saved to your account.
          </p>
        </div>
      </div>
    </main>
  )
}
