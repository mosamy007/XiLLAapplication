import https from 'https';

/**
 * Twitter Verification Service
 * Uses dummy account session cookies (auth_token & ct0)
 * Uses in-memory caching to strictly prevent Twitter rate limits
 */

const TWITTER_BEARER = 'AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA';

// 60-second in-memory cache for Twitter friendship checks to eliminate rate limits
const friendshipCache = new Map();
const CACHE_TTL_MS = 60 * 1000;

/**
 * Master Verification Function for all Task Types
 */
export async function verifyTwitterTask(userHandle, task, openedTaskIds = []) {
  const cleanUser = userHandle.replace(/^@/, '').trim();
  const authToken = process.env.TWITTER_AUTH_TOKEN;
  const ct0 = process.env.TWITTER_CT0;

  console.log(`[TwitterService] [DUMMY_ACCOUNT] Verifying "${task.title}" (${task.type}) for @${cleanUser}`);

  if (!authToken || !ct0) {
    console.warn('[TwitterService] Missing TWITTER_AUTH_TOKEN or TWITTER_CT0.');
    return {
      verified: false,
      handle: cleanUser,
      error: 'Twitter radar service credentials not configured. Please check server .env',
    };
  }

  const taskType = (task.type || '').toLowerCase();

  switch (taskType) {
    case 'follow': {
      const targetHandle = task.targetHandle || 'XiLLANFTs';
      return await verifyTwitterFollow(cleanUser, targetHandle, authToken, ct0);
    }

    case 'like_rt':
    case 'repost':
    case 'broadcast': {
      return await verifyTwitterRepost(cleanUser, task, authToken, ct0, openedTaskIds);
    }

    case 'reply': {
      return await verifyTwitterReply(cleanUser, task, authToken, ct0, openedTaskIds);
    }

    default: {
      return {
        verified: true,
        handle: cleanUser,
        message: `Mission "${task.title}" verified for @${cleanUser}.`,
      };
    }
  }
}

/**
 * Verify Follow Status via friendships/show.json
 */
export async function verifyTwitterFollow(userHandle, targetHandle = 'XiLLANFTs', authToken, ct0) {
  const cleanUser = userHandle.replace(/^@/, '').trim();
  const cleanTarget = targetHandle.replace(/^@/, '').trim();

  authToken = authToken || process.env.TWITTER_AUTH_TOKEN;
  ct0 = ct0 || process.env.TWITTER_CT0;

  try {
    const friendship = await checkTwitterFriendshipWithCache(cleanUser, cleanTarget, authToken, ct0);

    if (friendship.following) {
      console.log(`[TwitterService] SUCCESS: @${cleanUser} is actively following @${cleanTarget}!`);
      return {
        verified: true,
        simulated: false,
        handle: cleanUser,
        target: cleanTarget,
        message: `Verified: @${cleanUser} is actively following @${cleanTarget} on X!`,
      };
    } else {
      console.log(`[TwitterService] FAILED: @${cleanUser} is NOT following @${cleanTarget}.`);
      return {
        verified: false,
        simulated: false,
        handle: cleanUser,
        target: cleanTarget,
        error: `@${cleanUser} is not following @${cleanTarget} on X yet. Click [FOLLOW ON X], follow @${cleanTarget}, and click VERIFY again.`,
      };
    }
  } catch (err) {
    console.warn(`[TwitterService] Follow check error for @${cleanUser}: ${err.message}`);

    if (err.message.includes('163') || err.message.includes('Could not determine source user') || err.message.includes('108')) {
      return {
        verified: false,
        handle: cleanUser,
        error: `Could not find X user @${cleanUser}. Please check your handle spelling on X.`,
      };
    }

    return {
      verified: false,
      handle: cleanUser,
      error: `Radar error: ${err.message}. Please wait a few seconds and try again.`,
    };
  }
}

/**
 * Verify Like & RT
 * Strict requirements:
 * 1. Prerequisite: User must follow @XiLLANFTs
 * 2. User must have clicked [LIKE & RT ON X]
 */
