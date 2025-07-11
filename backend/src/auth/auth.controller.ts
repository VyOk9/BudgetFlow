import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

/**
 * AuthController
 *
 * Handles user authentication requests: signup and login.
 */
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Register a new user with an email and password.
   * @param body Object containing user credentials
   * @returns JWT token and user information
   */
  @Post('signup')
  signup(@Body() body: { email: string; password: string }) {
    return this.authService.signup(body.email, body.password);
  }

  /**
   * Log in a user with provided credentials.
   * @param body Object containing user credentials
   * @returns JWT token and user information if credentials are valid
   */
  @Post('login')
  login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }
}
