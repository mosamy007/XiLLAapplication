import React, { useState, useEffect } from 'react';
import TaskManagerGUI from './TaskManagerGUI';
import { 
  Shield, Download, RefreshCw, LogOut, ArrowLeft, Search, 
  Check, Copy, Users, Wallet, Zap, Layers, Trash2, AlertTriangle, 
  X, Key, Globe, Plus, ToggleLeft, ToggleRight, ExternalLink, Sparkles, MessageSquare
} from 'lucide-react';

export default function AdminDashboard({ adminToken, onLogout }) {
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks' | 'submissions' | 'stages' | 'links'
  const [stats, setStats] = useState({
    totalSubmissions: 0,
    totalTasks: 0,
    activeTasks: 0,
    totalXPDistributed: 0,
  });
  const [submissions, setSubmissions] = useState([]);
  const [search, setSearch] = useState('');
  const [copiedWallet, setCopiedWallet] = useState(null);

  // Stages State (The Arrival)
  const [stages, setStages] = useState([]);
  const [stagesMessage, setStagesMessage] = useState('');
  const [isSavingStages, setIsSavingStages] = useState(false);

  // Ecosystem Links State
  const [links, setLinks] = useState({
    opensea: '',
    discord: '',
    twitter: '',
    telegram: '',
  });
  const [linksMessage, setLinksMessage] = useState('');
  const [isSavingLinks, setIsSavingLinks] = useState(false);

  // Factory Reset State
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetPassword, setResetPassword] = useState('');
  const [resetError, setResetError] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState('');

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (e) {}
  };

  const fetchSubmissions = async () => {
    try {
      const res = await fetch('/api/admin/submissions', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data);
      }
    } catch (e) {}
  };

  const fetchConfig = async () => {
    try {
      const res = await fetch('/api/admin/config', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.stages)) {
          setStages(data.stages);
        }
        if (data.links && typeof data.links === 'object') {
          setLinks({
            opensea: data.links.opensea || '',
            discord: data.links.discord || '',
            twitter: data.links.twitter || 'https://x.com/XiLLANFTs',
            telegram: data.links.telegram || '',
          });
        }
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchStats();
    fetchSubmissions();
    fetchConfig();
  }, []);

  const handleExportCSV = () => {
    fetch('/api/admin/export-csv', {
      headers: { Authorization: `Bearer ${adminToken}` },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `xilla_wl_survivors_${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch(() => alert('Export failed'));
  };

  // Save The Arrival Stages
  const handleSaveStages = async () => {
    setIsSavingStages(true);
    setStagesMessage('');
    try {
      const res = await fetch('/api/admin/stages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ stages }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStagesMessage('✓ The Arrival stages successfully saved & published!');
        setTimeout(() => setStagesMessage(''), 4000);
      } else {
        setStagesMessage(`Error: ${data.error || 'Failed to save stages'}`);
      }
    } catch (err) {
      setStagesMessage('Network error saving stages.');
    } finally {
      setIsSavingStages(false);
    }
  };

  const handleToggleStageActive = (idx) => {
    const updated = [...stages];
    updated[idx].active = updated[idx].active === false ? true : false;
    setStages(updated);
  };

  const handleUpdateStageField = (idx, field, val) => {
    const updated = [...stages];
    updated[idx] = { ...updated[idx], [field]: val };
    setStages(updated);
  };

  const handleAddStage = () => {
    const newStage = {
      id: `stage_${Date.now()}`,
      stageNumber: stages.length + 1,
      title: 'NEW STAGE',
      status: 'UPCOMING',
      desc: 'Stage description details for survivors.',
      active: true,
    };
    setStages([...stages, newStage]);
  };

  const handleDeleteStage = (idx) => {
    if (confirm('Are you sure you want to delete this stage?')) {
      const updated = stages.filter((_, i) => i !== idx);
      // Re-number
      updated.forEach((s, i) => s.stageNumber = i + 1);
      setStages(updated);
    }
  };

  // Save Ecosystem & Social Links
  const handleSaveLinks = async (e) => {
    e.preventDefault();
    setIsSavingLinks(true);
    setLinksMessage('');
    try {
      const res = await fetch('/api/admin/links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ links }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setLinksMessage('✓ Ecosystem links successfully updated! Blank links will stay hidden for users.');
        setTimeout(() => setLinksMessage(''), 4500);
      } else {
        setLinksMessage(`Error: ${data.error || 'Failed to save links'}`);
      }
    } catch (err) {
      setLinksMessage('Network error saving links.');
    } finally {
      setIsSavingLinks(false);
    }
  };

  const handleResetAll = async (e) => {
    e.preventDefault();
    if (!resetPassword) {
      setResetError('Master admin password is required.');
      return;
    }
    setIsResetting(true);
    setResetError('');
    try {
      const res = await fetch('/api/admin/reset-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ password: resetPassword }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setResetSuccess(data.message);
        setSubmissions([]);
        fetchStats();

        // Clear local storage profile keys for clean browser testing
        Object.keys(localStorage).forEach((key) => {
          if (
            key.startsWith('xilla_profile_') ||
            key === 'xilla_user_handle' ||
            key === 'xilla_user_xp' ||
            key === 'xilla_completed_tasks' ||
            key === 'xilla_user_wallet'
          ) {
            localStorage.removeItem(key);
          }
        });

        setTimeout(() => {
          setIsResetModalOpen(false);
          setResetSuccess('');
          setResetPassword('');
        }, 2200);
      } else {
        setResetError(data.error || 'Authorization failed. Incorrect Admin Password.');
      }
    } catch (err) {
      setResetError('Communication error. Could not execute reset.');
    } finally {
      setIsResetting(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedWallet(text);
    setTimeout(() => setCopiedWallet(null), 2000);
  };

  const filteredSubmissions = submissions.filter(
    (s) =>
      s.handle.toLowerCase().includes(search.toLowerCase()) ||
      s.wallet.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-cyber-black text-gray-100 p-4 sm:p-8 font-tech">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Command Bar */}
        <div className="pixel-panel p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 border-2 border-neon-cyan bg-neon-cyan/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-neon-cyan" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-pixel text-sm sm:text-base text-neon-cyan glow-text-cyan">
                  XiLLA COMMAND TERMINAL
                </h1>
                <span className="font-pixel text-[8px] bg-neon-green/20 text-neon-green border border-neon-green px-1.5 py-0.5">
                  AUTHORIZED
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Live Mission Control, The Arrival Stages & Ecosystem Links
              </p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2.5">
            <a
              href="/"
              className="font-pixel text-[10px] text-gray-300 hover:text-neon-cyan px-3 py-2 border border-gray-700 bg-cyber-dark flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>MAIN SITE</span>
            </a>

            <button
              onClick={() => { fetchStats(); fetchSubmissions(); fetchConfig(); }}
              className="font-pixel text-[10px] text-gray-300 hover:text-neon-yellow px-3 py-2 border border-gray-700 bg-cyber-dark flex items-center gap-1.5 cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>REFRESH</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="pixel-btn pixel-btn-pink text-[10px] py-2 px-3.5 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>EXPORT WL TO CSV</span>
            </button>

            <button
              onClick={() => {
                setResetError('');
                setResetSuccess('');
                setResetPassword('');
                setIsResetModalOpen(true);
              }}
              className="pixel-btn bg-danger-red/15 border border-danger-red text-danger-red hover:bg-danger-red hover:text-white text-[10px] py-2 px-3 flex items-center gap-1.5 shadow-[0_0_8px_rgba(255,0,51,0.3)] transition-all cursor-pointer"
              title="Factory reset leaderboard and stats to 2,836 reserved spots"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>RESET LEADERBOARD</span>
            </button>

            <button
              onClick={onLogout}
              className="p-2 text-danger-red border border-danger-red/50 hover:bg-danger-red/10 cursor-pointer"
              title="Lock Console"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Stats Metrics Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-cyber-dark border-2 border-neon-cyan/50">
            <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
              <span className="font-pixel text-[9px]">WL SUBMISSIONS</span>
              <Wallet className="w-4 h-4 text-neon-cyan" />
            </div>
            <div className="font-pixel text-xl text-white">
              {stats.totalSubmissions || submissions.length}
            </div>
            <p className="text-[11px] text-gray-500 mt-1">Verified wallet addresses</p>
          </div>

          <div className="p-4 bg-cyber-dark border-2 border-neon-pink/50">
            <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
              <span className="font-pixel text-[9px]">ACTIVE MISSIONS</span>
              <Layers className="w-4 h-4 text-neon-pink" />
            </div>
            <div className="font-pixel text-xl text-neon-pink">
              {stats.activeTasks || stats.totalTasks || 5}
            </div>
            <p className="text-[11px] text-gray-500 mt-1">Live tasks on frontend</p>
          </div>

          <div className="p-4 bg-cyber-dark border-2 border-neon-yellow/50">
            <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
              <span className="font-pixel text-[9px]">XP DISTRIBUTED</span>
              <Zap className="w-4 h-4 text-neon-yellow" />
            </div>
            <div className="font-pixel text-xl text-neon-yellow">
              {stats.totalXPDistributed.toLocaleString()}
            </div>
            <p className="text-[11px] text-gray-500 mt-1">Earned by city survivors</p>
          </div>

          <div className="p-4 bg-cyber-dark border-2 border-neon-green/50">
            <div className="flex items-center justify-between text-gray-400 text-xs mb-1">
              <span className="font-pixel text-[9px]">WL SPOTS REMAINING</span>
              <Users className="w-4 h-4 text-neon-green" />
            </div>
            <div className="font-pixel text-xl text-neon-green">
              {Math.max(0, 5333 - 2836 - (stats.totalSubmissions || submissions.length)).toLocaleString()}
            </div>
            <p className="text-[11px] text-gray-500 mt-1">Out of 5,333 (2,836 reserved for holders)</p>
          </div>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-2 border-b-2 border-gray-800 flex-wrap">
          <button
            onClick={() => setActiveTab('tasks')}
            className={`font-pixel text-xs py-2.5 px-4 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'tasks'
                ? 'border-neon-cyan text-neon-cyan bg-cyber-panel'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            MISSIONS MANAGEMENT (GUI)
          </button>
          <button
            onClick={() => setActiveTab('submissions')}
            className={`font-pixel text-xs py-2.5 px-4 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'submissions'
                ? 'border-neon-pink text-neon-pink bg-cyber-panel'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            WL SUBMISSIONS ({submissions.length})
          </button>
          <button
            onClick={() => setActiveTab('stages')}
            className={`font-pixel text-xs py-2.5 px-4 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'stages'
                ? 'border-neon-green text-neon-green bg-cyber-panel'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            THE ARRIVAL (STAGES)
          </button>
          <button
            onClick={() => setActiveTab('links')}
            className={`font-pixel text-xs py-2.5 px-4 border-b-2 transition-colors cursor-pointer ${
              activeTab === 'links'
                ? 'border-neon-yellow text-neon-yellow bg-cyber-panel'
                : 'border-transparent text-gray-400 hover:text-white'
            }`}
          >
            ECOSYSTEM LINKS
          </button>
        </div>

        {/* Tab 1: Mission Management */}
        {activeTab === 'tasks' && (
          <div className="pixel-panel p-6 border-neon-cyan">
            <TaskManagerGUI adminToken={adminToken} onTasksUpdated={fetchStats} />
          </div>
        )}

        {/* Tab 2: Submissions & CSV View */}
        {activeTab === 'submissions' && (
          <div className="pixel-panel p-6 border-neon-pink space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-pixel text-sm text-neon-pink">WHITELIST SURVIVOR ALLOCATIONS</h2>
                <p className="text-xs text-gray-400">
                  Exportable list of survivors who have executed tasks and bound their wallets.
                </p>
              </div>

              {/* Search */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search handle or wallet..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-cyber-black text-white pl-9 pr-3 py-2 border-2 border-gray-700 text-xs focus:border-neon-pink"
                />
              </div>
            </div>

            {/* Submissions Table */}
            <div className="overflow-x-auto border-2 border-gray-800 bg-cyber-dark">
              <table className="w-full text-left text-xs">
                <thead className="bg-cyber-black text-gray-400 font-pixel text-[9px] uppercase border-b border-gray-800">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">X HANDLE</th>
                    <th className="p-3">WALLET ADDRESS</th>
                    <th className="p-3 text-right">XP</th>
                    <th className="p-3 text-center">STATUS</th>
                    <th className="p-3 text-right">TIMESTAMP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {filteredSubmissions.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="p-8 text-center text-gray-500 font-pixel text-xs">
                        NO SUBMISSIONS MATCHING CRITERIA
                      </td>
                    </tr>
                  ) : (
                    filteredSubmissions.map((s, idx) => (
                      <tr key={s.id || idx} className="hover:bg-cyber-panel/60 transition-colors">
                        <td className="p-3 font-pixel text-[10px] text-gray-500">
                          {idx + 1}
                        </td>
                        <td className="p-3 font-bold text-white">
                          <a
                            href={`https://x.com/${s.handle.replace('@', '')}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-neon-cyan hover:underline"
                          >
                            {s.handle}
                          </a>
                        </td>
                        <td className="p-3 font-mono text-gray-300 flex items-center gap-2">
                          <span>{s.wallet}</span>
                          <button
                            onClick={() => copyToClipboard(s.wallet)}
                            title="Copy Wallet"
                            className="text-gray-500 hover:text-neon-green"
                          >
                            {copiedWallet === s.wallet ? (
                              <Check className="w-3.5 h-3.5 text-neon-green" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </td>
                        <td className="p-3 text-right font-pixel text-[10px] text-neon-yellow">
                          {(s.xp || 0).toLocaleString()} XP
                        </td>
                        <td className="p-3 text-center font-pixel text-[8px]">
                          <span className="px-2 py-0.5 border border-neon-green text-neon-green bg-neon-green/10">
                            {s.status || 'QUALIFIED'}
                          </span>
                        </td>
                        <td className="p-3 text-right text-gray-400 text-[11px]">
                          {s.submittedAt ? new Date(s.submittedAt).toLocaleDateString() : 'N/A'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: The Arrival Stages Management */}
        {activeTab === 'stages' && (
          <div className="pixel-panel p-6 border-neon-green space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-gray-800">
              <div>
                <h2 className="font-pixel text-sm text-neon-green">THE ARRIVAL // STAGES & ROADMAP CONTROL</h2>
                <p className="text-xs text-gray-400">
                  Activate, deactivate, or edit the stages displayed in THE ARRIVAL progression timeline on the main site.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleAddStage}
                  className="pixel-btn text-[10px] py-2 px-3 bg-cyber-dark border border-neon-cyan text-neon-cyan hover:bg-neon-cyan hover:text-cyber-black flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ADD STAGE</span>
                </button>
                <button
                  type="button"
                  onClick={handleSaveStages}
                  disabled={isSavingStages}
                  className="pixel-btn text-xs py-2.5 px-4 bg-neon-green border-2 border-neon-green text-cyber-black font-bold hover:bg-white hover:border-white shadow-[0_0_12px_rgba(0,255,102,0.5)] cursor-pointer"
                >
                  {isSavingStages ? 'SAVING...' : 'SAVE ALL STAGES'}
                </button>
              </div>
            </div>

            {stagesMessage && (
              <div className="p-3 border-2 border-neon-green bg-neon-green/15 text-neon-green font-tech text-xs font-bold">
                {stagesMessage}
              </div>
            )}

            {/* Stages Grid */}
            <div className="space-y-4">
              {stages.map((stg, idx) => {
                const isActive = stg.active !== false;
                return (
                  <div
                    key={stg.id || idx}
                    className={`p-4 border-2 bg-cyber-dark transition-all space-y-3 ${
                      isActive ? 'border-gray-700' : 'border-gray-800 opacity-60'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-gray-800">
                      <div className="flex items-center gap-3">
                        <span className="font-pixel text-xs text-neon-green">
                          STAGE 0{stg.stageNumber || idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleToggleStageActive(idx)}
                          className={`font-pixel text-[9px] px-2 py-0.5 border flex items-center gap-1 cursor-pointer ${
                            isActive
                              ? 'border-neon-green text-neon-green bg-neon-green/10'
                              : 'border-gray-600 text-gray-500 bg-gray-900'
                          }`}
                        >
                          {isActive ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                          <span>{isActive ? 'ACTIVE ON SITE' : 'DEACTIVATED'}</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                        {/* Status Select */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-gray-400 text-xs font-tech">Status:</span>
                          <select
                            value={stg.status}
                            onChange={(e) => handleUpdateStageField(idx, 'status', e.target.value)}
                            className="bg-cyber-black text-neon-cyan border border-neon-cyan/50 text-xs px-2 py-1 font-tech focus:outline-none"
                          >
                            <option value="COMPLETE">COMPLETE (Done)</option>
                            <option value="CURRENT PHASE">CURRENT PHASE (Active)</option>
                            <option value="UPCOMING">UPCOMING (Pending)</option>
                            <option value="FINAL PROTOCOL">FINAL PROTOCOL (Mint)</option>
                          </select>
                        </div>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => handleDeleteStage(idx)}
                          className="p-1 text-gray-500 hover:text-danger-red cursor-pointer"
                          title="Delete stage"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-gray-400 font-tech text-[11px] mb-1">
                          Stage Title:
                        </label>
                        <input
                          type="text"
                          value={stg.title}
                          onChange={(e) => handleUpdateStageField(idx, 'title', e.target.value)}
                          className="w-full bg-cyber-black text-white px-3 py-1.5 border border-gray-700 font-pixel text-xs focus:border-neon-green focus:outline-none"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-gray-400 font-tech text-[11px] mb-1">
                          Description:
                        </label>
                        <input
                          type="text"
                          value={stg.desc}
                          onChange={(e) => handleUpdateStageField(idx, 'desc', e.target.value)}
                          className="w-full bg-cyber-black text-white px-3 py-1.5 border border-gray-700 font-tech text-xs focus:border-neon-green focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 4: Ecosystem & Social Links */}
        {activeTab === 'links' && (
          <div className="pixel-panel p-6 border-neon-yellow space-y-6">
            <div className="pb-4 border-b border-gray-800">
              <h2 className="font-pixel text-sm text-neon-yellow">ECOSYSTEM & SOCIAL PLATFORM LINKS</h2>
              <p className="text-xs text-gray-400 mt-1">
                Configure your official community and marketplace links. Added links will automatically appear on the website.
              </p>
            </div>

            {linksMessage && (
              <div className="p-3 border-2 border-neon-green bg-neon-green/15 text-neon-green font-tech text-xs font-bold">
                {linksMessage}
              </div>
            )}

            <form onSubmit={handleSaveLinks} className="space-y-5 max-w-2xl">
              {/* Notice Banner */}
              <div className="p-3 bg-neon-cyan/10 border border-neon-cyan/50 text-xs text-gray-300 font-tech leading-relaxed">
                <span className="text-neon-cyan font-bold">ℹ️ Automatic Clean Display Rule:</span>
                <p className="mt-0.5">
                  Any link left blank will <strong>never show an empty button</strong> on the website. If you haven't created your OpenSea, Discord, or Telegram yet, simply leave them empty and the site will only display your active channels.
                </p>
              </div>

              {/* OpenSea Link */}
              <div>
                <label className="block font-pixel text-[11px] text-neon-cyan mb-1.5 flex items-center gap-2">
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>OpenSea Collection Link:</span>
                </label>
                <input
                  type="url"
                  placeholder="https://opensea.io/collection/xilla..."
                  value={links.opensea || ''}
                  onChange={(e) => setLinks({ ...links, opensea: e.target.value })}
                  className="w-full bg-cyber-black text-white px-3 py-2 border-2 border-gray-700 text-xs font-mono focus:border-neon-cyan focus:outline-none"
                />
              </div>

              {/* Discord Link */}
              <div>
                <label className="block font-pixel text-[11px] text-neon-pink mb-1.5 flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Discord Server Invite Link:</span>
                </label>
                <input
                  type="url"
                  placeholder="https://discord.gg/xilla..."
                  value={links.discord || ''}
                  onChange={(e) => setLinks({ ...links, discord: e.target.value })}
                  className="w-full bg-cyber-black text-white px-3 py-2 border-2 border-gray-700 text-xs font-mono focus:border-neon-pink focus:outline-none"
                />
              </div>

              {/* Official X (Twitter) Link */}
              <div>
                <label className="block font-pixel text-[11px] text-neon-green mb-1.5 flex items-center gap-2">
                  <Globe className="w-3.5 h-3.5" />
                  <span>Official X (Twitter) Link:</span>
                </label>
                <input
                  type="url"
                  placeholder="https://x.com/XiLLANFTs"
                  value={links.twitter || ''}
                  onChange={(e) => setLinks({ ...links, twitter: e.target.value })}
                  className="w-full bg-cyber-black text-white px-3 py-2 border-2 border-gray-700 text-xs font-mono focus:border-neon-green focus:outline-none"
                />
              </div>

              {/* Telegram Link */}
              <div>
                <label className="block font-pixel text-[11px] text-neon-yellow mb-1.5 flex items-center gap-2">
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Telegram Community Link:</span>
                </label>
                <input
                  type="url"
                  placeholder="https://t.me/xillanfts..."
                  value={links.telegram || ''}
                  onChange={(e) => setLinks({ ...links, telegram: e.target.value })}
                  className="w-full bg-cyber-black text-white px-3 py-2 border-2 border-gray-700 text-xs font-mono focus:border-neon-yellow focus:outline-none"
                />
              </div>

              <div className="pt-3">
                <button
                  type="submit"
                  disabled={isSavingLinks}
                  className="pixel-btn text-xs py-3 px-6 bg-neon-yellow border-2 border-neon-yellow text-cyber-black font-bold hover:bg-white hover:border-white shadow-[0_0_12px_rgba(255,230,0,0.5)] cursor-pointer"
                >
                  {isSavingLinks ? 'SAVING LINKS...' : 'SAVE ECOSYSTEM LINKS'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Factory System Reset Password-Protected Modal */}
        {isResetModalOpen && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
            <div className="relative w-full max-w-md pixel-panel border-4 border-danger-red bg-cyber-dark p-6 shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 mb-4 border-b-2 border-danger-red/40">
                <div className="flex items-center gap-2 text-danger-red font-pixel text-xs">
                  <AlertTriangle className="w-4 h-4 text-danger-red animate-pulse" />
                  <span>CRITICAL: FACTORY SYSTEM RESET</span>
                </div>
                <button
                  onClick={() => setIsResetModalOpen(false)}
                  className="text-gray-400 hover:text-white p-1 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Warning Notice */}
              <div className="p-3 mb-4 bg-danger-red/10 border-2 border-danger-red text-gray-200 text-xs space-y-2">
                <p className="font-pixel text-danger-red text-[10px]">⚠️ IRREVERSIBLE OPERATION</p>
                <p className="text-gray-300 leading-relaxed">
                  This operation will permanently wipe all survivor submissions, reset the leaderboard to empty, and restore our clean zero baseline:
                </p>
                <ul className="list-disc list-inside font-tech text-gray-400 text-[11px] space-y-1">
                  <li><strong>2,836 spots reserved</strong> for Web3 Cats (1,059) & Miggles (1,777) holders</li>
                  <li><strong>2,497 public spots remaining</strong> out of 5,333 total supply</li>
                  <li>All submitted wallets and XP scores purged from the database</li>
                </ul>
              </div>

              {resetSuccess ? (
                <div className="p-3 bg-neon-green/20 border-2 border-neon-green text-neon-green text-xs font-tech font-bold text-center animate-pulse">
                  ✓ {resetSuccess}
                </div>
              ) : (
                <form onSubmit={handleResetAll} className="space-y-4">
                  <div>
                    <label className="block font-pixel text-[10px] text-danger-red uppercase mb-1.5 flex items-center gap-1">
                      <Key className="w-3.5 h-3.5" />
                      <span>Enter Admin Password to Authorize:</span>
                    </label>
                    <input
                      type="password"
                      autoFocus
                      placeholder="Enter master admin password..."
                      value={resetPassword}
                      onChange={(e) => { setResetPassword(e.target.value); setResetError(''); }}
                      className="w-full bg-cyber-black text-white font-tech text-sm px-3 py-2.5 border-2 border-danger-red focus:outline-none focus:shadow-[0_0_10px_rgba(255,0,51,0.6)]"
                    />
                    {resetError && (
                      <p className="text-danger-red text-xs mt-1.5 font-tech font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>{resetError}</span>
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsResetModalOpen(false)}
                      className="flex-1 py-2.5 font-pixel text-[10px] text-gray-400 hover:text-white border border-gray-700 bg-cyber-black cursor-pointer"
                    >
                      ABORT
                    </button>
                    <button
                      type="submit"
                      disabled={isResetting}
                      className="flex-1 py-2.5 pixel-btn bg-danger-red border-2 border-danger-red text-white hover:bg-white hover:text-danger-red font-pixel text-[10px] flex items-center justify-center gap-1.5 shadow-[0_0_12px_rgba(255,0,51,0.5)] cursor-pointer"
                    >
                      {isResetting ? (
                        <span>PURGING...</span>
                      ) : (
                        <>
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>CONFIRM PURGE</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
