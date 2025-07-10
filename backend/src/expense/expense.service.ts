import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ExpenseService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.expense.findMany({
      include: { category: true },
    });
  }

  findAllForUser(userId: number) {
    return this.prisma.expense.findMany({
      where: { userId },
      include: { category: true },
    });
  }

  create(data: { amount: number; date: string; categoryId: number; userId: number }) {
    return this.prisma.expense.create({
      data: {
        amount: data.amount,
        date: new Date(data.date),
        category: { connect: { id: data.categoryId } },
        user: { connect: { id: data.userId } },
      },
    });
  }
}
