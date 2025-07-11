import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { PrismaModule } from '../../prisma/prisma.module';

/**
 * CategoriesModule
 *
 * This module handles all category-related functionality,
 * including retrieving, creating, updating, and deleting user-defined categories.
 * It imports the PrismaModule for database access and exposes the CategoriesService and CategoriesController.
 */
@Module({
  imports: [PrismaModule],
  controllers: [CategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}
