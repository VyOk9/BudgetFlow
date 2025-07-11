import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { SummaryService } from './summary.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('summary')
@UseGuards(JwtAuthGuard)
export class SummaryController {
  constructor(private readonly summaryService: SummaryService) {}

  /**
   * Get monthly summary of expenses for a given year and month
   * @param req - Request object containing authenticated user info
   * @param year - Year for the summary (e.g., '2024')
   * @param month - Month for the summary (1-12)
   * @returns Monthly summary data for the authenticated user
   */
  @Get('monthly')
  getMonthly(
    @Req() req,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    return this.summaryService.getMonthlySummary(req.user.id, Number(year), Number(month));
  }

  /**
   * Get summary grouped by categories for a date range
   * @param req - Request object containing authenticated user info
   * @param from - Start date in ISO format (e.g., '2024-01-01')
   * @param to - End date in ISO format (e.g., '2024-01-31')
   * @returns Summary data grouped by categories for the authenticated user
   */
  @Get('categories')
  getByCategories(
    @Req() req,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    return this.summaryService.getSummaryByCategories(req.user.id, from, to);
  }
}
