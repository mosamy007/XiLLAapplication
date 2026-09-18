import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from './db.js';
import { verifyTwitterFollow, verifyTwitterTask } from './twitterService.js';
import openseaService from './openseaService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'xilla_admin_2026';

app.use(cors());
app.use(express.json());

// Serve static assets if running in production
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// Middleware: Admin Auth
function adminAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const password = authHeader ? authHeader.replace(/^Bearer\s+/i, '') : req.query.password;
  
  if (!password || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'UNAUTHORIZED: Invalid Admin Security Key' });
  }
  next();
}

// Helper: Instant Discord Webhook Live Backup for submissions
async function backupToDiscord(handle, wallet, xp, status = 'WL_QUALIFIED') {
  const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
  if (!webhookUrl) return;

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'XiLLA WL Central Command',
        avatar_url: 'https://raw.githubusercontent.com/mosamy007/XiLLAapplication/main/public/assets/characters/kaiju-king.png',
        embeds: [{
          title: '🚨 NEW SURVIVOR WHITELISTED!',
          color: 0x00f3ff,
          fields: [
            { name: 'X Handle', value: handle, inline: true },
            { name: 'EVM Wallet', value: `\`${wallet}\``, inline: false },
            { name: 'Total XP', value: `${xp} XP`, inline: true },
            { name: 'Status', value: status, inline: true },
          ],
          timestamp: new Date().toISOString(),
        }],
      }),
    });
  } catch (err) {
    console.warn('[XiLLA Discord Webhook Backup Error]:', err.message);
  }
}

// ==========================================
// PUBLIC API ROUTES
// ==========================================

// 1. Get Project Config & Real OpenSea Holder Counts (Live via OpenSea API)
app.get('/api/config', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  const cfg = await db.getConfig();
  const submissions = await db.getSubmissions();
  
  // Query OpenSea Live Radar
  let web3CatHolders = cfg.web3CatHolders || 1059;
  let migglesHolders = cfg.migglesHolders || 1777;
  let internetMonkesHolders = cfg.internetMonkesHolders || 1068;
  let bangerBotsHolders = cfg.bangerBotsHolders || 1851;
  let holderSpotsTaken = web3CatHolders + migglesHolders + internetMonkesHolders + bangerBotsHolders;

  let collections = openseaService.MONITORED_COLLECTIONS;
  try {
    const liveStats = await openseaService.getLiveHolders();
    if (liveStats.web3CatHolders) web3CatHolders = liveStats.web3CatHolders;
    if (liveStats.migglesHolders) migglesHolders = liveStats.migglesHolders;
    if (liveStats.internetMonkesHolders) internetMonkesHolders = liveStats.internetMonkesHolders;
    if (liveStats.bangerBotsHolders) bangerBotsHolders = liveStats.bangerBotsHolders;
    if (liveStats.holderSpotsTaken) holderSpotsTaken = liveStats.holderSpotsTaken;
    if (liveStats.collections) collections = liveStats.collections;
  } catch (err) {
    console.warn('[XiLLA] OpenSea sync fallback:', err.message);
  }

  const total = cfg.wlTotal || 5333;
  const teamReservedSpots = cfg.teamReservedSpots !== undefined ? cfg.teamReservedSpots : 300;
  const totalReservedSpots = holderSpotsTaken + teamReservedSpots;
  
  // Registered survivors: ONLY those who actually submitted their WL registration!
  const registeredSurvivors = submissions.filter(
    s => Boolean(s.wallet && typeof s.wallet === 'string' && s.wallet.trim().length >= 20) &&
         (s.isRegistered === true || s.status === 'WL_QUALIFIED')
  ).length;

  // Live spots taken: capped at total (5,333)
  const spotsTaken = Math.min(total, totalReservedSpots + registeredSurvivors);
  const remaining = Math.max(0, total - spotsTaken);
  
  res.json({
    ...cfg,
    wlTotal: total,
    holderSpotsTaken,
    web3CatHolders,
    migglesHolders,
    internetMonkesHolders,
    bangerBotsHolders,
    teamReservedSpots,
    totalReservedSpots,
    collections,
    registeredSurvivors, // Live count of registered users ("Survivors")
    siteClaimed: registeredSurvivors,
    spotsTaken,
    wlRemaining: remaining,
  });
});

// 2. Get Public Active Tasks
app.get('/api/tasks', async (req, res) => {
  const tasks = await db.getTasks();
  res.json(tasks.filter(t => t.active !== false));
});

