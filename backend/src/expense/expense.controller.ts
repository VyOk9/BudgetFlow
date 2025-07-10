import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  @Get()
  findAll(
    @Req() req,
    @Query('categoryId') categoryId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.expenseService.findAll(req.user.id, {
      categoryId: categoryId ? Number(categoryId) : undefined,
      from,
      to,
    });
  }

  @Post()
  create(@Req() req, @Body() body: { title: string; description?: string; amount: number; date: string; categoryId: number }) {
    return this.expenseService.create(req.user.id, body);
  }

  @Put(':id')
  update(
    @Req() req,
    @Param('id') id: string,
    @Body() body: { title?: string; description?: string; amount?: number; date?: string; categoryId?: number },
  ) {
    return this.expenseService.update(req.user.id, Number(id), body);
  }

  @Delete(':id')
  delete(@Req() req, @Param('id') id: string) {
    return this.expenseService.delete(req.user.id, Number(id));
  }
}
