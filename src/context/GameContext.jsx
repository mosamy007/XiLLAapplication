import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAudio } from './AudioContext';
import confetti from 'canvas-confetti';

const GameContext = createContext();

export function GameProvider({ children }) {
  const { playBlip, playLaser, playVictory, playWarning } = useAudio();

  // Helper to retrieve isolated local profile by handle
  const getStoredProfile = (h) => {
    if (!h) return null;
    try {
      const clean = h.trim().toLowerCase().replace(/^@/, '');
      const saved = localStorage.getItem(`xilla_profile_@${clean}`);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  };

  // ============================================================
  // ALL STATE DECLARATIONS AT TOP OF COMPONENT (PREVENTS TDZ)
  // ============================================================

  // Boot sequence state - shows up whenever loading or reloading the website
  const [showBootSequence, setShowBootSequence] = useState(true);

  // User identity (X handle, Wallet, XP, Tasks) - ISOLATED PER HANDLE
  const [handle, setHandle] = useState(() => {
    return localStorage.getItem('xilla_user_handle') || '';
  });

  const [wallet, setWallet] = useState(() => {
    const active = localStorage.getItem('xilla_user_handle');
    const prof = getStoredProfile(active);
    return prof?.wallet || '';
  });

  const [xp, setXp] = useState(() => {
    const active = localStorage.getItem('xilla_user_handle');
    const prof = getStoredProfile(active);
    return prof?.xp !== undefined ? prof.xp : 0;
  });

  const [completedTaskIds, setCompletedTaskIds] = useState(() => {
    const active = localStorage.getItem('xilla_user_handle');
    const prof = getStoredProfile(active);
    return prof?.completedTasks || [];
  });

  const [isParticipationRegistered, setIsParticipationRegistered] = useState(() => {
    const active = localStorage.getItem('xilla_user_handle');
    const prof = getStoredProfile(active);
    return !!(prof?.isParticipationRegistered || prof?.status === 'WL_QUALIFIED');
  });

  // Modals
  const [isIdentityModalOpen, setIsIdentityModalOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isLeaderboardModalOpen, setIsLeaderboardModalOpen] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [identityPromptReason, setIdentityPromptReason] = useState('EXECUTE_MISSION');

  // Tasks from API
  const [tasks, setTasks] = useState([]);
  const [executingTaskId, setExecutingTaskId] = useState(null);
  const [executionMessage, setExecutionMessage] = useState(null);

  // Real supply & holder allocation
  const [spotsRemaining, setSpotsRemaining] = useState(2497);
  const [totalSpots, setTotalSpots] = useState(5333);
  const [holderSpotsTaken, setHolderSpotsTaken] = useState(2836);
  const [registeredSurvivors, setRegisteredSurvivors] = useState(0);
  const [projectConfig, setProjectConfig] = useState(null);

  // Verification & task link tracking
  const [openedTaskIds, setOpenedTaskIds] = useState([]);
  const [verificationError, setVerificationError] = useState(null);
  const [verificationSuccessMessage, setVerificationSuccessMessage] = useState(null);

  const clearVerificationError = () => setVerificationError(null);

  // ============================================================
  // DATA FETCHING & POLLING
  // ============================================================

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch('/api/tasks');
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      }
    } catch (e) {
      console.warn('Using local tasks fallback:', e);
    }
  }, []);

  const fetchConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/config');
      if (res.ok) {
        const data = await res.json();
        setProjectConfig(data);
        if (data.wlRemaining !== undefined) setSpotsRemaining(data.wlRemaining);
        if (data.wlTotal !== undefined) setTotalSpots(data.wlTotal);
        if (data.holderSpotsTaken !== undefined) setHolderSpotsTaken(data.holderSpotsTaken);
        if (data.registeredSurvivors !== undefined) setRegisteredSurvivors(data.registeredSurvivors);
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    fetchTasks();
    fetchConfig();

    // Live counter polling every 6 seconds
    const interval = setInterval(() => {
      fetchConfig();
    }, 6000);

    return () => clearInterval(interval);
  }, [fetchTasks, fetchConfig]);

  // Save isolated profile for the active handle whenever its state changes
  useEffect(() => {
    if (!handle) return;
    const cleanLower = handle.trim().toLowerCase().replace(/^@/, '');
    const profileKey = `xilla_profile_@${cleanLower}`;
    const profileData = {
      handle,
      xp,
      completedTasks: completedTaskIds,
      wallet,
      isParticipationRegistered,
    };
    localStorage.setItem(profileKey, JSON.stringify(profileData));
    localStorage.setItem('xilla_user_handle', handle);
  }, [handle, xp, completedTaskIds, wallet, isParticipationRegistered]);

  // ============================================================
  // OPERATIVE ACTIONS
  // ============================================================

  // Load or switch handle to a new / existing operative profile
  const setSurvivorHandle = async (rawHandle) => {
    const clean = rawHandle.trim().replace(/^@/, '');
    if (!clean) return;
    const fullHandle = `@${clean}`;

    // Reset transient verification errors & opened tasks
    setOpenedTaskIds([]);
    setVerificationError(null);
    setVerificationSuccessMessage(null);

    // Check if this handle has a locally saved profile
    const cached = getStoredProfile(fullHandle);

    if (cached) {
      // Restore existing profile
      setHandle(fullHandle);
      setXp(cached.xp !== undefined ? cached.xp : 100);
      setCompletedTaskIds(cached.completedTasks || ['task_identity']);
      setWallet(cached.wallet || '');
      setIsParticipationRegistered(Boolean(cached.isParticipationRegistered));
    } else {
      // Brand new handle profile: starts with Operative Identity (100 XP)
      setHandle(fullHandle);
      setXp(100);
      setCompletedTaskIds(['task_identity']);
      setWallet('');
      setIsParticipationRegistered(false);
    }

    localStorage.setItem('xilla_user_handle', fullHandle);

    // Sync with server database to retrieve or initialize survivor
    try {
      const res = await fetch('/api/survivor/init', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ handle: fullHandle }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.survivor) {
          const s = data.survivor;
          setXp(s.xp || 100);
          setCompletedTaskIds(s.completedTasks || ['task_identity']);
          if (s.wallet) setWallet(s.wallet);
          if (s.isRegistered === true || s.status === 'WL_QUALIFIED') {
            setIsParticipationRegistered(true);
          }
        }
      }
    } catch (err) {
      console.warn('Could not sync handle with server:', err);
    }

    playVictory();
    setIsIdentityModalOpen(false);
  };

  // Switch operative / log out current handle
  const switchSurvivorHandle = () => {
    playBlip(400);
    setHandle('');
    setXp(0);
    setCompletedTaskIds([]);
    setWallet('');
    setIsParticipationRegistered(false);
    setOpenedTaskIds([]);
    setVerificationError(null);
    setVerificationSuccessMessage(null);
    localStorage.removeItem('xilla_user_handle');
    setIsIdentityModalOpen(true);
  };

  // Enforced check: handle required before executing any mission or joining WL
  const requireIdentity = (reason = 'EXECUTE_MISSION') => {
    if (!handle) {
      playWarning();
      setIdentityPromptReason(reason);
      setIsIdentityModalOpen(true);
      return false;
    }
    return true;
  };

  // Step 1: Open Task Link
  const openTaskLink = (task) => {
    playLaser();
    if (!openedTaskIds.includes(task.id)) {
      setOpenedTaskIds(prev => [...prev, task.id]);
    }
    if (task.url) {
      window.open(task.url, '_blank', 'noopener,noreferrer');
    }
  };

  // Step 2: Trigger Dummy Account Verification on X
  const verifyTask = async (task) => {
    // Identity task itself
    if (task.id === 'task_identity' || task.type === 'identity') {
      setIsIdentityModalOpen(true);
      return;
    }

    // Wallet task
    if (task.id === 'task_wallet' || task.type === 'wallet') {
      setIsWalletModalOpen(true);
      return;
    }

    // 1. Mandatory Identity Check
    if (!requireIdentity(`VERIFY MISSION: ${task.title}`)) {
      return;
    }

    // Already completed
    if (completedTaskIds.includes(task.id)) {
      playBlip(350);
      return;
    }

    // Require opening link first for social tasks with external url
    if (task.url && !openedTaskIds.includes(task.id)) {
      playWarning();
      const actionVerb = task.type === 'follow' ? 'FOLLOW ON X' : task.type === 'like_rt' ? 'LIKE & RT ON X' : task.type === 'reply' ? 'REPLY "XiLLA" ON X' : 'OPEN LINK';
      setVerificationError({
        taskId: task.id,
        message: `Please click [${actionVerb}] to open the transmission on X before verifying.`,
      });
      return;
    }

    playBlip(600);
    setExecutingTaskId(task.id);
    setExecutionMessage(`SCANNING X RADAR VIA DUMMY ACCOUNT FOR ${handle}...`);
    setVerificationError(null);

    try {
      const res = await fetch('/api/tasks/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          handle,
          taskId: task.id,
          openedTaskIds,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        playVictory();
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.7 },
          colors: ['#00F3FF', '#FF007A', '#00FF66'],
        });

        // Update local completed tasks and XP
        if (!completedTaskIds.includes(task.id)) {
          setCompletedTaskIds(prev => [...prev, task.id]);
        }
        if (data.totalXp) {
          setXp(data.totalXp);
        } else {
          setXp(prev => prev + task.xp);
        }

        setVerificationSuccessMessage(data.message || `MISSION VERIFIED: +${task.xp} XP`);
        setTimeout(() => setVerificationSuccessMessage(null), 4500);
      } else {
        playWarning();
        const errMsg = data.error || `Could not verify ${task.title} on X. Complete the task and click VERIFY again.`;
        setVerificationError({ taskId: task.id, message: errMsg });
      }
    } catch (e) {
      playWarning();
      setVerificationError({ taskId: task.id, message: `Radar communication error: ${e.message}. Please retry.` });
    } finally {
      setTimeout(() => {
        setExecutingTaskId(null);
        setExecutionMessage(null);
      }, 700);
    }
  };

  // Backward compatibility alias
  const executeTask = async (task) => {
    if (task.url && !openedTaskIds.includes(task.id)) {
      openTaskLink(task);
    }
    return verifyTask(task);
  };

  // Verify / Save EVM Wallet (Task 02)
  const saveWalletAddress = async (rawWallet) => {
    const clean = rawWallet.trim();
    const isEvm = /^0x[a-fA-F0-9]{40}$/.test(clean);

    if (!isEvm) {
      playWarning();
      return { 
        success: false, 
        error: 'Invalid EVM address. Address must start with 0x and be 42 hexadecimal characters.' 
      };
    }

    setWallet(clean);
    playVictory();

    if (!completedTaskIds.includes('task_wallet')) {
      const nextTasks = [...completedTaskIds, 'task_wallet'];
      setCompletedTaskIds(nextTasks);
      setXp(prev => prev + 200);
    }

    setIsWalletModalOpen(false);
    return { success: true };
  };

  // Submit Wallet (Alias for backward compatibility)
  const submitWallet = async (walletAddress) => {
    return saveWalletAddress(walletAddress);
  };

  // Register Full Whitelist Participation (Mandatory Final Step)
  const registerParticipation = async () => {
    if (!handle) {
      requireIdentity('REGISTER_PARTICIPATION');
      return { success: false, error: 'X handle is required.' };
    }

    if (!wallet || !/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
      playWarning();
      setIsWalletModalOpen(true);
      return { success: false, error: 'Valid EVM wallet address is required.' };
    }

    // Check mandatory missions
    const mandatoryTasks = tasks.filter(t => t.isMandatory === true);
    const mandatoryIds = mandatoryTasks.map(t => t.id);
    const userTasks = Array.from(new Set([...completedTaskIds, 'task_identity', 'task_wallet']));
    const missing = mandatoryIds.filter(id => !userTasks.includes(id));

    if (missing.length > 0) {
      playWarning();
      const missingTitles = tasks.filter(t => missing.includes(t.id)).map(t => t.title).join(', ');
      setVerificationError({
        message: `All 5 missions are mandatory before registration! Remaining: ${missingTitles}`,
      });
      return { success: false, error: `Please complete all 5 missions first.` };
    }

    try {
      const res = await fetch('/api/survivor/register-participation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          handle,
          wallet,
          completedTasks: userTasks,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setIsParticipationRegistered(true);
        setCompletedTaskIds(mandatoryIds);
        playVictory();
        confetti({
          particleCount: 160,
          spread: 120,
          origin: { y: 0.6 },
          colors: ['#00F3FF', '#FF007A', '#00FF66', '#FFE600'],
        });
        setVerificationSuccessMessage(data.message);
        fetchConfig();
        return { success: true, message: data.message };
      } else {
        playWarning();
        setVerificationError({ message: data.error || 'Registration failed.' });
        return { success: false, error: data.error };
      }
    } catch (err) {
      playWarning();
      setVerificationError({ message: 'Network error. Could not register participation.' });
      return { success: false, error: err.message };
    }
  };

  const skipBootSequence = () => {
    setShowBootSequence(false);
    playBlip(600);
  };

  return (
    <GameContext.Provider
      value={{
        showBootSequence,
        skipBootSequence,
        handle,
        setSurvivorHandle,
        switchSurvivorHandle,
        wallet,
        submitWallet,
        saveWalletAddress,
        registerParticipation,
        isParticipationRegistered,
        xp,
        completedTaskIds,
        tasks,
        fetchTasks,
        executingTaskId,
        executionMessage,
        executeTask,
        openedTaskIds,
        openTaskLink,
        verifyTask,
        verificationError,
        clearVerificationError,
        verificationSuccessMessage,
        spotsRemaining,
        totalSpots,
        holderSpotsTaken,
        registeredSurvivors,
        requireIdentity,
        isIdentityModalOpen,
        setIsIdentityModalOpen,
        isWalletModalOpen,
        setIsWalletModalOpen,
        isLeaderboardModalOpen,
        setIsLeaderboardModalOpen,
        selectedDistrict,
        setSelectedDistrict,
        identityPromptReason,
        projectConfig,
        fetchConfig,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export const useGame = () => useContext(GameContext);