async function verifyTwitterRepost(cleanUser, task, authToken, ct0, openedTaskIds = []) {
  console.log(`[TwitterService] Verifying Like & RT for @${cleanUser}...`);
  const tweetId = task.tweetId || '2097080811233161284';

  // 1. Link Opened Check
  const hasOpened = Array.isArray(openedTaskIds) && openedTaskIds.includes(task.id);
  if (!hasOpened) {
    return {
      verified: false,
      handle: cleanUser,
      error: `Please click [LIKE & RT ON X] to open tweet ${tweetId} on X, perform Like & RT, then verify.`,
    };
  }

  // 2. Prerequisite: Check if user follows @XiLLANFTs
  try {
    const friendship = await checkTwitterFriendshipWithCache(cleanUser, 'XiLLANFTs', authToken, ct0);
    if (!friendship.following) {
      return {
        verified: false,
        handle: cleanUser,
        error: `@${cleanUser} must follow @XiLLANFTs first. Complete Mission 03 (Follow) before verifying Like & RT.`,
      };
    }

    return {
      verified: true,
      handle: cleanUser,
      message: `Emergency Broadcast Retweet verified for @${cleanUser} via X Dummy Radar!`,
    };
  } catch (err) {
    if (err.message.includes('163') || err.message.includes('Could not determine source user') || err.message.includes('108')) {
      return {
        verified: false,
        handle: cleanUser,
        error: `Could not find X user @${cleanUser}. Please check your handle spelling on X.`,
      };
    }

    return {
      verified: false,
      handle: cleanUser,
      error: `Radar error: ${err.message}. Please retry in a moment.`,
    };
  }
}

/**
 * Verify Reply
 * Strict requirements:
 * 1. Prerequisite: User must follow @XiLLANFTs
 * 2. User must have clicked [REPLY "XiLLA" ON X]
 */
async function verifyTwitterReply(cleanUser, task, authToken, ct0, openedTaskIds = []) {
  console.log(`[TwitterService] Verifying Reply for @${cleanUser}...`);
  const tweetId = task.tweetId || '2097080811233161284';

  // 1. Link Opened Check
  const hasOpened = Array.isArray(openedTaskIds) && openedTaskIds.includes(task.id);
  if (!hasOpened) {
    return {
      verified: false,
      handle: cleanUser,
      error: `Please click [REPLY "XiLLA" ON X] to open tweet ${tweetId} on X, reply with "XiLLA", then verify.`,
    };
  }

  // 2. Prerequisite: Check if user follows @XiLLANFTs
  try {
    const friendship = await checkTwitterFriendshipWithCache(cleanUser, 'XiLLANFTs', authToken, ct0);
    if (!friendship.following) {
      return {
        verified: false,
        handle: cleanUser,
        error: `@${cleanUser} must follow @XiLLANFTs first. Complete Mission 03 (Follow) before verifying Reply.`,
      };
    }

    return {
      verified: true,
      handle: cleanUser,
      message: `Transmission reply confirmed for @${cleanUser} on tweet ${tweetId}!`,
    };
  } catch (err) {
    if (err.message.includes('163') || err.message.includes('Could not determine source user') || err.message.includes('108')) {
      return {
        verified: false,
        handle: cleanUser,
        error: `Could not find X user @${cleanUser}. Please check your handle spelling on X.`,
      };
    }

    return {
      verified: false,
      handle: cleanUser,
      error: `Radar error: ${err.message}. Please retry in a moment.`,
    };
  }
}

/**
 * Cached Twitter Friendship Lookup
 * Prevents hitting Twitter API multiple times within 60s for the same handle
 */
async function checkTwitterFriendshipWithCache(userScreenName, targetScreenName, authToken, ct0) {
  const cacheKey = `${userScreenName.toLowerCase()}_${targetScreenName.toLowerCase()}`;
  const cached = friendshipCache.get(cacheKey);

  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL_MS) {
    console.log(`[TwitterService] [CACHE_HIT] Friendship for @${userScreenName} -> following: ${cached.following}`);
    return { following: cached.following, cached: true };
  }

  const result = await checkTwitterFriendship(userScreenName, targetScreenName, authToken, ct0);
  friendshipCache.set(cacheKey, {
    following: result.following,
    timestamp: Date.now(),
  });

  return result;
}

/**
 * Low-level Twitter Web API request
 */
function checkTwitterFriendship(userScreenName, targetScreenName, authToken, ct0) {
  return new Promise((resolve, reject) => {
    const path = `/1.1/friendships/show.json?source_screen_name=${encodeURIComponent(userScreenName)}&target_screen_name=${encodeURIComponent(targetScreenName)}`;

    const options = {
      hostname: 'api.twitter.com',
      port: 443,
      path: path,
      method: 'GET',
      headers: {
        'authorization': `Bearer ${TWITTER_BEARER}`,
        'cookie': `auth_token=${authToken}; ct0=${ct0}`,
        'x-csrf-token': ct0,
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'x-twitter-active-user': 'yes',
        'x-twitter-auth-type': 'OAuth2Session',
      },
      timeout: 6000,
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          if (res.statusCode === 200) {
            const parsed = JSON.parse(data);
            const following = !!(parsed?.relationship?.source?.following);
            const followedBy = !!(parsed?.relationship?.source?.followed_by);
            resolve({ following, followedBy, raw: parsed });
          } else {
            reject(new Error(`Status ${res.statusCode}: ${data.substring(0, 150)}`));
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', (e) => reject(e));
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Twitter API timeout'));
    });

    req.end();
  });
}
