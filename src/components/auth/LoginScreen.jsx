import { useState } from 'react'
import { authService } from '../../services/authService.js'

export function LoginScreen({ onSuccess }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await authService.signIn(email, password)
      onSuccess(user)
    } catch (err) {
      setError('Login failed. Check your email and password, or ask an admin to check your account in Firebase.')
    } finally {
      setLoading(false)
    }
  }

  if (!authService.isAvailable()) {
    return (
      <div className="max-w-md mx-auto mt-16 bg-card border border-line rounded-xl shadow-card p-6 text-center">
        <p className="text-sm text-muted">
          Firebase isn't connected yet, so importing orders isn't available. Connect Firebase first (see README), then come back here.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto mt-16 bg-card border border-line rounded-xl shadow-card p-6">
      <h2 className="text-base font-semibold text-ink mb-1">Staff Login</h2>
      <p className="text-xs text-muted mb-5">Sign in to import order data. Accounts are created in Firebase Console by an admin.</p>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-xs font-medium text-muted uppercase tracking-wide">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full text-sm border border-line rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-500"
            placeholder="you@mamariam.com"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted uppercase tracking-wide">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full text-sm border border-line rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-brand-100 focus:border-brand-500"
            placeholder="••••••••"
          />
        </div>
        {error && <p className="text-xs text-clay">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium rounded-lg py-2.5 transition-colors disabled:opacity-60"
        >
          {loading ? 'Signing in…' : 'Sign In'}
        </button>
      </form>
    </div>
  )
}
