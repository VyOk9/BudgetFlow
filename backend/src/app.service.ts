import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class AppService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  getHello(): string {
    return 'Hello World!';
  }

  async getCacheValue(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  async setCacheValue(key: string, value: string): Promise<void> {
    await this.redis.set(key, value);
  }
}