// 3. Verify Task Execution (No fake delays or blocks)
app.post('/api/tasks/verify', async (req, res) => {
  const { handle, taskId, openedTaskIds } = req.body;
  
  if (!handle) {
    return res.status(400).json({ error: 'Operational handle required.' });
  }

  const cleanHandle = handle.startsWith('@') ? handle : `@${handle}`;
  const tasks = await db.getTasks();
  const task = tasks.find(t => t.id === taskId);
  
  if (!task) {
    return res.status(404).json({ error: 'Mission not found.' });
  }

  try {
    const result = await verifyTwitterTask(cleanHandle, task, openedTaskIds || []);
    const verified = result.verified;

    if (verified) {
      // Record progress into submissions for the real leaderboard
      const submissions = await db.getSubmissions();
      let sub = submissions.find(s => s.handle.toLowerCase() === cleanHandle.toLowerCase());

      if (sub) {
        if (!sub.completedTasks.includes(task.id)) {
          sub.completedTasks.push(task.id);
          sub.xp = (sub.xp || 0) + task.xp;
        }
      } else {
        sub = {
          id: `sub_${Date.now()}`,
          handle: cleanHandle,
          wallet: '',
          xp: 100 + task.xp, // 100 for identity + task xp
          completedTasks: ['task_identity', task.id],
          status: 'SURVIVOR',
          submittedAt: new Date().toISOString(),
        };
        submissions.push(sub);
      }

      await db.saveSubmissions(submissions);

      res.json({
        success: true,
        taskId: task.id,
        xpEarned: task.xp,
        totalXp: sub.xp,
        message: result.message || `MISSION VERIFIED: +${task.xp} XP AWARDED`,
        details: result,
      });
    } else {
      res.status(400).json({
        success: false,
        error: result.error || `Could not verify @${cleanHandle} completed ${task.title}. Follow @XiLLANFTs on X and retry.`,
        details: result,
      });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Get Leaderboard (STRICTLY REAL DATA - NO MOCKS)
app.get('/api/leaderboard', async (req, res) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  const submissions = await db.getSubmissions();
  
  // Build rankings strictly from real survivors who ACTUALLY submitted their wallet!
  const realSurvivors = submissions
    .filter(s => 
      s.xp && s.xp > 0 &&
      Boolean(s.wallet && typeof s.wallet === 'string' && s.wallet.trim().length >= 20) &&
      (s.isRegistered === true || s.status === 'WL_QUALIFIED')
    )
    .map(s => ({
      handle: s.handle,
      xp: s.xp,
      status: s.xp >= 1500 ? 'ALPHA' : s.xp >= 500 ? 'KAIJU HUNTER' : 'HUNTER',
      statusColor: s.xp >= 1500 ? '#FF5500' : s.xp >= 500 ? '#FFE600' : '#00F3FF',
      avatar: '/assets/characters/kaiju-king.png',
      wallet: s.wallet || null,
      submittedAt: s.submittedAt || s.submitted_at || null,
    }));

  // Sort descending by XP, tie-break by submission timestamp (earliest submitted = rank 1)
  realSurvivors.sort((a, b) => {
    if (b.xp !== a.xp) {
      return b.xp - a.xp; // Higher XP first
    }
    // When XP is identical, the earliest one who submitted gets the higher rank (Rank 1, 2, 3...)
    const timeA = a.submittedAt ? new Date(a.submittedAt).getTime() : 0;
    const timeB = b.submittedAt ? new Date(b.submittedAt).getTime() : 0;
    return timeA - timeB; // Earliest timestamp first
  });
  
  // Assign real ranks 1, 2, 3...
  const ranked = realSurvivors.map((item, idx) => ({ ...item, rank: idx + 1 }));
  
  res.json(ranked);
});

// 5. Submit Wallet (Mandatory Final WL Step)
app.post('/api/survivor/submit-wallet', async (req, res) => {
  const { handle, wallet, xp, completedTasks } = req.body;

  if (!handle || !wallet) {
    return res.status(400).json({ error: 'Both X handle and Wallet Address are required.' });
  }

  const cleanHandle = handle.startsWith('@') ? handle : `@${handle}`;
  const cleanWallet = wallet.trim();

  if (cleanWallet.length < 20) {
    return res.status(400).json({ error: 'Invalid wallet address provided.' });
  }

  const submissions = await db.getSubmissions();
  const existingIdx = submissions.findIndex(
    s => s.handle.toLowerCase() === cleanHandle.toLowerCase()
  );

  const totalXP = xp || 500;
  const newEntry = {
    id: existingIdx >= 0 ? submissions[existingIdx].id : `sub_${Date.now()}`,
    handle: cleanHandle,
    wallet: cleanWallet,
    xp: totalXP,
    completedTasks: Array.from(new Set([...(completedTasks || []), 'task_wallet'])),
    status: 'WL_QUALIFIED',
    isRegistered: true,
    submittedAt: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    submissions[existingIdx] = { ...submissions[existingIdx], ...newEntry };
  } else {
    submissions.unshift(newEntry);
  }

  await db.saveSubmissions(submissions);

  console.log(`[XiLLA] Registered participation for ${cleanHandle} with EVM wallet ${cleanWallet} (XP: ${totalXP})`);
  backupToDiscord(cleanHandle, cleanWallet, totalXP, 'WL_QUALIFIED');

  res.json({
    success: true,
    message: 'WL SPOT SECURED! SURVIVOR STATUS CONFIRMED.',
    submission: newEntry,
  });
});

// 5b. Register Full Whitelist Participation (Requires all mandatory tasks)
app.post('/api/survivor/register-participation', async (req, res) => {
  const { handle, wallet, completedTasks } = req.body;

  if (!handle || !wallet) {
    return res.status(400).json({ error: 'Both X handle and EVM Wallet address are required.' });
  }

  const cleanHandle = handle.startsWith('@') ? handle : `@${handle}`;
  const cleanWallet = wallet.trim();

  // Validate EVM format (0x + 40 hex chars = 42 chars)
  const isEvm = /^0x[a-fA-F0-9]{40}$/.test(cleanWallet);
  if (!isEvm) {
    return res.status(400).json({ 
      error: 'Invalid EVM Wallet address. Address must start with 0x and be 42 characters long.' 
    });
  }

  const tasks = await db.getTasks();
  const mandatoryTasks = tasks.filter(t => t.isMandatory !== false);
  const mandatoryIds = mandatoryTasks.map(t => t.id);

  // Check that all mandatory missions are completed
  const userTasks = Array.from(new Set([...(completedTasks || []), 'task_identity', 'task_wallet']));
  const missing = mandatoryIds.filter(id => !userTasks.includes(id));

  if (missing.length > 0) {
    const missingTitles = tasks.filter(t => missing.includes(t.id)).map(t => t.title).join(', ');
    return res.status(400).json({
      error: `All missions are mandatory! Please complete and verify: ${missingTitles}`,
      missingTasks: missing,
    });
  }

  const submissions = await db.getSubmissions();
  const existingIdx = submissions.findIndex(
    s => s.handle.toLowerCase() === cleanHandle.toLowerCase()
  );

  const totalXP = tasks.reduce((sum, t) => sum + (t.xp || 0), 0);

  const newEntry = {
    id: existingIdx >= 0 ? submissions[existingIdx].id : `sub_${Date.now()}`,
    handle: cleanHandle,
    wallet: cleanWallet,
    xp: totalXP,
    completedTasks: mandatoryIds,
    status: 'WL_QUALIFIED',
    isRegistered: true,
    submittedAt: existingIdx >= 0 && submissions[existingIdx].submittedAt ? submissions[existingIdx].submittedAt : new Date().toISOString(),
    registeredAt: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    submissions[existingIdx] = { ...submissions[existingIdx], ...newEntry };
  } else {
    submissions.unshift(newEntry);
  }

  await db.saveSubmissions(submissions);

  console.log(`[XiLLA] Registered participation for ${cleanHandle} with EVM wallet ${cleanWallet} (XP: ${totalXP})`);
  backupToDiscord(cleanHandle, cleanWallet, totalXP, 'WL_QUALIFIED');

  res.json({
    success: true,
    message: '🎉 WL PARTICIPATION REGISTERED & SECURED! WELCOME TO XiLLA WHITELIST.',
    submission: newEntry,
  });
});

// 6. Get Survivor Profile By Handle (Isolated per X handle)
app.get('/api/survivor/:handle', async (req, res) => {
  const { handle } = req.params;
  const cleanHandle = handle.startsWith('@') ? handle : `@${handle}`;
  const submissions = await db.getSubmissions();
  const found = submissions.find(
    s => s.handle.toLowerCase() === cleanHandle.toLowerCase()
  );

  if (found) {
    res.json({
      exists: true,
      handle: found.handle,
      xp: found.xp || 100,
      completedTasks: found.completedTasks || ['task_identity'],
      wallet: found.wallet || '',
      status: found.status || 'SURVIVOR',
      isRegistered: Boolean(found.isRegistered === true || found.status === 'WL_QUALIFIED'),
      submittedAt: found.submittedAt,
    });
  } else {
    res.json({
      exists: false,
      handle: cleanHandle,
      xp: 100, // starting XP for Task 01: Operative Identity
      completedTasks: ['task_identity'],
      wallet: '',
      status: 'SURVIVOR',
      isRegistered: false,
    });
  }
});

// 7. Initialize / Register New Handle Profile
app.post('/api/survivor/init', async (req, res) => {
  const { handle } = req.body;
  if (!handle) {
    return res.status(400).json({ error: 'Operative handle required.' });
  }

  const cleanHandle = handle.startsWith('@') ? handle : `@${handle}`;
  const submissions = await db.getSubmissions();
  let sub = submissions.find(s => s.handle.toLowerCase() === cleanHandle.toLowerCase());

  if (!sub) {
    sub = {
      id: `sub_${Date.now()}`,
      handle: cleanHandle,
      wallet: '',
      xp: 100, // Task 01: Operative Identity
      completedTasks: ['task_identity'],
      status: 'SURVIVOR',
      isRegistered: false,
      submittedAt: new Date().toISOString(),
    };
    submissions.push(sub);
    await db.saveSubmissions(submissions);
    console.log(`[XiLLA] Initialized brand new profile for ${cleanHandle}`);
  }

  res.json({ success: true, survivor: sub });
});

// ==========================================
// ADMIN API ROUTES (Protected)
// ==========================================

app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true, token: ADMIN_PASSWORD, message: 'ADMIN ACCESS GRANTED' });
  } else {
    res.status(401).json({ success: false, error: 'ACCESS DENIED: Invalid Security Key' });
  }
});

