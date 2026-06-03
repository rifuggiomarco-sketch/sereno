import React, { useState } from 'react'
import { supabase } from '../supabase'
import { Leaf, Mail, Lock, AlertCircle, ArrowRight, Check, Eye, EyeOff } from 'lucide-react'

const T = {
  cream: '#f4efe6',
  green: '#2d4a3e',
  earth: '#d4c5a9',
  terra: '#c97b5c',
  ink: '#2d3a2e',
  muted: '#7a7a5e',
}

export default function Auth({ onAuthSuccess }) {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showPw, setShowPw] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        if (data?.session) onAuthSuccess(data.session)
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        if (data?.session) {
          onAuthSuccess(data.session)
        } else {
          setError('Controlla la tua email per confermare la registrazione.')
        }
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="absolute inset-0 flex flex-col px-6 pb-8 pt-16"
      style={{ background: T.cream, fontFamily: 'sans-serif' }}>
      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full">
        <div className="text-center mb-8">
          <div className="relative w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full"
              style={{ background: 'radial-gradient(circle,rgba(45,74,62,.12),transparent 70%)' }} />
            <Leaf size={32} style={{ color: T.green }} strokeWidth={1.2} />
          </div>
          <h1 className="fd text-3xl tracking-tight" style={{ color: T.ink }}>
            {mode === 'login' ? 'Bentornato' : 'Benvenuto'}
          </h1>
          <p className="text-sm mt-2" style={{ color: T.muted }}>
            {mode === 'login' ? 'Accedi al tuo giardino' : 'Crea il tuo giardino'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5 text-xs font-medium" style={{ color: T.ink }}>
              <Mail size={13} />
              Email
            </div>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              placeholder="nome@email.com" required autoFocus
              className="w-full rounded-2xl px-4 py-3.5 text-sm outline-none border-2"
              style={{ background: 'white', borderColor: email ? T.green : 'rgba(45,58,46,.1)', color: T.ink, fontFamily: 'inherit' }} />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1.5 text-xs font-medium" style={{ color: T.ink }}>
              <Lock size={13} />
              Password
            </div>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={mode === 'login' ? 'La tua password' : 'Minimo 6 caratteri'} required minLength={6}
                className="w-full rounded-2xl px-4 py-3.5 text-sm outline-none border-2 pr-10"
                style={{ background: 'white', borderColor: password ? T.green : 'rgba(45,58,46,.1)', color: T.ink, fontFamily: 'inherit' }} />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: T.muted }}>
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl p-3 text-xs"
              style={{ background: 'rgba(201,123,92,.1)', color: T.terra }}>
              <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
              <span>{error}</span>
            </div>
          )}

          <button type="submit" disabled={loading || !email || !password}
            className="w-full rounded-2xl py-3.5 text-sm font-medium flex items-center justify-center gap-2"
            style={{
              background: loading || !email || !password ? 'rgba(45,58,46,.18)' : T.green,
              color: loading || !email || !password ? 'rgba(45,58,46,.35)' : T.cream
            }}>
            {loading ? (
              <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity=".25" />
                <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
              </svg>
            ) : (
              <>
                {mode === 'login' ? 'Accedi' : 'Registrati'} <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null) }}
            className="text-xs underline underline-offset-4" style={{ color: T.muted }}>
            {mode === 'login' ? 'Non hai un account? Registrati' : 'Hai già un account? Accedi'}
          </button>
        </div>
      </div>
    </div>
  )
}
