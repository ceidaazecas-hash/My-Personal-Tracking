import { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';

export default function GatekeeperLock({ onUnlock, logo, sitePassword }) {
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');

    const correctPassword = sitePassword || 'mrevent2026';

    if (password === correctPassword) {
      const expiry = remember ? Date.now() + 30 * 24 * 60 * 60 * 1000 : null; // 30 days or session
      onUnlock(expiry);
    } else {
      setErrorMsg('Incorrect password. Please try again.');
    }
  };

  return (
    <div className="auth-container" style={{ minHeight: '100vh' }}>
      <div className="auth-card" style={{ maxWidth: '380px' }}>
        <div className="auth-logo-large">
          <img src={logo || "/logo.jpg"} alt="App Logo" className="logo-image" />
        </div>
        
        <h1 className="auth-title">Private Access</h1>
        <p className="auth-subtitle">This site is private. Please enter the password to view your events.</p>

        {errorMsg && <div className="error-message">{errorMsg}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label className="input-label" htmlFor="gatekeeper-password">Site Password</label>
            <input
              id="gatekeeper-password"
              type="password"
              placeholder="Enter site password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="text-input"
              required
              autoFocus
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', textAlign: 'left', margin: '4px 0 12px' }}>
            <input
              id="remember-device"
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              style={{
                width: '16px',
                height: '16px',
                accentColor: 'var(--accent)',
                cursor: 'pointer'
              }}
            />
            <label 
              htmlFor="remember-device" 
              style={{ 
                fontSize: '13px', 
                fontWeight: '600', 
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                userSelect: 'none'
              }}
            >
              Remember this device for 30 days
            </label>
          </div>

          <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Lock size={16} />
            <span>Unlock Site</span>
          </button>
        </form>
      </div>
    </div>
  );
}
