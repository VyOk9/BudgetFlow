import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}

  /**
   * Registers a new user with hashed password.
   * Throws ConflictException if email is already registered.
   *
   * @param email - User's email address
   * @param password - Plain text password to be hashed
   * @returns The newly created user (id, email, createdAt)
   */
  async signup(email: string, password: string) {
    const existingUser = await this.prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      throw new ConflictException('A user with this email already exists.');
    }

    const hash = await bcrypt.hash(password, 10);

    const newUser = await this.prisma.user.create({
      data: {
        email,
        password: hash,
      },
      select: {
        id: true,
        email: true,
        createdAt: true,
      },
    });

    return newUser;
  }

  /**
   * Authenticates user credentials.
   * Throws UnauthorizedException if email not found or password mismatch.
   *
   * @param email - User's email address
   * @param password - Plain text password to verify
   * @returns JWT access token and user info (id, email, createdAt)
   */
  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = await this.jwt.signAsync({ sub: user.id, email });

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
      },
    };
  }
}
