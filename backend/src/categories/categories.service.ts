import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';


@Injectable()
export class CategoriesService {
    constructor(
        private prisma: PrismaService,
        @InjectRedis() private readonly redis: Redis,
      ) {}

  private getCacheKey(userId: number) {
    return `categories:user:${userId}`;
  }

  async findAll(userId: number) {
    const cacheKey = this.getCacheKey(userId);
    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const categories = await this.prisma.category.findMany({
      where: {
        OR: [
          { userId: userId },
          { isDefault: true },
        ],
      },
      orderBy: { name: 'asc' },
    });

    await this.redis.set(cacheKey, JSON.stringify(categories), 'EX', 60 * 5);
    return categories;
  }

  async create(userId: number, name: string) {
    if (!userId) {
      throw new Error("userId requis pour créer une catégorie");
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
        throw new ConflictException('Cette catégorie existe déjà');
      }
      throw e;
    }
  }
  

  async update(userId: number, id: number, name: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });
    if (!category || category.userId !== userId) {
      throw new NotFoundException('Catégorie non trouvée');
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
        throw new ConflictException('Cette catégorie existe déjà');
      }
      throw e;
    }
  }

  async delete(userId: number, id: number) {
    const category = await this.prisma.category.findUnique({ where: { id } });
  
    if (!category || category.userId !== userId) {
      throw new NotFoundException('Catégorie non trouvée');
    }
  
    const hasExpenses = await this.prisma.expense.findFirst({
      where: { categoryId: id },
      select: { id: true },
    });
  
    if (hasExpenses) {
      throw new ConflictException(
        'Impossible de supprimer cette catégorie car elle est liée à des transactions.'
      );
    }
  
    await this.prisma.category.delete({ where: { id } });
    await this.redis.del(this.getCacheKey(userId));
    return { deleted: true };
  }
}
