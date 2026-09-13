import React, { useState } from 'react';
import { useGame } from '../../context/GameContext';
import { useAudio } from '../../context/AudioContext';
import { 
  Crosshair, Check, Lock, Loader2, Sparkles, UserCheck, 
  Wallet, Repeat, Radio, MessageSquare, ExternalLink, ShieldCheck, 
  AlertTriangle, X, CheckCircle2, Award, ArrowRight, Edit3, Send
} from 'lucide-react';

export default function MissionBoard() {
  const { 
    tasks, 
    completedTaskIds, 
    handle,
    setSurvivorHandle,
    wallet,
    saveWalletAddress,
    setIsIdentityModalOpen,
    openedTaskIds,
    openTaskLink,
    verifyTask,
    executingTaskId, 
    executionMessage,
    verificationError,
    clearVerificationError,
    verificationSuccessMessage,
    registerParticipation,
    isParticipationRegistered,
  } = useGame();
  
  const { playBlip, playLaser, playWarning } = useAudio();

  // Inline Inputs for Task 1 & 2
  const [handleInput, setHandleInput] = useState('');
  const [handleError, setHandleError] = useState('');
  const [isEditingHandle, setIsEditingHandle] = useState(false);

  const [walletInput, setWalletInput] = useState('');
  const [walletError, setWalletError] = useState('');
  const [isEditingWallet, setIsEditingWallet] = useState(false);

  const [isSubmittingFinal, setIsSubmittingFinal] = useState(false);

  // Icon mapping
  const getTaskIcon = (task) => {
    switch (task.type) {
      case 'identity':
        return <UserCheck className="w-4 h-4 text-neon-cyan" />;
      case 'wallet':
        return <Wallet className="w-4 h-4 text-neon-green" />;
      case 'follow':
        return <Radio className="w-4 h-4 text-neon-cyan" />;
      case 'like_rt':
      case 'repost':
      case 'broadcast':
        return <Repeat className="w-4 h-4 text-neon-pink" />;
      case 'reply':
        return <MessageSquare className="w-4 h-4 text-neon-yellow" />;
      default:
        return <Sparkles className="w-4 h-4 text-neon-cyan" />;
    }
  };

  const getTaskBorderColor = (task, isCompleted) => {
    if (isCompleted) return 'border-neon-green/60 bg-neon-green/5';
    switch (task.color || task.type) {
      case 'pink':
      case 'like_rt':
        return 'border-neon-pink/70 hover:border-neon-pink';
      case 'yellow':
      case 'reply':
        return 'border-neon-yellow/70 hover:border-neon-yellow';
      case 'green':
      case 'wallet':
        return 'border-neon-green/70 hover:border-neon-green';
      default:
        return 'border-neon-cyan/70 hover:border-neon-cyan';
    }
  };

  const getActionVerb = (task) => {
    switch (task.type) {
      case 'follow':
        return 'FOLLOW ON X';
      case 'like_rt':
        return 'LIKE & RT ON X';
      case 'reply':
        return 'REPLY "XiLLA" ON X';
      default:
        return 'OPEN LINK';
    }
  };

  // Handler: Verify X Handle (Task 01)
  const handleVerifyHandle = (e) => {
    e?.preventDefault();
    const clean = handleInput.trim().replace(/^@/, '');
    if (!clean || clean.length < 2) {
      playWarning();
      setHandleError('Please enter a valid X handle (min 2 chars).');
      return;
    }
    setHandleError('');
    setSurvivorHandle(clean);
    setIsEditingHandle(false);
  };

  // Handler: Verify EVM Wallet (Task 02)
  const handleVerifyWallet = async (e) => {
    e?.preventDefault();
    const clean = walletInput.trim();
    if (!clean) {
      playWarning();
      setWalletError('Please enter your EVM address.');
      return;
    }
    const isEvm = /^0x[a-fA-F0-9]{40}$/.test(clean);
    if (!isEvm) {
      playWarning();
      setWalletError('Invalid EVM address (must be 0x followed by 40 hex chars).');
      return;
    }
    setWalletError('');
    const res = await saveWalletAddress(clean);
    if (res.success) {
      setIsEditingWallet(false);
    } else {
      setWalletError(res.error || 'Failed to verify EVM wallet.');
    }
  };

  // Handler: Register Final Whitelist Participation
  const handleRegisterParticipation = async () => {
    setIsSubmittingFinal(true);
    try {
      await registerParticipation();
    } finally {
      setIsSubmittingFinal(false);
    }
  };

  // Check mandatory tasks progress (core mandatory tasks only; future missions are XP-only)
  const mandatoryTasks = tasks.filter(t => t.isMandatory === true);
  const completedMandatoryCount = mandatoryTasks.filter(t => completedTaskIds.includes(t.id)).length;
  const totalMandatoryCount = mandatoryTasks.length || 5;
  const allMissionsCompleted = completedMandatoryCount >= totalMandatoryCount;

  return (
    <div className="flex flex-col h-full">
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <Crosshair className="w-4 h-4 text-neon-cyan animate-pulse shrink-0" />
          <h2 className="font-pixel text-xs sm:text-sm text-neon-cyan tracking-wider">
            PLAY TO SURVIVE // MISSIONS
          </h2>
        </div>

        {/* Current Operative Identity Status */}
        {handle ? (
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-cyber-black border border-neon-cyan/50 text-[10px] font-tech text-neon-cyan">
              <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-ping" />
              <span>RADAR: <strong>{handle}</strong></span>
            </div>
            <button
              onClick={() => setIsIdentityModalOpen(true)}
              className="text-[8px] font-pixel text-neon-pink hover:text-white underline cursor-pointer transition-colors"
              title="Switch X Operative Handle"
            >
              [SWITCH]
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsIdentityModalOpen(true)}
            className="text-[9px] font-pixel text-neon-pink hover:underline flex items-center gap-1 cursor-pointer animate-pulse shrink-0"
          >
            <span>[SET @HANDLE]</span>
          </button>
        )}
      </div>

      <p className="font-tech text-xs text-gray-400 mb-3">
        Complete and verify all {totalMandatoryCount} missions below to register your WL spot.
      </p>

      {/* Real-Time Scanning Radar Banner */}
      {executionMessage && (
        <div className="mb-3 p-2.5 bg-neon-cyan/15 border-2 border-neon-cyan flex items-center justify-between gap-2 text-xs text-neon-cyan animate-pulse shadow-pixel-cyan">
          <div className="flex items-center gap-2 min-w-0">
            <Loader2 className="w-4 h-4 animate-spin shrink-0 text-neon-cyan" />
            <span className="font-tech font-bold tracking-wide truncate">{executionMessage}</span>
          </div>
          <span className="font-pixel text-[8px] text-neon-yellow shrink-0">RADAR SCANNING...</span>
        </div>
      )}

      {/* Success Banner */}
      {verificationSuccessMessage && (
        <div className="mb-3 p-2.5 bg-neon-green/15 border-2 border-neon-green flex items-center gap-2 text-xs text-neon-green shadow-pixel-dark">
          <CheckCircle2 className="w-4 h-4 text-neon-green shrink-0" />
          <span className="font-tech font-bold">{verificationSuccessMessage}</span>
        </div>
      )}

      {/* Verification Error Alert */}
      {verificationError && (
        <div className="mb-3 p-2.5 bg-danger-red/20 border-2 border-danger-red flex items-center justify-between gap-2 text-xs text-white">
          <div className="flex items-center gap-2 min-w-0">
            <AlertTriangle className="w-4 h-4 text-danger-red shrink-0" />
            <span className="font-tech text-danger-red font-bold text-xs">{verificationError.message}</span>
          </div>
          <button
            onClick={clearVerificationError}
            className="p-1 hover:bg-danger-red/20 text-gray-300 hover:text-white cursor-pointer shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Missions List Container */}
      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        {tasks.map((task, idx) => {
          const isCompleted = completedTaskIds.includes(task.id);
          const isExecuting = executingTaskId === task.id;
          const isOpened = openedTaskIds.includes(task.id);

          return (
            <div
              key={task.id}
              className={`p-3 border-2 bg-cyber-panel transition-all duration-150 flex flex-col gap-2 ${getTaskBorderColor(
                task,
                isCompleted
              )}`}
            >
              {/* Tier 1: Step Number + Icon + Title + Status Badges + XP */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {/* Icon Box */}
                  <div
                    className={`w-8 h-8 shrink-0 flex items-center justify-center border-2 ${
                      isCompleted
                        ? 'border-neon-green bg-neon-green/10'
                        : 'border-current bg-cyber-black'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="w-4 h-4 text-neon-green stroke-[3]" />
                    ) : (
                      getTaskIcon(task)
                    )}
                  </div>

                  {/* Title & Status Badges */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-pixel text-[9px] text-gray-500">
                        0{task.order || idx + 1}.
                      </span>
                      <h3 className="font-pixel text-xs text-white uppercase tracking-wide">
                        {task.title}
                      </h3>
                      {isCompleted && (
                        <span className="font-pixel text-[8px] text-neon-green bg-neon-green/10 px-1.5 py-0.5 border border-neon-green/50">
                          VERIFIED ✓
                        </span>
                      )}
                      {isOpened && !isCompleted && (
                        <span className="font-pixel text-[8px] text-neon-cyan bg-neon-cyan/10 px-1.5 py-0.5 border border-neon-cyan/40 animate-pulse">
                          READY TO VERIFY
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* XP Reward Badge */}
                <span className="font-pixel text-[10px] text-neon-green shrink-0 px-2 py-0.5 bg-neon-green/10 border border-neon-green/40">
                  +{task.xp.toLocaleString()} XP
                </span>
              </div>

              {/* Tier 2: Subtitle / Target Description */}
              <p className="font-tech text-xs text-gray-400 pl-10">
                {task.subtitle}
              </p>

              {/* Tier 3: Action Controls */}
              <div className="pl-10 pt-1.5 border-t border-gray-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                {/* --- TASK 1: ENTER X HANDLE --- */}
                {task.type === 'identity' ? (
                  isCompleted && !isEditingHandle ? (
                    <div className="flex items-center justify-between w-full">
                      <span className="font-pixel text-[9px] text-neon-green flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>OPERATIVE: {handle}</span>
                      </span>
                      <button
                        onClick={() => { setIsEditingHandle(true); setHandleInput(handle ? handle.replace(/^@/, '') : ''); }}
                        className="font-pixel text-[8px] text-gray-400 hover:text-neon-cyan flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>[CHANGE]</span>
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleVerifyHandle} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
                      <div className="relative flex-1">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-neon-cyan font-tech text-xs">@</span>
                        <input
                          type="text"
                          placeholder="username"
                          value={handleInput}
                          onChange={(e) => { setHandleInput(e.target.value); setHandleError(''); }}
                          className="w-full bg-cyber-black text-white font-tech text-xs pl-6 pr-2 py-1.5 border border-neon-cyan focus:outline-none"
                        />
                      </div>
                      <button
                        type="submit"
                        onMouseEnter={() => playBlip(400)}
                        className="font-pixel text-[9px] px-3.5 py-1.5 bg-neon-cyan text-cyber-black border border-neon-cyan font-bold hover:bg-white hover:border-white shadow-pixel-cyan cursor-pointer shrink-0 text-center"
                      >
                        VERIFY
                      </button>
                      {handleError && (
                        <span className="text-[10px] text-danger-red font-tech">{handleError}</span>
                      )}
                    </form>
                  )
                ) : 

                /* --- TASK 2: ENTER EVM WALLET ADDRESS --- */
                task.type === 'wallet' ? (
                  isCompleted && !isEditingWallet ? (
                    <div className="flex items-center justify-between w-full">
                      <span className="font-mono text-xs text-neon-green flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>{wallet ? `${wallet.slice(0, 8)}...${wallet.slice(-6)}` : 'VERIFIED ✓'}</span>
                      </span>
                      <button
                        onClick={() => { setIsEditingWallet(true); setWalletInput(wallet || ''); }}
                        className="font-pixel text-[8px] text-gray-400 hover:text-neon-green flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>[CHANGE]</span>
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleVerifyWallet} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full">
                      <input
                        type="text"
                        placeholder="0x... (EVM wallet address)"
                        value={walletInput}
                        onChange={(e) => { setWalletInput(e.target.value); setWalletError(''); }}
                        className="flex-1 bg-cyber-black text-white font-mono text-xs px-2.5 py-1.5 border border-neon-green focus:outline-none"
                      />
                      <button
                        type="submit"
                        onMouseEnter={() => playBlip(400)}
                        className="font-pixel text-[9px] px-3.5 py-1.5 bg-neon-green text-cyber-black border border-neon-green font-bold hover:bg-white hover:border-white shadow-[0_0_8px_rgba(0,255,102,0.4)] cursor-pointer shrink-0 text-center"
                      >
                        VERIFY
                      </button>
                      {walletError && (
                        <span className="text-[10px] text-danger-red font-tech">{walletError}</span>
                      )}
                    </form>
                  )
                ) : 

                /* --- TASKS 3, 4, 5: FOLLOW, LIKE & RT, REPLY --- */
                isCompleted ? (
                  <div className="flex items-center gap-1.5 text-neon-green font-pixel text-[9px]">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>RADAR CONFIRMED // VERIFIED ✓</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 w-full justify-end">
                    {/* Action Link Button */}
                    {task.url && (
                      <button
                        onClick={() => openTaskLink(task)}
                        onMouseEnter={() => playBlip(400)}
                        title={`Open ${task.title} on X`}
                        className={`font-pixel text-[8px] sm:text-[9px] px-3 py-1.5 border transition-all flex items-center justify-center gap-1.5 cursor-pointer flex-1 sm:flex-initial ${
                          isOpened
                            ? 'border-gray-600 bg-cyber-black text-gray-300 hover:text-white hover:border-gray-400'
                            : 'border-neon-pink/80 bg-neon-pink/10 text-neon-pink hover:bg-neon-pink hover:text-white shadow-[0_0_6px_rgba(255,0,122,0.3)]'
                        }`}
                      >
                        <ExternalLink className="w-3 h-3 shrink-0" />
                        <span>{getActionVerb(task)}</span>
                      </button>
                    )}

                    {/* Dedicated Verify Button */}
                    <button
                      onClick={() => verifyTask(task)}
                      disabled={isExecuting}
                      onMouseEnter={() => playBlip(500)}
                      title="Trigger dummy account to verify task on X"
                      className={`font-pixel text-[9px] px-3.5 py-1.5 border-2 transition-all flex items-center justify-center gap-1.5 active:translate-y-0.5 cursor-pointer flex-1 sm:flex-initial ${
                        isExecuting
                          ? 'bg-neon-cyan/20 border-neon-cyan text-neon-cyan cursor-wait animate-pulse'
                          : isOpened
                          ? 'bg-neon-cyan text-cyber-black border-neon-cyan hover:bg-white hover:border-white shadow-pixel-cyan font-bold'
                          : 'bg-cyber-black text-neon-cyan border-neon-cyan hover:bg-neon-cyan hover:text-cyber-black shadow-pixel-cyan'
                      }`}
                    >
                      {isExecuting ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin shrink-0" />
                          <span>SCANNING</span>
                        </>
                      ) : (
                        <>
                          <Crosshair className="w-3 h-3 text-current shrink-0" />
                          <span>VERIFY</span>
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Final Whitelist Registration Action */}
      <div className="mt-3 pt-3 border-t-2 border-gray-800">
        {isParticipationRegistered ? (
          <div className="p-3 bg-neon-green/15 border-2 border-neon-green flex flex-col sm:flex-row items-center justify-between gap-3 shadow-[0_0_15px_rgba(0,255,102,0.3)]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-neon-green/20 border border-neon-green flex items-center justify-center shrink-0">
                <Award className="w-5 h-5 text-neon-green" />
              </div>
              <div>
                <p className="font-pixel text-xs text-neon-green font-bold">
                  WL PARTICIPATION CONFIRMED & REGISTERED
                </p>
                <p className="font-tech text-xs text-gray-300">
                  Operative: <strong className="text-neon-cyan">{handle}</strong> | EVM: <strong className="text-neon-green font-mono">{wallet ? `${wallet.slice(0, 8)}...${wallet.slice(-6)}` : 'SET'}</strong>
                </p>
              </div>
            </div>
            <span className="font-pixel text-[9px] px-3 py-1 bg-neon-green text-cyber-black font-bold border border-neon-green shrink-0">
              WHITELISTED ✓
            </span>
          </div>
        ) : allMissionsCompleted ? (
          <div className="space-y-1.5">
            <button
              onClick={handleRegisterParticipation}
              disabled={isSubmittingFinal}
              onMouseEnter={() => playLaser()}
              className="w-full py-3.5 px-4 pixel-btn bg-neon-green border-2 border-neon-green text-cyber-black hover:bg-white hover:border-white font-pixel text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,255,102,0.7)] animate-pulse cursor-pointer transition-transform active:scale-95"
            >
              {isSubmittingFinal ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-cyber-black" />
                  <span>TRANSMITTING PARTICIPATION...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>REGISTER PARTICIPATION // SECURE WL SPOT</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
            <p className="font-tech text-[11px] text-neon-green text-center">
              ✓ All {totalMandatoryCount} missions verified. Click to transmit your X handle & EVM wallet.
            </p>
          </div>
        ) : (
          <div className="space-y-1.5">
            <button
              disabled
              className="w-full py-3 px-3 bg-cyber-dark/80 border-2 border-gray-700 text-gray-400 font-pixel text-[10px] sm:text-xs flex items-center justify-center gap-2 cursor-not-allowed opacity-90 text-center"
            >
              <Lock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>
                LOCKED: COMPLETE ALL MISSIONS ({completedMandatoryCount}/{totalMandatoryCount})
              </span>
            </button>
            <p className="font-tech text-[11px] text-gray-400 text-center">
              All {totalMandatoryCount} missions above are mandatory to unlock registration.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
