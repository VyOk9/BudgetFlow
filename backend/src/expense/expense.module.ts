import { Module } from '@nestjs/common';
import { ExpenseController } from './expense.controller';
import { ExpenseService } from './expense.service';

/**
 * ExpenseModule
 *
 * This module handles all logic related to user expenses.
 * It includes:
 * - The controller for handling HTTP requests
 * - The service for business logic and database interaction
 */
@Module({
  controllers: [ExpenseController],
  providers: [ExpenseService],
})
export class ExpenseModule {}
