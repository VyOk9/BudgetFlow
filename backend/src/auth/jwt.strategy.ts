import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

/**
 * JWT strategy used by Passport to validate JWT tokens.
 * Extracts JWT from the Authorization header as a Bearer token.
 * Verifies the token's signature and expiration.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'supersecret',
    });
  }

  /**
   * Called after the token is successfully verified.
   * Returns the user data that will be attached to the request object.
   * @param payload The decoded JWT payload
   */
  async validate(payload: any) {
    return { id: payload.sub, email: payload.email };
  }
}
