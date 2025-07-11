import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaModule } from '../../prisma/prisma.module';
import { JwtStrategy } from './jwt.strategy';

/**
 * AuthModule
 *
 * This module is responsible for handling user authentication using JWT.
 * It includes registration and login logic, token generation, and JWT validation strategy.
 */
@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.register({
      secret: 'supersecret',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
