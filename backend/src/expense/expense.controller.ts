import { Controller, Get, Post, Body } from '@nestjs/common';
import { ExpenseService } from './expense.service';

@Controller('expenses')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Get()
  findAll() {
    return this.expenseService.findAll();
  }

  @Post()
  create(@Body() data: { amount: number; date: string; categoryId: number }) {
    return this.expenseService.create(data);
  }
}
