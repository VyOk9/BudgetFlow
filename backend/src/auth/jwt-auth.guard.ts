import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Guard to protect routes using JWT authentication.
 * Utilizes the 'jwt' strategy configured in Passport.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
