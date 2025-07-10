import { Controller, Get, Post, Put, Delete, Body, Param, Req, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('categories')
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll(@Req() req) {
    return this.categoriesService.findAll(req.user.id);
  }

  @Post()
  create(@Req() req, @Body('name') name: string) {
    return this.categoriesService.create(req.user.id, name);
  }

  @Put(':id')
  update(@Req() req, @Param('id') id: string, @Body('name') name: string) {
    return this.categoriesService.update(req.user.id, Number(id), name);
  }

  @Delete(':id')
  delete(@Req() req, @Param('id') id: string) {
    return this.categoriesService.delete(req.user.id, Number(id));
  }
}
