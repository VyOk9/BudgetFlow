import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

/**
 * CategoriesService
 *
 * Handles operations related to categories, including caching with Redis.
 */
@Injectable()
export class CategoriesService {
  constructor(
    private prisma: PrismaService,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  /**
   * Generates a Redis cache key for a specific user.
   */
  private getCacheKey(userId: number) {
    return `categories:user:${userId}`;
  }

  /**
   * Retrieves all categories for the user, including default ones.
   * Uses Redis to cache the result for 5 minutes.
   */
  async findAll(userId: number) {
    const cacheKey = this.getCacheKey(userId);
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const categories = await this.prisma.category.findMany({
      where: {
        OR: [
          { userId },
          { isDefault: true },
        ],
      },
      orderBy: { name: 'asc' },
    });

    await this.redis.set(cacheKey, JSON.stringify(categories), 'EX', 60 * 5);
    return categories;
  }

  /**
   * Creates a new category for the given user.
   * Invalidates the Redis cache for this user.
   * Throws a ConflictException if the category already exists.
   */
  async create(userId: number, name: string) {
    if (!userId) {
      throw new Error("userId is required to create a category");
    }
    try {
      const newCategory = await this.prisma.category.create({
        data: {
          name,
          userId,
          isDefault: false,
        },
      });
      await this.redis.del(this.getCacheKey(userId));
      return newCategory;
    } catch (e) {
      if (e.code === 'P2002') {
        throw new ConflictException('This category already exists');
      }
      throw e;
    }
  }

  /**
   * Updates an existing category's name.
   * Only allowed if the category belongs to the user.
   * Invalidates the cache after update.
   * Throws ConflictException if the name is already taken.
   */
  async update(userId: number, id: number, name: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });
    if (!category || category.userId !== userId) {
      throw new NotFoundException('Category not found');
    }

    try {
      const updated = await this.prisma.category.update({
        where: { id },
        data: { name },
      });
      await this.redis.del(this.getCacheKey(userId));
      return updated;
    } catch (e) {
      if (e.code === 'P2002') {
        throw new ConflictException('This category already exists');
      }
      throw e;
    }
  }

  /**
   * Deletes a category for the given user.
   * Ensures no expenses are associated with the category before deletion.
   * Invalidates the cache after deletion.
   * Throws NotFoundException or ConflictException if deletion is not possible.
   */
  async delete(userId: number, id: number) {
    const category = await this.prisma.category.findUnique({ where: { id } });

    if (!category || category.userId !== userId) {
      throw new NotFoundException('Category not found');
    }

    const hasExpenses = await this.prisma.expense.findFirst({
      where: { categoryId: id },
      select: { id: true },
    });

    if (hasExpenses) {
      throw new ConflictException(
        'Cannot delete this category because it is linked to existing expenses.'
      );
    }

    await this.prisma.category.delete({ where: { id } });
    await this.redis.del(this.getCacheKey(userId));
    return { deleted: true };
  }
}
