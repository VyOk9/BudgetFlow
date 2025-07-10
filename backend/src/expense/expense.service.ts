import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

interface ExpenseFilters {
  categoryId?: number;
  from?: string;
  to?: string;
}

@Injectable()
export class ExpenseService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: number, filters: ExpenseFilters) {
    const where: any = { userId };

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }
    if (filters.from || filters.to) {
      where.date = {};
      if (filters.from) where.date.gte = new Date(filters.from);
      if (filters.to) where.date.lte = new Date(filters.to);
    }

    return this.prisma.expense.findMany({
      where,
      orderBy: { date: 'desc' },
      include: { category: true },
    });
  }

  async create(userId: number, body: { title: string; description?: string; amount: number; date: string; categoryId?: number; category?: string }) {
    let categoryId = body.categoryId;
  
    if (!categoryId && body.category) {
      let category = await this.prisma.category.findFirst({
        where: { name: body.category, userId },
      });
  
      if (!category) {
        category = await this.prisma.category.create({
          data: {
            name: body.category,
            userId,
            isDefault: false,
          },
        });
      }
  
      categoryId = category.id;
    }
  
    if (!categoryId) {
      throw new Error('categoryId requis ou nom de catégorie');
    }
  
    return this.prisma.expense.create({
      data: {
        title: body.title,
        description: body.description,
        amount: body.amount,
        date: new Date(body.date),
        categoryId,
        userId,
      },
    });
  }
  
  

  async update(
    userId: number,
    id: number,
    data: Partial<{ title: string; description?: string; amount: number; date: string; categoryId: number }>,
  ) {
    const expense = await this.prisma.expense.findUnique({ where: { id } });
    if (!expense || expense.userId !== userId) {
      throw new NotFoundException('Dépense non trouvée');
    }

    return this.prisma.expense.update({
      where: { id },
      data: {
        ...data,
        date: data.date ? new Date(data.date) : undefined,
      },
    });
  }

  async delete(userId: number, id: number) {
    const expense = await this.prisma.expense.findUnique({ where: { id } });
    if (!expense || expense.userId !== userId) {
      throw new NotFoundException('Dépense non trouvée');
    }
    await this.prisma.expense.delete({ where: { id } });
    return { deleted: true };
  }
}
