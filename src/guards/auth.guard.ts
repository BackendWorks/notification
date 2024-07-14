import {
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { PUBLIC_ROUTE_KEY } from 'src/app/app.constant';

@Injectable()
export class AuthGuard {
  constructor(
    private reflector: Reflector,
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const isRpc = context.getType() === 'rpc';
    const isPublic = this.reflector.getAllAndOverride<boolean>(
      PUBLIC_ROUTE_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (isPublic || isRpc) {
      return true;
    }
    let token = request.headers['authorization'];
    if (!token) {
      throw new UnauthorizedException('auth.accessTokenUnauthorized');
    }
    token = token.replace('Bearer ', '');
    const response = await firstValueFrom(
      this.authClient.send('validateToken', JSON.stringify({ token })),
    );
    if (!response) {
      throw new UnauthorizedException('auth.accessTokenUnauthorized');
    }
    request.user = response;
    return true;
  }
}
