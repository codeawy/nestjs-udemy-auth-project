import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { EnvConfigService } from 'src/config/env.config';
import { UsersService } from '../../users/users.service';
import { Role } from 'src/common';

interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
}

/**
 * JWT authentication strategy for Passport.
 *
 * Extracts and validates JWT tokens from incoming requests to authenticate users.
 * Uses the JSON Web Token Strategy from passport-jwt to verify token signature
 * and decode the payload, allowing protected routes to identify the requesting user.
 *
 * On successful validation, attaches a `{ id, email, role }` object to `req.user`.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: EnvConfigService,
    private usersService: UsersService,
  ) {
    const secret = config.get('JWT_ACCESS_SECRET');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  async validate(payload: JwtPayload): Promise<{ id: string; email: string; role: Role }> {
    const user = await this.usersService.findOneByEmail(payload.email);
    if (!user) {
      throw new UnauthorizedException();
    }

    return { id: user.id, email: user.email, role: user.role };
  }
}