// Reset All Submissions & Leaderboard (Requires Admin Password)
app.post('/api/admin/reset-all', async (req, res) => {
  const { password } = req.body;
  const authHeader = req.headers.authorization;
  const token = authHeader ? authHeader.replace('Bearer ', '').trim() : '';

  if (password !== ADMIN_PASSWORD && token !== ADMIN_PASSWORD) {
    return res.status(401).json({
      success: false,
      error: 'CRITICAL SECURITY BREACH: Invalid Admin Password. Reset rejected.',
    });
  }

  // 1. Wipe all submissions to start 100% clean
  await db.saveSubmissions([]);

  // 2. Reset config baseline to reserved spots (2,836 holder + 300 team = 3,136 reserved)
  const cfg = await db.getConfig();
  const resetCfg = {
    ...cfg,
    wlTotal: 5333,
    web3CatHolders: 1059,
    migglesHolders: 1777,
    holderSpotsTaken: 2836,
    teamReservedSpots: 300,
    wlRemaining: 2197,
  };
  await db.saveConfig(resetCfg);

  console.log('[XiLLA Admin] FACTORY RESET EXECUTED: All submissions purged. Baseline set to 2,836 reserved holder spots + 300 team spots.');

  res.json({
    success: true,
    message: 'FACTORY RESET COMPLETE: Leaderboard purged. All users cleared. Baseline set to 2,836 holder spots + 300 team spots (2,197 remaining).',
    config: resetCfg,
  });
});

