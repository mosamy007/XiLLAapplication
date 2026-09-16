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

// Vercel KV / Upstash REST API: GET key
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

// Vercel KV / Upstash REST API: SET key
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

// Local Disk read helper
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

// Local Disk write helper (graceful on read-only environments)
function writeToDisk(filename, data) {
  try {
    const filePath = getFilePath(filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    return false;
  }
}

// Unified Get
async function getStoredData(key, filename, defaultValue) {
  const storage = getStorageConfig();

  // 1. If Vercel KV is configured, fetch live from KV
  if (storage.type === 'VERCEL_KV') {
    const kvData = await kvGet(key);
    if (kvData !== null) {
      memoryStore.set(key, kvData);
      return kvData;
    }
    // Seed initial data from bundled disk file if KV is fresh/empty
    const diskSeed = readFromDisk(filename, defaultValue);
    if (diskSeed !== defaultValue && (Array.isArray(diskSeed) ? diskSeed.length > 0 : Object.keys(diskSeed).length > 0)) {
      await kvSet(key, diskSeed);
    }
    memoryStore.set(key, diskSeed);
    return diskSeed;
  }

  // 2. Local memory store cache
  if (memoryStore.has(key)) {
    return memoryStore.get(key);
  }

  // 3. Local disk read
  const diskData = readFromDisk(filename, defaultValue);
  memoryStore.set(key, diskData);
  return diskData;
}

// Unified Save
async function saveStoredData(key, filename, data) {
  memoryStore.set(key, data);

  const storage = getStorageConfig();

  if (storage.type === 'VERCEL_KV') {
    await kvSet(key, data);
  }

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
    if (cfg.type === 'VERCEL_KV') {
      return {
        persistent: true,
        type: 'VERCEL_KV',
        provider: 'Vercel KV (Upstash Redis)',
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
        warning: 'CRITICAL: Running on Vercel without persistent KV storage! Submissions will not persist across serverless restarts. Connect Vercel KV in 1 click in your Vercel Dashboard under Storage tab.',
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
