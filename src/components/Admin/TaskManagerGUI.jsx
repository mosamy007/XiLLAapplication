import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Check, X, AlertTriangle, Radio, Repeat, MessageSquare, Heart, Sparkles } from 'lucide-react';

export default function TaskManagerGUI({ adminToken, onTasksUpdated }) {
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    type: 'follow',
    xp: 250,
    url: '',
    targetHandle: '',
    color: 'cyan',
    category: 'TACTICAL',
  });

  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/admin/tasks', {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
        if (onTasksUpdated) onTasksUpdated();
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const openAddModal = () => {
    setEditingTask(null);
    setFormData({
      title: '',
      subtitle: '',
      type: 'repost',
      xp: 250,
      url: 'https://x.com/XiLLANFTs',
      targetHandle: '',
      color: 'pink',
      category: 'TACTICAL',
      isMandatory: false,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title || '',
      subtitle: task.subtitle || '',
      type: task.type || 'follow',
      xp: task.xp || 100,
      url: task.url || '',
      targetHandle: task.targetHandle || '',
      color: task.color || 'cyan',
      category: task.category || 'TACTICAL',
      isMandatory: task.isMandatory || false,
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingTask
        ? `/api/admin/tasks/${editingTask.id}`
        : '/api/admin/tasks';
      const method = editingTask ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchTasks();
        setStatusMessage(editingTask ? 'Mission updated successfully!' : 'New mission deployed!');
        setTimeout(() => setStatusMessage(''), 3000);
      }
    } catch (err) {
      alert('Error saving task');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('Are you sure you want to decommission this mission?')) return;

    try {
      const res = await fetch(`/api/admin/tasks/${taskId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      if (res.ok) {
        fetchTasks();
        setStatusMessage('Mission deleted.');
        setTimeout(() => setStatusMessage(''), 3000);
      } else {
        const data = await res.json();
        alert(data.error || 'Cannot delete task.');
      }
    } catch (err) {
      alert('Error deleting task');
    }
  };

  const handleToggleActive = async (task) => {
    const nextState = task.active === false ? true : false;
    try {
      await fetch(`/api/admin/tasks/${task.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ active: nextState }),
      });
      fetchTasks();
    } catch (err) {}
  };

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-800">
        <div>
          <h2 className="font-pixel text-base text-neon-cyan">MISSION MANAGEMENT CONSOLE</h2>
          <p className="font-tech text-xs text-gray-400">
            Create, update, or remove active missions. Changes propagate live across the website instantly.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="pixel-btn pixel-btn-pink text-xs py-2 px-4 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>+ ADD NEW MISSION</span>
        </button>
      </div>

      {statusMessage && (
        <div className="p-3 bg-neon-green/10 border-2 border-neon-green text-neon-green font-pixel text-xs">
          {statusMessage}
        </div>
      )}

      {/* Tasks Table */}
      <div className="overflow-x-auto border-2 border-gray-800 bg-cyber-dark">
        <table className="w-full text-left text-xs font-tech">
          <thead className="bg-cyber-black text-gray-400 font-pixel text-[9px] uppercase border-b border-gray-800">
            <tr>
              <th className="p-3">TYPE</th>
              <th className="p-3">MISSION TITLE</th>
              <th className="p-3">XP</th>
              <th className="p-3">TARGET URL</th>
              <th className="p-3 text-center">STATUS</th>
              <th className="p-3 text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-cyber-panel/60 transition-colors">
                <td className="p-3">
                  <span className="font-pixel text-[9px] px-2 py-0.5 border border-neon-cyan/50 text-neon-cyan uppercase">
                    {task.type}
                  </span>
                </td>
                <td className="p-3">
                  <div className="font-pixel text-[11px] text-white">{task.title}</div>
                  <div className="text-gray-400 text-xs truncate max-w-xs">{task.subtitle}</div>
                </td>
                <td className="p-3 font-pixel text-neon-green text-[10px]">
                  +{task.xp} XP
                </td>
                <td className="p-3 text-gray-300 truncate max-w-[180px]">
                  {task.url ? (
                    <a href={task.url} target="_blank" rel="noreferrer" className="text-neon-cyan hover:underline">
                      {task.url}
                    </a>
                  ) : (
                    <span className="text-gray-600">—</span>
                  )}
                </td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => handleToggleActive(task)}
                    className={`font-pixel text-[8px] px-2 py-1 border ${
                      task.active !== false
                        ? 'border-neon-green text-neon-green bg-neon-green/10'
                        : 'border-danger-red text-danger-red bg-danger-red/10'
                    }`}
                  >
                    {task.active !== false ? 'ACTIVE' : 'PAUSED'}
                  </button>
                </td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEditModal(task)}
                      className="p-1.5 text-gray-400 hover:text-neon-cyan border border-gray-700 bg-cyber-black"
                      title="Edit"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {task.id !== 'task_identity' && task.id !== 'task_wallet' && (
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="p-1.5 text-gray-400 hover:text-danger-red border border-gray-700 bg-cyber-black"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="relative w-full max-w-lg pixel-panel border-4 border-neon-pink bg-cyber-dark p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-800">
              <h3 className="font-pixel text-xs text-neon-pink">
                {editingTask ? 'EDIT MISSION SPECIFICATIONS' : 'DEPLOY NEW MISSION'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-3 font-tech text-xs">
              <div className="p-2.5 bg-neon-cyan/10 border border-neon-cyan/40 text-[11px] text-gray-300">
                <span className="text-neon-cyan font-bold">ℹ️ XP Collecting Mission:</span>
                <p className="mt-0.5">
                  Newly deployed missions award XP directly. Survivors who already secured their WL will NOT be asked to re-submit their wallet.
                </p>
              </div>

              <div>
                <label className="block font-pixel text-[9px] text-gray-300 uppercase mb-1">
                  MISSION TYPE:
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-cyber-black border-2 border-gray-700 p-2 text-white focus:border-neon-pink"
                >
                  <option value="follow">Follow Account on X</option>
                  <option value="repost">Repost / Retweet on X</option>
                  <option value="reply">Reply on a Post on X</option>
                  <option value="like">Like a Tweet on X</option>
                  <option value="recruit">Recruit Survivors (Referrals)</option>
                  <option value="classified">Classified Easter Egg Clue</option>
                  <option value="custom">Custom Tactical Action</option>
                </select>
              </div>

              <div>
                <label className="block font-pixel text-[9px] text-gray-300 uppercase mb-1">
                  TITLE:
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EMERGENCY BROADCAST"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-cyber-black border-2 border-gray-700 p-2 text-white focus:border-neon-pink"
                />
              </div>

              <div>
                <label className="block font-pixel text-[9px] text-gray-300 uppercase mb-1">
                  SUBTITLE / INSTRUCTIONS:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Retweet our announcement post to alert the city"
                  value={formData.subtitle}
                  onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                  className="w-full bg-cyber-black border-2 border-gray-700 p-2 text-white focus:border-neon-pink"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-pixel text-[9px] text-gray-300 uppercase mb-1">
                    XP REWARD:
                  </label>
                  <input
                    type="number"
                    min="50"
                    step="50"
                    required
                    value={formData.xp}
                    onChange={(e) => setFormData({ ...formData, xp: e.target.value })}
                    className="w-full bg-cyber-black border-2 border-gray-700 p-2 text-neon-green font-bold focus:border-neon-pink"
                  />
                </div>

                <div>
                  <label className="block font-pixel text-[9px] text-gray-300 uppercase mb-1">
                    THEME COLOR:
                  </label>
                  <select
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full bg-cyber-black border-2 border-gray-700 p-2 text-white focus:border-neon-pink"
                  >
                    <option value="cyan">Neon Cyan</option>
                    <option value="pink">Hot Pink</option>
                    <option value="yellow">Warning Yellow</option>
                    <option value="purple">Kaiju Purple</option>
                    <option value="green">Radioactive Green</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-pixel text-[9px] text-gray-300 uppercase mb-1">
                  TARGET URL (TWEET OR PROFILE):
                </label>
                <input
                  type="url"
                  placeholder="https://x.com/XiLLANFTs/status/..."
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  className="w-full bg-cyber-black border-2 border-gray-700 p-2 text-white focus:border-neon-pink"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 pixel-btn pixel-btn-outline text-xs py-2"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 pixel-btn pixel-btn-pink text-xs py-2"
                >
                  {loading ? 'SAVING...' : 'SAVE MISSION'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