app.get('/api/admin/stats', adminAuth, async (req, res) => {
  const submissions = await db.getSubmissions();
  // Filter strictly to submitted WL users
  const registeredSubs = submissions.filter(s => s.isRegistered === true || s.status === 'WL_QUALIFIED');
  const tasks = await db.getTasks();
  const totalXP = submissions.reduce((acc, s) => acc + (s.xp || 0), 0);

  let web3CatHolders = 1134;
  let migglesHolders = 1778;
  let holderSpotsTaken = 2912;

  try {
    const liveStats = await openseaService.getLiveHolders();
    if (liveStats.web3CatHolders) web3CatHolders = liveStats.web3CatHolders;
    if (liveStats.migglesHolders) migglesHolders = liveStats.migglesHolders;
    if (liveStats.holderSpotsTaken) holderSpotsTaken = liveStats.holderSpotsTaken;
  } catch (err) {}

  const cfg = await db.getConfig();
  const teamReservedSpots = cfg.teamReservedSpots !== undefined ? cfg.teamReservedSpots : 300;
  const totalReservedSpots = holderSpotsTaken + teamReservedSpots;
  const storageInfo = db.getStorageInfo ? db.getStorageInfo() : { persistent: true, provider: 'Standard' };
  
  res.json({
    totalSubmissions: registeredSubs.length,
    totalWallets: registeredSubs.filter(s => s.wallet).length,
    totalTasks: tasks.length,
    activeTasks: tasks.filter(t => t.active !== false).length,
    totalXPDistributed: totalXP,
    web3CatHolders,
    migglesHolders,
    holderSpotsTaken,
    teamReservedSpots,
    totalReservedSpots,
    storageInfo,
    lastSubmission: registeredSubs[0] || null,
  });
});

