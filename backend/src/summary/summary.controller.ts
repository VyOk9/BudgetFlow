import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { SummaryService } from './summary.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('summary')
@UseGuards(JwtAuthGuard)
export class SummaryController {
  constructor(private readonly summaryService: SummaryService) {}

  @Get('monthly')
  getMonthly(
    @Req() req,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    return this.summaryService.getMonthlySummary(req.user.id, Number(year), Number(month));
  }

  @Get('categories')
  getByCategories(
    @Req() req,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.summaryService.getSummaryByCategories(req.user.id, from, to);
  }
}
