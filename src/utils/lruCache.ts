import { LRUCache } from 'lru-cache';

const userTokenCacheOptions = {
  max: 500, // max items
  ttl: 1000 * 60 * 60, // 60 minutes
  ttlAutopurge: true, // expired entries are removed automatically
};

const igdbTokenCacheOptions = {
  max: 1, // max items
  // how long to live in ms
  ttl: 1000 * 60 * 60 * 24, // 24 Hours
};

// Default configureation
const options = {
  max: 500,

  // for use with tracking overall storage size
  maxSize: 5000,
  sizeCalculation: (value: any, key: any) => {
    return 1;
  },

  // for use when you need to clean up something when objects
  // are evicted from the cache
  dispose: (value: any, key: any, reason: any) => {
    console.log('dispose');
    console.log(value);
  },

  // for use when you need to know that an item is being inserted
  // note that this does NOT allow you to prevent the insertion,
  // it just allows you to know about it.
  onInsert: (value: any, key: any, reason: any) => {
    console.log(key, value);
  },

  // how long to live in ms
  // One Day
  ttl: 1000 * 60 * 60 * 24,
  ttlAutopurge: false, // expired entries are removed automatically

  // return stale items before removing from cache?
  allowStale: false,

  updateAgeOnGet: false,
  updateAgeOnHas: false,

  // async method to use for cache.fetch(), for
  // stale-while-revalidate type of behavior
  fetchMethod: async (key: any, staleValue: any, { options, signal, context }: any) => {},
};

// Contains the user token that is built with an APIkey request
export const userTokenCache = new LRUCache<string, string>(userTokenCacheOptions);

// Contains the APIKey that is returned from IGDB, normally good for 60+ days
export const igdbApikeyCache = new LRUCache<string, string>(igdbTokenCacheOptions);
