// OpenSea Live Collection & Holder Radar Service
const OPENSEA_API_KEY = process.env.OPENSEA_API_KEY;

// Baseline fallback in case OpenSea API is temporarily unreachable or key not provided
let cachedHolders = {
  web3CatHolders: 1134,
  migglesHolders: 1778,
  holderSpotsTaken: 2912,
  lastUpdated: null,
};

let lastFetchTime = 0;
const CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes cache TTL to stay well within rate limits

async function fetchStatsForCollection(slug) {
  if (!OPENSEA_API_KEY) {
    return null;
  }
  try {
    const res = await fetch(`https://api.opensea.io/api/v2/collections/${slug}/stats`, {
      headers: {
        'x-api-key': OPENSEA_API_KEY,
        'accept': 'application/json',
      },
    });

    if (res.ok) {
      const data = await res.json();
      const numOwners = data.total?.num_owners;
      if (typeof numOwners === 'number' && numOwners > 0) {
        return numOwners;
      }
    } else {
      console.warn(`[OpenSea] Warning: ${slug} stats returned status ${res.status}`);
    }
  } catch (err) {
    console.warn(`[OpenSea] Network error fetching ${slug} stats:`, err.message);
  }
  return null;
}

export async function getLiveHolders() {
  const now = Date.now();
  if (now - lastFetchTime < CACHE_TTL_MS && cachedHolders.lastUpdated) {
    return cachedHolders;
  }

  // Fetch live stats in parallel
  const [web3CatCount, migglesCount] = await Promise.all([
    fetchStatsForCollection('web3-cat'),
    fetchStatsForCollection('miggles-on-base'),
  ]);

  if (web3CatCount !== null) {
    cachedHolders.web3CatHolders = web3CatCount;
  }
  if (migglesCount !== null) {
    cachedHolders.migglesHolders = migglesCount;
  }

  cachedHolders.holderSpotsTaken = cachedHolders.web3CatHolders + cachedHolders.migglesHolders;
  cachedHolders.lastUpdated = new Date().toISOString();
  lastFetchTime = now;

  console.log(`[OpenSea Live Radar] Web3 Cats: ${cachedHolders.web3CatHolders} | Miggles: ${cachedHolders.migglesHolders} | Total Reserved: ${cachedHolders.holderSpotsTaken}`);

  return cachedHolders;
}

export default {
  getLiveHolders,
};
