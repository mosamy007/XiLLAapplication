import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');

// In-memory cache to minimize external roundtrips and support local dev
const memoryStore = new Map();

function getFilePath(filename) {
  return path.join(DATA_DIR, filename);
}

// Identify active storage provider
function getStorageConfig() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (supabaseUrl && supabaseKey) {
    return { type: 'SUPABASE', url: supabaseUrl, key: supabaseKey };
  }

  const kvUrl = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const kvToken = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  
  if (kvUrl && kvToken) {
    return { type: 'VERCEL_KV', url: kvUrl, token: kvToken };
  }
  
  if (process.env.VERCEL) {
    return { type: 'EPHEMERAL_VERCEL' };
  }

  return { type: 'LOCAL_FILE' };
}

// -------------------------------------------------------------
// SUPABASE POSTGRESQL REST API INTEGRATION
// -------------------------------------------------------------
async function supabaseGetSubmissions() {
  const cfg = getStorageConfig();
  if (cfg.type !== 'SUPABASE') return null;

  try {
    const res = await fetch(`${cfg.url}/rest/v1/submissions?select=*&order=submitted_at.desc`, {
      headers: {
        apikey: cfg.key,
        Authorization: `Bearer ${cfg.key}`,
      },
    });

    if (res.ok) {
      const rows = await res.json();
      return rows.map((r) => ({
        id: r.id,
        handle: r.handle,
        wallet: r.wallet,
        xp: r.xp,
        completedTasks: r.completed_tasks || [],
        status: r.status || 'WL_QUALIFIED',
        isRegistered: r.is_registered !== false,
        submittedAt: r.submitted_at || r.created_at || new Date().toISOString(),
      }));
    }
  } catch (err) {
    console.warn('[Supabase getSubmissions error]', err.message);
  }
  return null;
}

async function supabaseSaveSubmissions(subs) {
  const cfg = getStorageConfig();
  if (cfg.type !== 'SUPABASE') return false;

  try {
    if (!Array.isArray(subs) || subs.length === 0) {
      await fetch(`${cfg.url}/rest/v1/submissions?id=neq.none`, {
        method: 'DELETE',
        headers: {
          apikey: cfg.key,
          Authorization: `Bearer ${cfg.key}`,
        },
      });
      return true;
    }

    const rows = subs.map((s) => ({
      id: s.id,
      handle: s.handle,
      wallet: s.wallet,
      xp: s.xp || 1400,
      completed_tasks: s.completedTasks || [],
      status: s.status || 'WL_QUALIFIED',
      is_registered: s.isRegistered !== false,
      submitted_at: s.submittedAt || new Date().toISOString(),
    }));

    const res = await fetch(`${cfg.url}/rest/v1/submissions`, {
      method: 'POST',
      headers: {
        apikey: cfg.key,
        Authorization: `Bearer ${cfg.key}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify(rows),
    });

    return res.ok;
  } catch (err) {
    console.warn('[Supabase saveSubmissions error]', err.message);
    return false;
  }
}

async function supabaseGetStore(key, defaultValue) {
  const cfg = getStorageConfig();
  if (cfg.type !== 'SUPABASE') return null;

  try {
    const res = await fetch(`${cfg.url}/rest/v1/xilla_store?key=eq.${key}&select=*`, {
      headers: {
        apikey: cfg.key,
        Authorization: `Bearer ${cfg.key}`,
      },
    });

    if (res.ok) {
      const rows = await res.json();
      if (rows && rows.length > 0 && rows[0].value !== undefined) {
        return rows[0].value;
      }
    }
  } catch (err) {
    console.warn(`[Supabase getStore: ${key}]`, err.message);
  }
  return null;
}

async function supabaseSaveStore(key, value) {
  const cfg = getStorageConfig();
  if (cfg.type !== 'SUPABASE') return false;

  try {
    const res = await fetch(`${cfg.url}/rest/v1/xilla_store`, {
      method: 'POST',
      headers: {
        apikey: cfg.key,
        Authorization: `Bearer ${cfg.key}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates',
      },
      body: JSON.stringify({ key, value, updated_at: new Date().toISOString() }),
    });
    return res.ok;
  } catch (err) {
    console.warn(`[Supabase saveStore: ${key}]`, err.message);
    return false;
  }
}

// -------------------------------------------------------------
// VERCEL KV / UPSTASH REDIS INTEGRATION
// -------------------------------------------------------------
async function kvGet(key) {
  const cfg = getStorageConfig();
  if (cfg.type !== 'VERCEL_KV') return null;

  try {
    const res = await fetch(`${cfg.url}/get/${key}`, {
      headers: { Authorization: `Bearer ${cfg.token}` },
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.result !== null && data.result !== undefined) {
        return typeof data.result === 'string' ? JSON.parse(data.result) : data.result;
      }
    }
  } catch (err) {
    console.warn(`[Vercel KV Read Error: ${key}]`, err.message);
  }
  return null;
}

