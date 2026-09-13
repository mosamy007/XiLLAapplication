// OpenSea Live Collection & Holder Radar Service
const OPENSEA_API_KEY = process.env.OPENSEA_API_KEY;

export const MONITORED_COLLECTIONS = {
  web3Cat: {
    name: 'Web3 Cats',
    slug: 'web3-cat',
    chain: 'Robinhood',
    contract: '0xe1f0f12725cfecdeb2e9b07fc5b25906fc7597b3',
    openSeaUrl: 'https://opensea.io/collection/web3-cat',
  },
  miggles: {
    name: 'Miggles',
    slug: 'miggles-on-base',
    chain: 'Base',
    contract: '0x71cfbebb61a42d2e5ccff0831663cd58d2e442d9',
    openSeaUrl: 'https://opensea.io/collection/miggles-on-base',
  },
};

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
    return {
      ...cachedHolders,
      collections: {
        web3Cat: {
          ...MONITORED_COLLECTIONS.web3Cat,
          holders: cachedHolders.web3CatHolders,
        },
        miggles: {
          ...MONITORED_COLLECTIONS.miggles,
          holders: cachedHolders.migglesHolders,
        },
      },
    };
  }

  // Fetch live stats in parallel
  const [web3CatCount, migglesCount] = await Promise.all([
    fetchStatsForCollection(MONITORED_COLLECTIONS.web3Cat.slug),
    fetchStatsForCollection(MONITORED_COLLECTIONS.miggles.slug),
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

  console.log(`[OpenSea Live Radar] Web3 Cats (${MONITORED_COLLECTIONS.web3Cat.chain}): ${cachedHolders.web3CatHolders} | Miggles (${MONITORED_COLLECTIONS.miggles.chain}): ${cachedHolders.migglesHolders} | Total Reserved: ${cachedHolders.holderSpotsTaken}`);

  return {
    ...cachedHolders,
    collections: {
      web3Cat: {
        ...MONITORED_COLLECTIONS.web3Cat,
        holders: cachedHolders.web3CatHolders,
      },
      miggles: {
        ...MONITORED_COLLECTIONS.miggles,
        holders: cachedHolders.migglesHolders,
      },
    },
  };
}

export default {
  getLiveHolders,
  MONITORED_COLLECTIONS,
};
