import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class RolesGuard implements CanActivate {
  public constructor(
    private readonly reflector: Reflector,
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {}

  async canActivate(context: ExecutionContext) {
    const requiredRoles = this.reflector.getAllAndOverride('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }
    const request = context.switchToHttp().getRequest();
    const token = request.headers['Authorization'];
    if (!token) {
      throw new UnauthorizedException();
    }
    const user = await firstValueFrom(
      this.authClient.send('get_user_from_token', JSON.stringify({ token })),
    );
    if (!user) {
      throw new UnauthorizedException();
    }
    return requiredRoles.some((role) => user['role']?.includes(role));
  }
}
