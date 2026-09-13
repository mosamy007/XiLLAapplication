import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');

// In-memory fallback for serverless environments (e.g. Vercel read-only filesystem)
const memoryStore = new Map();

function getFilePath(filename) {
  return path.join(DATA_DIR, filename);
}

function readJsonFile(filename, defaultValue = []) {
  if (memoryStore.has(filename)) {
    return memoryStore.get(filename);
  }
  try {
    const filePath = getFilePath(filename);
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(data);
      memoryStore.set(filename, parsed);
      return parsed;
    }
  } catch (err) {
    console.warn(`Reading ${filename} from disk:`, err.message);
  }
  memoryStore.set(filename, defaultValue);
  return defaultValue;
}

function writeJsonFile(filename, data) {
  memoryStore.set(filename, data);
  try {
    const filePath = getFilePath(filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    // Graceful fallback on read-only serverless hosting (Vercel)
    console.warn(`Disk write skipped on serverless environment for ${filename}: ${err.message}`);
    return true;
  }
}

export const db = {
  getTasks: () => readJsonFile('tasks.json', []),
  saveTasks: (tasks) => writeJsonFile('tasks.json', tasks),
  
  getSubmissions: () => readJsonFile('submissions.json', []),
  saveSubmissions: (subs) => writeJsonFile('submissions.json', subs),
  
  getLeaderboard: () => readJsonFile('leaderboard.json', []),
  saveLeaderboard: (lb) => writeJsonFile('leaderboard.json', lb),

  getConfig: () => readJsonFile('config.json', {}),
  saveConfig: (cfg) => writeJsonFile('config.json', cfg),
};
