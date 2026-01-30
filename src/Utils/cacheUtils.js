/**
 * localStorage Caching Utility
 * Provides caching with expiry for Firestore data
 */

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get cached data if not expired
 * @param {string} key - Cache key
 * @returns {any|null} - Cached data or null if expired/missing
 */
export const getCachedData = (key) => {
    try {
        const cached = localStorage.getItem(key);
        if (!cached) return null;

        const { data, timestamp } = JSON.parse(cached);

        // Check if expired
        if (Date.now() - timestamp > CACHE_DURATION) {
            localStorage.removeItem(key);
            return null;
        }

        console.log(`✅ Cache HIT for ${key}`);
        return data;
    } catch (error) {
        console.error(`❌ Error reading cache for ${key}:`, error);
        return null;
    }
};

/**
 * Set data in cache with timestamp
 * @param {string} key - Cache key
 * @param {any} data - Data to cache
 */
export const setCachedData = (key, data) => {
    try {
        const cacheObject = {
            data,
            timestamp: Date.now()
        };
        localStorage.setItem(key, JSON.stringify(cacheObject));
        console.log(`💾 Cached data for ${key}`);
    } catch (error) {
        console.error(`❌ Error setting cache for ${key}:`, error);
        // If localStorage is full, clear old entries
        if (error.name === 'QuotaExceededError') {
            clearOldCache();
            // Try again
            try {
                localStorage.setItem(key, JSON.stringify({ data, timestamp: Date.now() }));
            } catch (retryError) {
                console.error('❌ Failed to cache even after clearing:', retryError);
            }
        }
    }
};

/**
 * Clear cache for a specific key
 * @param {string} key - Cache key
 */
export const clearCache = (key) => {
    try {
        localStorage.removeItem(key);
        console.log(`🗑️ Cleared cache for ${key}`);
    } catch (error) {
        console.error(`❌ Error clearing cache for ${key}:`, error);
    }
};

/**
 * Clear all application caches
 */
export const clearAllCache = () => {
    try {
        const keys = Object.keys(localStorage);
        const cacheKeys = keys.filter(key =>
            key.startsWith('visa_') ||
            key.startsWith('policy_') ||
            key.startsWith('user_')
        );

        cacheKeys.forEach(key => localStorage.removeItem(key));
        console.log(`🗑️ Cleared ${cacheKeys.length} cache entries`);
    } catch (error) {
        console.error('❌ Error clearing all cache:', error);
    }
};

/**
 * Clear old/expired cache entries
 */
const clearOldCache = () => {
    try {
        const keys = Object.keys(localStorage);
        let clearedCount = 0;

        keys.forEach(key => {
            try {
                const cached = localStorage.getItem(key);
                if (cached) {
                    const { timestamp } = JSON.parse(cached);
                    if (Date.now() - timestamp > CACHE_DURATION) {
                        localStorage.removeItem(key);
                        clearedCount++;
                    }
                }
            } catch (e) {
                // Invalid cache entry, remove it
                localStorage.removeItem(key);
                clearedCount++;
            }
        });

        console.log(`🗑️ Cleared ${clearedCount} expired cache entries`);
    } catch (error) {
        console.error('❌ Error clearing old cache:', error);
    }
};

/**
 * Get cache statistics
 * @returns {object} - Cache stats
 */
export const getCacheStats = () => {
    try {
        const keys = Object.keys(localStorage);
        const cacheKeys = keys.filter(key =>
            key.startsWith('visa_') ||
            key.startsWith('policy_') ||
            key.startsWith('user_')
        );

        let totalSize = 0;
        let validEntries = 0;
        let expiredEntries = 0;

        cacheKeys.forEach(key => {
            const item = localStorage.getItem(key);
            if (item) {
                totalSize += item.length;
                try {
                    const { timestamp } = JSON.parse(item);
                    if (Date.now() - timestamp > CACHE_DURATION) {
                        expiredEntries++;
                    } else {
                        validEntries++;
                    }
                } catch (e) {
                    expiredEntries++;
                }
            }
        });

        return {
            totalEntries: cacheKeys.length,
            validEntries,
            expiredEntries,
            totalSizeKB: (totalSize / 1024).toFixed(2)
        };
    } catch (error) {
        console.error('❌ Error getting cache stats:', error);
        return null;
    }
};
