import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('cache/set')
  async setCache(@Query('key') key: string, @Query('value') value: string) {
    await this.appService.setCacheValue(key, value);
    return { message: `Key ${key} set with value ${value}` };
  }

  @Get('cache/get')
  async getCache(@Query('key') key: string) {
    const value = await this.appService.getCacheValue(key);
    return value
      ? { key, value }
      : { key, message: 'Key not found in cache' };
  }
}
