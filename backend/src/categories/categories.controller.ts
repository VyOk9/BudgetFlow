import { Controller, Get, Post, Put, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

/**
 * CategoriesController
 *
 * Handles all HTTP requests related to category management.
 * Requires authentication via JwtAuthGuard.
 */
@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  /**
   * Get all categories (custom and default) for the authenticated user.
   */
  @Get()
  findAll(@Req() req) {
    return this.categoriesService.findAll(req.user.id);
  }

  /**
   * Create a new category for the authenticated user.
   * @param name The name of the category
   */
  @Post()
  create(@Req() req, @Body('name') name: string) {
    return this.categoriesService.create(req.user.id, name);
  }

  /**
   * Update a category name by its ID.
   * Only allows updates for categories that belong to the authenticated user.
   * @param id The category ID
   * @param name The new name of the category
   */
  @Put(':id')
  update(@Req() req, @Param('id') id: string, @Body('name') name: string) {
    return this.categoriesService.update(req.user.id, Number(id), name);
  }

  /**
   * Delete a category by its ID.
   * Only allows deletion if the category belongs to the user and is not linked to expenses.
   * @param id The category ID
   */
  @Delete(':id')
  delete(@Req() req, @Param('id') id: string) {
    return this.categoriesService.delete(req.user.id, Number(id));
  }
}
