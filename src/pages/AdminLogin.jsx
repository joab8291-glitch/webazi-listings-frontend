import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, ApiError } from '../lib/api';
import { useAdminAuth } from '../context/AdminAuth';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAdminAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) return;

    setIsSubmitting(true);
    setError('');

    try {
      const { token } = await api.login(password);
      login(token);
      navigate('/admin');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Login failed. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-sm flex-col justify-center px-5 py-24">
      <h1 className="font-display text-2xl font-semibold text-ink">Admin login</h1>
      <p className="mt-2 text-sm text-inkSoft">Manage listings and photos.</p>

      <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
        <div>
          <label htmlFor="password" className="mb-1 block text-xs font-medium uppercase tracking-wide text-inkSoft">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            autoFocus
            className="w-full rounded-lg border border-ink/20 bg-white/60 px-4 py-3 text-ink outline-none focus:border-jade"
          />
        </div>

        {error && (
          <p role="alert" className="text-sm text-ochreDark">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting || !password}
          className="mt-2 rounded-full bg-jade px-6 py-3 text-sm font-medium text-paper transition hover:bg-jadeDark disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? 'Logging in…' : 'Log in'}
        </button>
      </form>
    </div>
  );
}