app.get('/api/admin/tasks', adminAuth, async (req, res) => {
  res.json(await db.getTasks());
});

app.post('/api/admin/tasks', adminAuth, async (req, res) => {
  const { title, subtitle, type, xp, url, targetHandle, icon, color, category, isMandatory } = req.body;
  
  if (!title || !xp) {
    return res.status(400).json({ error: 'Title and XP value are required.' });
  }

  const tasks = await db.getTasks();
  const newTask = {
    id: `task_${Date.now()}`,
    type: type || 'custom',
    title,
    subtitle: subtitle || '',
    xp: parseInt(xp, 10),
    url: url || '',
    targetHandle: targetHandle || '',
    icon: icon || 'radio',
    color: color || 'cyan',
    category: category || 'TACTICAL',
    active: true,
    order: tasks.length + 1,
    status: 'AVAILABLE',
    isMandatory: isMandatory !== undefined ? Boolean(isMandatory) : false, // New missions are XP collection missions
  };

  tasks.push(newTask);
  await db.saveTasks(tasks);

  res.json({ success: true, task: newTask });
});

app.put('/api/admin/tasks/:id', adminAuth, async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  
  const tasks = await db.getTasks();
  const idx = tasks.findIndex(t => t.id === id);
  
  if (idx === -1) {
    return res.status(404).json({ error: 'Task not found.' });
  }

  tasks[idx] = { ...tasks[idx], ...updates };
  await db.saveTasks(tasks);

  res.json({ success: true, task: tasks[idx] });
});

app.delete('/api/admin/tasks/:id', adminAuth, async (req, res) => {
  const { id } = req.params;
  let tasks = await db.getTasks();
  
  if (id === 'task_identity' || id === 'task_wallet') {
    return res.status(400).json({ error: 'Core system task cannot be deleted.' });
  }

  tasks = tasks.filter(t => t.id !== id);
  await db.saveTasks(tasks);

  res.json({ success: true, message: 'Task deleted.' });
});

app.get('/api/admin/submissions', adminAuth, async (req, res) => {
  const { search } = req.query;
  const allSubs = await db.getSubmissions();
  // STRICT: Only record and display users who actually clicked the submit button!
  let subs = allSubs.filter(s => s.isRegistered === true || s.status === 'WL_QUALIFIED');
  
  if (search) {
    const q = search.toLowerCase();
    subs = subs.filter(s => s.handle.toLowerCase().includes(q) || (s.wallet && s.wallet.toLowerCase().includes(q)));
  }

  res.json(subs);
});

