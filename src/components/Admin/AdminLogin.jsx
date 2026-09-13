import React, { useState } from 'react';
import { Shield, Key, AlertCircle, ArrowLeft } from 'lucide-react';

export default function AdminLogin({ onLoginSuccess }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) {
      setError('Please input the security key.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        sessionStorage.setItem('xilla_admin_key', data.token);
        onLoginSuccess(data.token);
      } else {
        setError(data.error || 'Invalid Security Key');
      }
    } catch (err) {
      setError('Server connection failure. Ensure server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-black flex flex-col items-center justify-center p-4">
      {/* Background Glow */}
      <div className="w-full max-w-md pixel-panel border-4 border-neon-cyan bg-cyber-dark p-6 sm:p-8 shadow-2xl relative">
        <a
          href="/"
          className="inline-flex items-center gap-1 font-pixel text-[9px] text-gray-400 hover:text-neon-cyan mb-6"
        >
          <ArrowLeft className="w-3 h-3" />
          <span>BACK TO MAIN SITE</span>
        </a>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 border-2 border-neon-cyan bg-neon-cyan/10 flex items-center justify-center">
            <Shield className="w-5 h-5 text-neon-cyan" />
          </div>
          <div>
            <h1 className="font-pixel text-sm text-neon-cyan glow-text-cyan">
              XiLLA COMMAND CENTER
            </h1>
            <p className="font-tech text-xs text-gray-400">
              RESTRICTED // ADMIN CLEARANCE REQUIRED
            </p>
          </div>
        </div>

        <p className="font-tech text-xs text-gray-300 mb-6 leading-relaxed">
          Access is strictly restricted to project leadership. Passcode is configured in your server <code className="text-neon-pink">.env</code> or Vercel Environment Variables.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-pixel text-[10px] text-neon-cyan uppercase mb-2">
              ADMIN SECURITY KEY:
            </label>
            <div className="relative flex items-center">
              <Key className="w-4 h-4 text-gray-500 absolute left-3" />
              <input
                type="password"
                autoFocus
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                className="w-full bg-cyber-black text-white pl-9 pr-3 py-2.5 border-2 border-neon-cyan focus:outline-none focus:border-neon-pink text-sm font-tech"
              />
            </div>
            {error && (
              <div className="flex items-center gap-1 text-danger-red text-xs mt-2 font-tech">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full pixel-btn pixel-btn-pink text-xs py-3"
          >
            {loading ? 'AUTHENTICATING...' : 'ACCESS COMMAND CONSOLE'}
          </button>
        </form>
      </div>
    </div>
  );
}
