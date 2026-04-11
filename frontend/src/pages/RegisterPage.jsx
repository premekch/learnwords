import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { register } from '../api/auth';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [errors, setErrors]     = useState([]);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: register,
    onSuccess: ({ token, user }) => {
      setAuth(user, token);
      toast.success('Účet vytvořen!');
      navigate('/dashboard');
    },
    onError: (e) => {
      const err = e.response?.data;
      if (err?.details) setErrors(err.details);
      else toast.error(err?.error || 'Chyba registrace');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors([]);
    if (password !== confirm) {
      setErrors(['Hesla se neshodují']);
      return;
    }
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

        <h2 style={{ marginBottom: 6 }}>Vytvořit účet</h2>
        <p style={{ marginBottom: 24 }}>Začněte se učit zdarma</p>

        {errors.length > 0 && (
          <div style={{
            background: '#fef2f2', border: '1px solid #fca5a5',
            borderRadius: 'var(--radius)', padding: '10px 14px', marginBottom: 16,
          }}>
            {errors.map((e, i) => (
              <div key={i} className="form-error">{e}</div>
            ))}
          </div>
        )}

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
              placeholder="Minimálně 8 znaků, velká/malá písmena, speciální znak"
              autoComplete="new-password"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Potvrdit heslo</label>
            <input
              className="form-input"
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="Zopakujte heslo"
              autoComplete="new-password"
              required
            />
          </div>

          <div style={{
            background: 'var(--blue-50)', border: '1px solid var(--blue-200)',
            borderRadius: 'var(--radius)', padding: '10px 14px', fontSize: '0.8125rem',
            color: 'var(--blue-700)',
          }}>
            Heslo musí mít: min. 8 znaků, velké a malé písmeno, speciální znak
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg btn-full"
            style={{ marginTop: 4 }}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? 'Registruji...' : 'Zaregistrovat se'}
          </button>
        </form>

        <div className="divider" />

        <p className="text-center text-sm" style={{ color: 'var(--gray-600)' }}>
          Již máte účet?{' '}
          <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
            Přihlásit se
          </Link>
        </p>
      </div>
    </div>
  );
}
