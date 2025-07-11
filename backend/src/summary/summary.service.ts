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

  private getCacheKeyMonthly(userId: number, year: number, month: number) {
    return `summary:monthly:${userId}:${year}-${month}`;
  }

  private getCacheKeyCategories(userId: number, from: string, to: string) {
    return `summary:categories:${userId}:${from}:${to}`;
  }

  async getMonthlySummary(userId: number, year: number, month: number) {
    if (!userId || !year || !month) {
      throw new Error('userId, year et month sont requis');
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
      categoryName: categories.find((c) => c.id === e.categoryId)?.name || 'Inconnu',
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

  async getSummaryByCategories(userId: number, from: string, to: string) {
    if (!from || !to || isNaN(Date.parse(from)) || isNaN(Date.parse(to))) {
      throw new Error('from et to doivent être des dates valides (format ISO recommandé)');
    }
    if (!userId) {
      throw new Error('userId est requis');
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
      categoryName: categories.find((c) => c.id === e.categoryId)?.name || 'Inconnu',
      total: e._sum.amount,
    }));

    await this.redis.set(cacheKey, JSON.stringify(result), 'EX', 60 * 5);
    return result;
  }
}
