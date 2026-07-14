import { useState } from 'react';
import { Save, RotateCcw, Shield, Image, Upload, Settings, Plus } from 'lucide-react';

export default function SettingsTab({ logo, icon, onSaveSettings, onResetSettings }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [localLogo, setLocalLogo] = useState(logo || '');
  const [localIcon, setLocalIcon] = useState(icon || '');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleLogoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setLocalLogo(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleIconUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setLocalIcon(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    // If changing password, validate it
    if (newPassword) {
      if (newPassword !== confirmPassword) {
        setErrorMsg('Passwords do not match.');
        return;
      }
      if (newPassword.length < 4) {
        setErrorMsg('Password must be at least 4 characters long.');
        return;
      }
    }

    onSaveSettings({
      logo: localLogo,
      icon: localIcon,
      password: newPassword || null
    });

    setSuccessMsg('Settings saved successfully!');
    setNewPassword('');
    setConfirmPassword('');
    
    setTimeout(() => {
      setSuccessMsg('');
    }, 3000);
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset the logo and icon to defaults?')) {
      onResetSettings();
      setLocalLogo('');
      setLocalIcon('');
      setSuccessMsg('Settings reset to defaults.');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  return (
    <div className="daily-container">
      <div className="daily-header" style={{ textAlign: 'center' }}>
        <div className="daily-day-name" style={{ letterSpacing: '2px' }}>Configure App</div>
        <div className="daily-date-large" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <Settings size={26} style={{ color: 'var(--accent)' }} />
          <span>App Settings</span>
        </div>
      </div>

      <div className="settings-card" style={{ marginTop: '16px' }}>
        {errorMsg && <div className="error-message">{errorMsg}</div>}
        {successMsg && <div className="error-message" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.2)' }}>{successMsg}</div>}

        <form onSubmit={handleSave}>
          <div className="settings-grid">
            {/* Left Column: Branding Assets */}
            <div className="settings-section">
              <h3 className="section-title" style={{ marginTop: 0, fontSize: '15px', borderBottom: '1px solid var(--border)', paddingBottom: '8px', marginBottom: '16px', justifyContent: 'center', gap: '6px' }}>
                <Image size={16} style={{ color: 'var(--accent)' }} />
                <span>Branding Assets</span>
              </h3>
              
              <div style={{ display: 'flex', justifyContent: 'space-around', gap: '20px', padding: '10px 0' }}>
                {/* Logo Section */}
                <div className="input-group" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <label className="input-label" style={{ textAlign: 'center' }}>App Logo</label>
                  <label style={{ position: 'relative', width: '100px', height: '100px', display: 'block', cursor: 'pointer', margin: '4px auto 0' }}>
                    <div className="logo-container" style={{ width: '100%', height: '100%', margin: 0, flexShrink: 0 }}>
                      <img src={localLogo || "/logo.jpg"} alt="Current Logo" className="logo-image" />
                    </div>
                    <div style={{
                      position: 'absolute',
                      bottom: '0',
                      right: '0',
                      width: '28px',
                      height: '28px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--accent)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: 'var(--shadow-sm)',
                      border: '2px solid var(--bg-secondary)',
                      transition: 'transform 0.1s ease'
                    }}>
                      <Plus size={16} />
                    </div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleLogoUpload} 
                      style={{ display: 'none' }} 
                    />
                  </label>
                </div>

                {/* Favicon Section */}
                <div className="input-group" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <label className="input-label" style={{ textAlign: 'center' }}>Browser Icon</label>
                  <label style={{ position: 'relative', width: '80px', height: '80px', display: 'block', cursor: 'pointer', margin: '14px auto 0' }}>
                    <div className="logo-container" style={{ width: '100%', height: '100%', margin: 0, flexShrink: 0 }}>
                      <img src={localIcon || localLogo || "/logo.jpg"} alt="Current Icon" className="logo-image" />
                    </div>
                    <div style={{
                      position: 'absolute',
                      bottom: '0',
                      right: '0',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      backgroundColor: 'var(--accent)',
                      color: '#ffffff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: 'var(--shadow-sm)',
                      border: '2px solid var(--bg-secondary)',
                      transition: 'transform 0.1s ease'
                    }}>
                      <Plus size={14} />
                    </div>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleIconUpload} 
                      style={{ display: 'none' }} 
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Right Column: Security & Actions */}
            <div className="settings-section" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <h3 className="section-title" style={{ marginTop: 0, fontSize: '15px', borderBottom: '1px solid var(--border)', paddingBottom: '8px', marginBottom: '16px', justifyContent: 'center', gap: '6px' }}>
                  <Shield size={16} style={{ color: 'var(--accent)' }} />
                  <span>Security Settings</span>
                </h3>
                
                <div className="input-group" style={{ gap: '12px' }}>
                  <label className="input-label">Change Access Password</label>
                  <input
                    type="password"
                    placeholder="New Access Password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="text-input"
                    style={{ textAlign: 'center' }}
                  />
                  <input
                    type="password"
                    placeholder="Confirm New Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="text-input"
                    style={{ textAlign: 'center' }}
                  />
                </div>
              </div>

              {/* Form Action Buttons at bottom of column */}
              <div className="form-actions" style={{ gridTemplateColumns: '1fr 2fr', marginTop: '24px' }}>
                <button type="button" className="btn-secondary" onClick={handleReset} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                  <RotateCcw size={14} />
                  <span>Reset</span>
                </button>
                <button type="submit" className="btn-primary" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', margin: 0 }}>
                  <Save size={16} />
                  <span>Save Changes</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
