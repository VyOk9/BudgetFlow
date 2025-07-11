import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

interface ExpenseFilters {
  categoryId?: number;
  from?: string;
  to?: string;
}

/**
 * ExpenseService
 *
 * Provides operations related to expenses:
 * - Fetching
 * - Creating (with optional category creation)
 * - Updating
 * - Deleting
 */
@Injectable()
export class ExpenseService {
  constructor(private prisma: PrismaService) {}

  /**
   * Retrieves all expenses for a user with optional filters.
   *
   * @param userId - The user's ID
   * @param filters - Optional filters (category, date range)
   * @returns List of expenses with category included
   */
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

  /**
   * Creates a new expense.
   * If no `categoryId` is provided, it will try to find or create a category by name.
   *
   * @param userId - The user's ID
   * @param body - Expense data (title, amount, date, optional description and category info)
   * @returns The created expense
   */
  async create(userId: number, body: {
    title: string;
    description?: string;
    amount: number;
    date: string;
    categoryId?: number;
    category?: string;
  }) {
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
      throw new Error('Either categoryId or category name is required');
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

  /**
   * Updates an existing expense.
   *
   * @param userId - The user's ID
   * @param id - Expense ID
   * @param data - Partial update data
   * @returns The updated expense
   * @throws NotFoundException if the expense doesn't belong to the user
   */
  async update(
    userId: number,
    id: number,
    data: Partial<{
      title: string;
      description?: string;
      amount: number;
      date: string;
      categoryId: number;
    }>,
  ) {
    const expense = await this.prisma.expense.findUnique({ where: { id } });
    if (!expense || expense.userId !== userId) {
      throw new NotFoundException('Expense not found');
    }

    return this.prisma.expense.update({
      where: { id },
      data: {
        ...data,
        date: data.date ? new Date(data.date) : undefined,
      },
    });
  }

  /**
   * Deletes an expense.
   *
   * @param userId - The user's ID
   * @param id - Expense ID
   * @returns A confirmation object
   * @throws NotFoundException if the expense doesn't belong to the user
   */
  async delete(userId: number, id: number) {
    const expense = await this.prisma.expense.findUnique({ where: { id } });
    if (!expense || expense.userId !== userId) {
      throw new NotFoundException('Expense not found');
    }
    await this.prisma.expense.delete({ where: { id } });
    return { deleted: true };
  }
}
