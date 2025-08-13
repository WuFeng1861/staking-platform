import { Test, TestingModule } from '@nestjs/testing';
import { CacheService } from '../../src/common/cache/cache.service';

describe('CacheService', () => {
  let service: CacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CacheService],
    }).compile();

    service = module.get<CacheService>(CacheService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('set and get', () => {
    it('should store and retrieve a value', () => {
      // 设置缓存
      service.set('testKey', 'testValue');
      
      // 获取缓存
      const value = service.get('testKey');
      
      // 验证结果
      expect(value).toBe('testValue');
    });

    it('should return null for non-existent key', () => {
      const value = service.get('nonExistentKey');
      expect(value).toBeNull();
    });

    it('should handle different value types', () => {
      // 测试不同类型的值
      const testCases = [
        { key: 'stringKey', value: 'string value' },
        { key: 'numberKey', value: 123 },
        { key: 'booleanKey', value: true },
        { key: 'objectKey', value: { name: 'test', value: 42 } },
        { key: 'arrayKey', value: [1, 2, 3] },
      ];

      // 设置所有测试用例
      testCases.forEach(({ key, value }) => {
        service.set(key, value);
      });

      // 验证所有测试用例
      testCases.forEach(({ key, value }) => {
        expect(service.get(key)).toEqual(value);
      });
    });
  });

  describe('expiry', () => {
    it('should expire items after TTL', async () => {
      // 设置一个100ms后过期的缓存
      service.set('expiringKey', 'expiringValue', 100);
      
      // 立即获取，应该存在
      expect(service.get('expiringKey')).toBe('expiringValue');
      
      // 等待110ms，确保过期
      await new Promise(resolve => setTimeout(resolve, 110));
      
      // 再次获取，应该为null
      expect(service.get('expiringKey')).toBeNull();
    });

    it('should not expire items with null TTL', async () => {
      // 设置一个永不过期的缓存
      service.set('nonExpiringKey', 'nonExpiringValue', null);
      
      // 等待一段时间
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 获取缓存，应该仍然存在
      expect(service.get('nonExpiringKey')).toBe('nonExpiringValue');
    });
  });

  describe('delete', () => {
    it('should delete a specific key', () => {
      // 设置缓存
      service.set('key1', 'value1');
      service.set('key2', 'value2');
      
      // 删除key1
      service.delete('key1');
      
      // 验证结果
      expect(service.get('key1')).toBeNull();
      expect(service.get('key2')).toBe('value2');
    });

    it('should do nothing when deleting non-existent key', () => {
      // 删除不存在的键
      service.delete('nonExistentKey');
      
      // 不应抛出异常
      expect(true).toBe(true);
    });
  });

  describe('clear', () => {
    it('should remove all cached items', () => {
      // 设置多个缓存
      service.set('key1', 'value1');
      service.set('key2', 'value2');
      service.set('key3', 'value3');
      
      // 清空所有缓存
      service.clear();
      
      // 验证结果
      expect(service.get('key1')).toBeNull();
      expect(service.get('key2')).toBeNull();
      expect(service.get('key3')).toBeNull();
    });
  });

  describe('keys', () => {
    it('should return all cache keys', () => {
      // 设置多个缓存
      service.set('key1', 'value1');
      service.set('key2', 'value2');
      service.set('key3', 'value3');
      
      // 获取所有键
      const keys = service.keys();
      
      // 验证结果
      expect(keys).toHaveLength(3);
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys).toContain('key3');
    });

    it('should return empty array when cache is empty', () => {
      // 确保缓存为空
      service.clear();
      
      // 获取所有键
      const keys = service.keys();
      
      // 验证结果
      expect(keys).toHaveLength(0);
    });
  });

  describe('has', () => {
    it('should return true for existing non-expired keys', () => {
      // 设置缓存
      service.set('existingKey', 'value');
      
      // 验证结果
      expect(service.has('existingKey')).toBe(true);
    });

    it('should return false for non-existent keys', () => {
      // 验证结果
      expect(service.has('nonExistentKey')).toBe(false);
    });

    it('should return false for expired keys', async () => {
      // 设置一个100ms后过期的缓存
      service.set('expiringKey', 'value', 100);
      
      // 立即检查，应该存在
      expect(service.has('expiringKey')).toBe(true);
      
      // 等待110ms，确保过期
      await new Promise(resolve => setTimeout(resolve, 110));
      
      // 再次检查，应该不存在
      expect(service.has('expiringKey')).toBe(false);
    });
  });
});