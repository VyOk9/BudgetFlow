import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

/**
 * AppService
 *
 * Provides basic functionalities such as greeting and Redis-based caching operations.
 */
@Injectable()
export class AppService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  /**
   * Returns a simple greeting message.
   */
  getHello(): string {
    return 'Hello World!';
  }

  /**
   * Retrieves a value from Redis by key.
   *
   * @param key - The key to retrieve
   * @returns The value as a string or null if not found
   */
  async getCacheValue(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  /**
   * Sets a value in Redis with the given key.
   *
   * @param key - The key under which the value will be stored
   * @param value - The value to store
   */
  async setCacheValue(key: string, value: string): Promise<void> {
    await this.redis.set(key, value);
  }
}
