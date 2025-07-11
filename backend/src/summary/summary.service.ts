import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

@Injectable()
export class SummaryService {
  constructor(
    private prisma: PrismaService,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  /**
   * Generate the cache key for monthly summary
   * @param userId - User identifier
   * @param year - Year of the summary
   * @param month - Month of the summary (1-12)
   * @returns Cache key string
   */
  private getCacheKeyMonthly(userId: number, year: number, month: number) {
    return `summary:monthly:${userId}:${year}-${month}`;
  }

  /**
   * Generate the cache key for category summary
   * @param userId - User identifier
   * @param from - Start date (ISO string)
   * @param to - End date (ISO string)
   * @returns Cache key string
   */
  private getCacheKeyCategories(userId: number, from: string, to: string) {
    return `summary:categories:${userId}:${from}:${to}`;
  }

  /**
   * Get monthly summary of expenses grouped by category
   * @param userId - User identifier
   * @param year - Year to get the summary for
   * @param month - Month to get the summary for (1-12)
   * @throws Error if parameters are missing
   * @returns Object containing total expenses and breakdown by category
   */
  async getMonthlySummary(userId: number, year: number, month: number) {
    if (!userId || !year || !month) {
      throw new Error('userId, year and month are required');
    }
    const cacheKey = this.getCacheKeyMonthly(userId, year, month);
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);
    endDate.setHours(23, 59, 59, 999);

    const expenses = await this.prisma.expense.groupBy({
      by: ['categoryId'],
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
      _sum: { amount: true },
    });

    const categoriesIds = expenses.map((e) => e.categoryId);
    const categories = await this.prisma.category.findMany({
      where: { id: { in: categoriesIds } },
      select: { id: true, name: true },
    });

    const result = expenses.map((e) => ({
      categoryId: e.categoryId,
      categoryName: categories.find((c) => c.id === e.categoryId)?.name || 'Unknown',
      total: e._sum.amount,
    }));

    const totalGlobal = expenses.reduce((acc, cur) => acc + (cur._sum.amount ?? 0), 0);

    const summary = {
      totalGlobal,
      byCategory: result,
    };

    await this.redis.set(cacheKey, JSON.stringify(summary), 'EX', 60 * 5);
    return summary;
  }

  /**
   * Get summary of expenses grouped by category for a date range
   * @param userId - User identifier
   * @param from - Start date in ISO format
   * @param to - End date in ISO format
   * @throws Error if dates are invalid or userId missing
   * @returns Array of categories with total expenses
   */
  async getSummaryByCategories(userId: number, from: string, to: string) {
    if (!from || !to || isNaN(Date.parse(from)) || isNaN(Date.parse(to))) {
      throw new Error('from and to must be valid dates (ISO format recommended)');
    }
    if (!userId) {
      throw new Error('userId is required');
    }
    const cacheKey = this.getCacheKeyCategories(userId, from, to);
    const cached = await this.redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const startDate = new Date(Date.parse(from));
    const endDate = new Date(Date.parse(to));
    endDate.setHours(23, 59, 59, 999);

    const expenses = await this.prisma.expense.groupBy({
      by: ['categoryId'],
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
      _sum: { amount: true },
    });

    const categoriesIds = expenses.map((e) => e.categoryId);
    const categories = await this.prisma.category.findMany({
      where: { id: { in: categoriesIds } },
      select: { id: true, name: true },
    });

    const result = expenses.map((e) => ({
      categoryId: e.categoryId,
      categoryName: categories.find((c) => c.id === e.categoryId)?.name || 'Unknown',
      total: e._sum.amount,
    }));

    await this.redis.set(cacheKey, JSON.stringify(result), 'EX', 60 * 5);
    return result;
  }
}
