import { Controller, Get, Post, Body, Request, UseGuards } from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('expenses')
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll(@Request() req) {
    return this.expenseService.findAllForUser(req.user.userId);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() data: { amount: number; date: string; categoryId: number }, @Request() req) {
    return this.expenseService.create({ ...data, userId: req.user.userId });
  }
}
