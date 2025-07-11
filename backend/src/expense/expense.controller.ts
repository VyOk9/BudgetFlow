import { Controller, Get, Post, Put, Delete, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { ExpenseService } from './expense.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

/**
 * ExpenseController
 *
 * Handles HTTP requests related to expense management.
 * All routes are protected by JWT authentication.
 */
@Controller('expenses')
@UseGuards(JwtAuthGuard)
export class ExpenseController {
  constructor(private readonly expenseService: ExpenseService) {}

  /**
   * GET /expenses
   * Retrieves all expenses for the authenticated user.
   * Optional filters:
   * - categoryId: filter by category
   * - from/to: filter by date range
   */
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

  /**
   * POST /expenses
   * Creates a new expense for the authenticated user.
   */
  @Post()
  create(
    @Req() req,
    @Body()
    body: {
      title: string
      description?: string
      amount: number
      date: string
      categoryId: number
    },
  ) {
    return this.expenseService.create(req.user.id, body);
  }

  /**
   * PUT /expenses/:id
   * Updates an existing expense for the authenticated user.
   */
  @Put(':id')
  update(
    @Req() req,
    @Param('id') id: string,
    @Body()
    body: {
      title?: string
      description?: string
      amount?: number
      date?: string
      categoryId?: number
    },
  ) {
    return this.expenseService.update(req.user.id, Number(id), body);
  }

  /**
   * DELETE /expenses/:id
   * Deletes an expense by ID for the authenticated user.
   */
  @Delete(':id')
  delete(@Req() req, @Param('id') id: string) {
    return this.expenseService.delete(req.user.id, Number(id));
  }
}
