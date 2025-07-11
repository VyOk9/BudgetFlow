import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * AppController
 *
 * Provides basic endpoints for greeting and cache management.
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * GET /
   * Returns a welcome message.
   */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  /**
   * GET /cache/set
   * Sets a value in the cache for a given key.
   *
   * Query parameters:
   * - key: string (required) - cache key
   * - value: string (required) - value to set
   *
   * Returns a confirmation message.
   */
  @Get('cache/set')
  async setCache(@Query('key') key: string, @Query('value') value: string) {
    await this.appService.setCacheValue(key, value);
    return { message: `Key ${key} set with value ${value}` };
  }

  /**
   * GET /cache/get
   * Retrieves a value from the cache by key.
   *
   * Query parameter:
   * - key: string (required) - cache key
   *
   * Returns the value if found, otherwise a not found message.
   */
  @Get('cache/get')
  async getCache(@Query('key') key: string) {
    if (!key) {
      return { error: 'Key query parameter is required' };
    }
    const value = await this.appService.getCacheValue(key);
    if (value === undefined || value === null) {
      return { key, message: 'Key not found in cache' };
    }
    return { key, value };
  }
}