async function kvSet(key, value) {
  const cfg = getStorageConfig();
  if (cfg.type !== 'VERCEL_KV') return false;

  try {
    const serialized = JSON.stringify(value);
    const res = await fetch(`${cfg.url}/set/${key}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cfg.token}`,
        'Content-Type': 'application/json',
      },
      body: serialized,
    });
    return res.ok;
  } catch (err) {
    console.warn(`[Vercel KV Write Error: ${key}]`, err.message);
    return false;
  }
}

// -------------------------------------------------------------
// LOCAL DISK HELPERS
// -------------------------------------------------------------
function readFromDisk(filename, defaultValue) {
  try {
    const filePath = getFilePath(filename);
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn(`Reading ${filename} from disk:`, err.message);
  }
  return defaultValue;
}

function writeToDisk(filename, data) {
  try {
    const filePath = getFilePath(filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    return false;
  }
}

// -------------------------------------------------------------
// UNIFIED DATA ACCESSORS
// -------------------------------------------------------------
async function getStoredData(key, filename, defaultValue) {
  const storage = getStorageConfig();

  // 1. Supabase (Primary Cloud Database)
  if (storage.type === 'SUPABASE') {
    if (key === 'xilla_submissions') {
      const supaSubs = await supabaseGetSubmissions();
      if (supaSubs !== null) {
        memoryStore.set(key, supaSubs);
        return supaSubs;
      }
    } else {
      const supaVal = await supabaseGetStore(key, defaultValue);
      if (supaVal !== null) {
        memoryStore.set(key, supaVal);
        return supaVal;
      }
    }
    // If table is fresh/empty, seed from disk
    const diskSeed = readFromDisk(filename, defaultValue);
    memoryStore.set(key, diskSeed);
    return diskSeed;
  }

  // 2. Vercel KV / Upstash
  if (storage.type === 'VERCEL_KV') {
    const kvData = await kvGet(key);
    if (kvData !== null) {
      memoryStore.set(key, kvData);
      return kvData;
    }
    const diskSeed = readFromDisk(filename, defaultValue);
    if (diskSeed !== defaultValue && (Array.isArray(diskSeed) ? diskSeed.length > 0 : Object.keys(diskSeed).length > 0)) {
      await kvSet(key, diskSeed);
    }
    memoryStore.set(key, diskSeed);
    return diskSeed;
  }

  // 3. In-memory cache
  if (memoryStore.has(key)) {
    return memoryStore.get(key);
  }

  // 4. Local disk fallback
  const diskData = readFromDisk(filename, defaultValue);
  memoryStore.set(key, diskData);
  return diskData;
}

async function saveStoredData(key, filename, data) {
  memoryStore.set(key, data);

  const storage = getStorageConfig();

  // 1. Save to Supabase
  if (storage.type === 'SUPABASE') {
    if (key === 'xilla_submissions') {
      await supabaseSaveSubmissions(data);
    } else {
      await supabaseSaveStore(key, data);
    }
  }

  // 2. Save to Vercel KV
  if (storage.type === 'VERCEL_KV') {
    await kvSet(key, data);
  }

  // 3. Save to local disk
  writeToDisk(filename, data);
  return true;
}

export const db = {
  getTasks: () => getStoredData('xilla_tasks', 'tasks.json', []),
  saveTasks: (tasks) => saveStoredData('xilla_tasks', 'tasks.json', tasks),
  
  getSubmissions: () => getStoredData('xilla_submissions', 'submissions.json', []),
  saveSubmissions: (subs) => saveStoredData('xilla_submissions', 'submissions.json', subs),
  
  getLeaderboard: () => getStoredData('xilla_leaderboard', 'leaderboard.json', []),
  saveLeaderboard: (lb) => saveStoredData('xilla_leaderboard', 'leaderboard.json', lb),

  getConfig: () => getStoredData('xilla_config', 'config.json', {}),
  saveConfig: (cfg) => saveStoredData('xilla_config', 'config.json', cfg),

  getStorageInfo: () => {
    const cfg = getStorageConfig();
    if (cfg.type === 'SUPABASE') {
      return {
        persistent: true,
        type: 'SUPABASE',
        provider: 'Supabase (PostgreSQL Cloud DB)',
        status: 'ONLINE',
        note: 'All survivors are safely stored as atomic rows in your Supabase PostgreSQL database with live dashboard access.',
      };
    }
    if (cfg.type === 'VERCEL_KV') {
      return {
        persistent: true,
        type: 'VERCEL_KV',
        provider: 'Vercel KV / Upstash Redis',
        status: 'ONLINE',
        note: 'All submissions, whitelist slots, and config are permanently stored in cloud KV database.',
      };
    }
    if (cfg.type === 'EPHEMERAL_VERCEL') {
      return {
        persistent: false,
        type: 'EPHEMERAL_VERCEL',
        provider: 'Vercel Ephemeral RAM (Read-Only Disk)',
        status: 'NOT_PERSISTENT',
        warning: 'CRITICAL: Running on Vercel without persistent database! Submissions will not persist across serverless restarts. Connect Supabase or Vercel KV.',
      };
    }
    return {
      persistent: true,
      type: 'LOCAL_FILE',
      provider: 'Local Disk (JSON File)',
      status: 'ONLINE',
      note: 'Running on persistent local disk environment.',
    };
  },
};
