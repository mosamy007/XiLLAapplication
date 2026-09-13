import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { useAudio } from '../../context/AudioContext';
import { Wallet, X, CheckCircle, ShieldCheck } from 'lucide-react';

export default function WalletModal() {
  const { isWalletModalOpen, setIsWalletModalOpen, submitWallet, wallet, handle } = useGame();
  const { playBlip } = useAudio();
  const [address, setAddress] = useState(wallet || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isWalletModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    const clean = address.trim();
    if (!clean) {
      setError('Please input your wallet address.');
      return;
    }
    if (clean.length < 20) {
      setError('Address is too short. Please provide a valid EVM or Solana address.');
      return;
    }

    setLoading(true);
    setError('');
    const result = await submitWallet(clean);
    setLoading(false);

    if (!result.success && result.error) {
      setError(result.error);
    }
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg pixel-panel border-4 border-neon-green bg-cyber-dark p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-neon-green/40">
          <div className="flex items-center gap-2 text-neon-green font-pixel text-xs">
            <Wallet className="w-4 h-4 text-neon-green" />
            <span>WL ALLOCATION EXTRACTION</span>
          </div>
          <button
            onClick={() => { playBlip(); setIsWalletModalOpen(false); }}
            className="text-gray-400 hover:text-danger-red p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Identity Confirmation */}
        <div className="p-3 mb-4 bg-neon-green/10 border-2 border-neon-green/60 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-gray-300">CONFIRMED OPERATIVE:</span>
            <span className="font-pixel text-neon-cyan">{handle || 'ANONYMOUS'}</span>
          </div>
          <p className="text-gray-400 text-[11px] mt-1">
            Your wallet address will be bound to your X profile for the upcoming XiLLA mint allocation.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-pixel text-[10px] text-neon-green uppercase mb-2">
              EVM / Solana Wallet Address:
            </label>
            <input
              type="text"
              autoFocus
              placeholder="0x... or Solana Address"
              value={address}
              onChange={(e) => { setAddress(e.target.value); setError(''); }}
              className="w-full bg-cyber-black text-white font-tech text-sm p-3 border-2 border-neon-green focus:outline-none focus:border-neon-cyan focus:shadow-glow-cyan font-mono"
            />
            {error && <p className="text-danger-red text-xs mt-1 font-tech font-bold">{error}</p>}
          </div>

          <div className="p-3 bg-cyber-black border border-gray-800 text-[11px] text-gray-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-neon-green shrink-0" />
            <span>+500 XP will be awarded immediately upon submission.</span>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full pixel-btn border-neon-green bg-neon-green text-cyber-black font-pixel text-xs py-3 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span>SAVING PROTOCOL...</span>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>LOCK IN WL ALLOCATION</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
