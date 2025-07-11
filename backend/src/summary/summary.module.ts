import { Module } from '@nestjs/common';
import { SummaryController } from './summary.controller';
import { SummaryService } from './summary.service';
import { PrismaModule } from '../../prisma/prisma.module';

/**
 * SummaryModule
 *
 * This module encapsulates the summary feature, including the controller and service.
 * It imports PrismaModule for database access.
 */
@Module({
  imports: [PrismaModule],
  controllers: [SummaryController],
  providers: [SummaryService],
})
export class SummaryModule {}
