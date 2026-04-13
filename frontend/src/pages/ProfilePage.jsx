import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateProfile, changePassword } from '../api/profile';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function ProfilePage() {
  const { user, setAuth, token } = useAuthStore();
  const qc = useQueryClient();

  const [name, setName]                   = useState(user?.name || '');
  const [currentPwd, setCurrentPwd]       = useState('');
  const [newPwd, setNewPwd]               = useState('');
  const [confirmPwd, setConfirmPwd]       = useState('');
  const [pwdErrors, setPwdErrors]         = useState([]);

  const profileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (updated) => {
      setAuth({ ...user, name: updated.name }, token);
      toast.success('Profil uložen');
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Chyba'),
  });

  const passwordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast.success('Heslo změněno');
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
      setPwdErrors([]);
    },
    onError: (e) => {
      const msg = e.response?.data?.error || 'Chyba';
      setPwdErrors([msg]);
    },
  });

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    profileMutation.mutate({ name });
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setPwdErrors([]);
    if (newPwd !== confirmPwd) {
      setPwdErrors(['Nová hesla se neshodují']);
      return;
    }
    passwordMutation.mutate({ currentPassword: currentPwd, newPassword: newPwd });
  };

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 560 }}>
        <h1 style={{ marginBottom: 28 }}>Profil</h1>

        {/* Account info */}
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 4 }}>Informace o účtu</h3>
          <p style={{ marginBottom: 20, fontSize: '0.875rem' }}>
            Email: <strong>{user?.email}</strong>
          </p>

          <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Zobrazované jméno</label>
              <input
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Vaše jméno (nepovinné)"
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ alignSelf: 'flex-start' }}
              disabled={profileMutation.isPending}
            >
              {profileMutation.isPending ? 'Ukládám...' : 'Uložit jméno'}
            </button>
          </form>
        </div>

        {/* Change password */}
        <div className="card">
          <h3 style={{ marginBottom: 4 }}>Změna hesla</h3>
          <p style={{ marginBottom: 20, fontSize: '0.875rem' }}>
            Heslo musí mít: min. 8 znaků, velké a malé písmeno, speciální znak
          </p>

          {pwdErrors.length > 0 && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fca5a5',
              borderRadius: 'var(--radius)', padding: '10px 14px', marginBottom: 14,
            }}>
              {pwdErrors.map((e, i) => <div key={i} className="form-error">{e}</div>)}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="form-group">
              <label className="form-label">Aktuální heslo</label>
              <input
                className="form-input"
                type="password"
                value={currentPwd}
                onChange={(e) => setCurrentPwd(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Nové heslo</label>
              <input
                className="form-input"
                type="password"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Potvrdit nové heslo</label>
              <input
                className="form-input"
                type="password"
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              style={{ alignSelf: 'flex-start' }}
              disabled={passwordMutation.isPending}
            >
              {passwordMutation.isPending ? 'Měním...' : 'Změnit heslo'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