// Import & Restore Survivors from Vercel Logs or Raw Text
app.post('/api/admin/submissions/import', adminAuth, async (req, res) => {
  const { rawText, entries } = req.body;
  let toImport = [];

  if (Array.isArray(entries)) {
    toImport = entries;
  } else if (typeof rawText === 'string') {
    // Intelligent Log & Text Parser:
    // Handles Vercel logs: "[XiLLA] Registered participation for @user with EVM wallet 0x123... (XP: 1400)"
    // Handles CSV/plain lines: "@user, 0x123..." or "@user 0x123..." or "0x123... @user"
    const lines = rawText.split('\n');
    for (const line of lines) {
      if (!line.trim()) continue;
      const handleMatch = line.match(/@([a-zA-Z0-9_]{1,15})/);
      const walletMatch = line.match(/(0x[a-fA-F0-9]{40})/i);
      const xpMatch = line.match(/XP:?\s*(\d+)/i);

      if (walletMatch) {
        const handle = handleMatch ? handleMatch[0] : `@survivor_${walletMatch[0].slice(2, 8)}`;
        const wallet = walletMatch[0];
        const xp = xpMatch ? parseInt(xpMatch[1], 10) : 1400;
        toImport.push({ handle, wallet, xp });
      }
    }
  }

  if (toImport.length === 0) {
    return res.status(400).json({ error: 'No valid EVM wallets or survivor handles found in the pasted content.' });
  }

  const existing = await db.getSubmissions();
  let addedCount = 0;
  let updatedCount = 0;

  for (const item of toImport) {
    const cleanHandle = item.handle.startsWith('@') ? item.handle : `@${item.handle}`;
    const cleanWallet = item.wallet.trim();

    const idx = existing.findIndex(
      s => s.handle.toLowerCase() === cleanHandle.toLowerCase() || 
           (s.wallet && s.wallet.toLowerCase() === cleanWallet.toLowerCase())
    );

    const record = {
      id: idx >= 0 ? existing[idx].id : `sub_restored_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      handle: cleanHandle,
      wallet: cleanWallet,
      xp: item.xp || 1400,
      completedTasks: ['task_identity', 'task_wallet', 'task_follow', 'task_like_rt', 'task_reply'],
      status: 'WL_QUALIFIED',
      isRegistered: true,
      submittedAt: idx >= 0 && existing[idx].submittedAt ? existing[idx].submittedAt : new Date().toISOString(),
      restoredAt: new Date().toISOString(),
    };

    if (idx >= 0) {
      existing[idx] = { ...existing[idx], ...record };
      updatedCount++;
    } else {
      existing.unshift(record);
      addedCount++;
    }
  }

  await db.saveSubmissions(existing);

  console.log(`[XiLLA Admin] Restored/Imported ${addedCount} new, ${updatedCount} updated survivors into database.`);

  res.json({
    success: true,
    message: `Restored ${addedCount} new survivors (${updatedCount} updated). Total in DB: ${existing.length}`,
    addedCount,
    updatedCount,
    totalSubmissions: existing.length,
  });
});

app.get('/api/admin/export-csv', adminAuth, async (req, res) => {
  // STRICT: Only export users who actually clicked the submit button!
  const allSubs = await db.getSubmissions();
  const subs = allSubs.filter(s => s.isRegistered === true || s.status === 'WL_QUALIFIED');
  
  let csv = 'Index,X_Handle,Wallet_Address,XP,Status,Tasks_Completed,Timestamp\n';
  subs.forEach((s, idx) => {
    const tasksCount = Array.isArray(s.completedTasks) ? s.completedTasks.length : 0;
    csv += `${idx + 1},"${s.handle}","${s.wallet || ''}",${s.xp || 0},"${s.status || 'WL_QUALIFIED'}",${tasksCount},"${s.submittedAt}"\n`;
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="xilla_wl_survivors.csv"');
  res.status(200).send(csv);
});

// Admin Configuration & Content Management Endpoints
app.get('/api/admin/config', adminAuth, async (req, res) => {
  res.json(await db.getConfig());
});

app.post('/api/admin/config', adminAuth, async (req, res) => {
  const current = await db.getConfig();
  const updated = { ...current, ...req.body };
  await db.saveConfig(updated);
  res.json({ success: true, message: 'Configuration saved successfully.', config: updated });
});

// Update Stages (The Arrival)
app.post('/api/admin/stages', adminAuth, async (req, res) => {
  const { stages } = req.body;
  if (!Array.isArray(stages)) {
    return res.status(400).json({ error: 'Stages must be an array.' });
  }
  const current = await db.getConfig();
  current.stages = stages;
  await db.saveConfig(current);
  res.json({ success: true, message: 'The Arrival stages updated successfully.', stages });
});

// Update Ecosystem & Social Links
app.post('/api/admin/links', adminAuth, async (req, res) => {
  const { links } = req.body;
  if (!links || typeof links !== 'object') {
    return res.status(400).json({ error: 'Links object is required.' });
  }
  const current = await db.getConfig();
  current.links = { ...(current.links || {}), ...links };
  await db.saveConfig(current);
  res.json({ success: true, message: 'Ecosystem links updated successfully.', links: current.links });
});

app.get('*', (req, res) => {
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      res.status(200).send('XiLLA API Server Running.');
    }
  });
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[XiLLA] Emergency Server broadcasting on port ${PORT}`);
  });
}

export default app;
