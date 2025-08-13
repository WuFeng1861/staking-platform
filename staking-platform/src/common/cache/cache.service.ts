import { Injectable } from '@nestjs/common';

interface CacheItem<T> {
  value: T;
  expiry: number | null; // null表示永不过期
}

@Injectable()
export class CacheService {
  private cache: Map<string, CacheItem<any>> = new Map();

  /**
   * 设置缓存
   * @param key 缓存键
   * @param value 缓存值
   * @param ttl 过期时间（毫秒），如果为null则永不过期
   */
  set<T>(key: string, value: T, ttl: number | null = null): void {
    const expiry = ttl ? Date.now() + ttl : null;
    this.cache.set(key, { value, expiry });
  }

  /**
   * 获取缓存
   * @param key 缓存键
   * @returns 缓存值，如果不存在或已过期则返回null
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    // 检查是否过期
    if (item.expiry && item.expiry < Date.now()) {
      this.delete(key);
      return null;
    }

    return item.value as T;
  }

  /**
   * 删除缓存
   * @param key 缓存键
   */
  delete(key: string): void {
    this.cache.delete(key);
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 获取所有缓存键
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * 检查缓存键是否存在且未过期
   * @param key 缓存键
   */
  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) {
      return false;
    }
    
    // 检查是否过期
    if (item.expiry && item.expiry < Date.now()) {
      this.delete(key);
      return false;
    }
    
    return true;
  }
}