import { Module } from '@nestjs/common';
import { RedisModule } from '@nestjs-modules/ioredis';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ExpenseModule } from './expense/expense.module';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { SummaryModule } from './summary/summary.module';

/**
 * AppModule
 *
 * Root module of the application.
 * Registers global modules such as Prisma, Redis, authentication,
 * expense management, category management, and summaries.
 */
@Module({
  imports: [
    PrismaModule,
    ExpenseModule,
    AuthModule,
    CategoriesModule,
    SummaryModule,
    RedisModule.forRoot({
      type: 'single',
      url: 'redis://localhost:6379',
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
