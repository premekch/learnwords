import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { login } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: login,
    onSuccess: ({ token, user }) => {
      setAuth(user, token);
      navigate('/dashboard');
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Chyba přihlášení'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({ email, password });
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">LW</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--gray-900)' }}>LearnWords</div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--gray-500)' }}>Učení slovíček</div>
          </div>
        </div>

        <h2 style={{ marginBottom: 6 }}>Přihlásit se</h2>
        <p style={{ marginBottom: 24 }}>Vítejte zpět!</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">E-mail</label>
            <input
              className="form-input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="vas@email.cz"
              autoComplete="email"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Heslo</label>
            <input
              className="form-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg btn-full"
            style={{ marginTop: 4 }}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Přihlašuji...' : 'Přihlásit se'}
          </button>
        </form>

        <div className="divider" />

        <p className="text-center text-sm" style={{ color: 'var(--gray-600)' }}>
          Nemáte účet?{' '}
          <Link to="/register" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
            Zaregistrovat se
          </Link>
        </p>
      </div>
    </div>
  );
}
