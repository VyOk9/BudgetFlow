import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ExpenseService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.expense.findMany({
      include: {
        category: true,
      },
    });
  }

  create(data: { amount: number; date: string; categoryId: number }) {
    return this.prisma.expense.create({ data });
  }
}
