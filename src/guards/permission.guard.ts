import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
  Inject,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @Inject('AUTH_SERVICE') private readonly authClient: ClientProxy,
  ) {
    this.authClient.connect();
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.authUser;
    const method = request.method;

    const userPermissions = await firstValueFrom(
      this.authClient.send(
        'getUserPermissionsFromRole',
        JSON.stringify({
          role: user.role,
          module: 'Notification',
        }),
      ),
    );

    const hasPermission = (permissionType) => {
      return userPermissions.some(
        (permission) => permission.permission_type === permissionType,
      );
    };

    let permissionGranted = false;

    switch (method) {
      case 'GET':
        permissionGranted = hasPermission('Read') || hasPermission('Admin');
        break;
      case 'POST':
      case 'PUT':
        permissionGranted = hasPermission('Write') || hasPermission('Admin');
        break;
      case 'DELETE':
        permissionGranted = hasPermission('Admin');
        break;
      default:
        throw new ForbiddenException('notHaveEnoughPermissions');
    }

    if (!permissionGranted) {
      throw new ForbiddenException('notHaveEnoughPermissions');
    }

    return true;
  }
}
