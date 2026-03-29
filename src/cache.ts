import { LRUCache } from "lru-cache";

export interface CacheOptions {
  max?: number;
  ttl?: number;
}

const defaultOptions: CacheOptions = {
  max: 1000,
  ttl: 60 * 1000,
};

export function createCache(options: CacheOptions = defaultOptions): LRUCache<string, any> {
  return new LRUCache<string, any>({
    max: options.max ?? defaultOptions.max!,
    ttl: options.ttl ?? defaultOptions.ttl!,
    allowStale: false,
    ttlAutopurge: true,
  });
}

export const cache = createCache();

export function getCached(key: string): any | undefined {
  return cache.get(key);
}

export function setCache(key: string, value: any): void {
  cache.set(key, value);
}

export function invalidateCache(key: string): void {
  cache.delete(key);
}

export function clearCache(): void {
  cache.clear();
}
