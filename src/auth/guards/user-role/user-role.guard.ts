import { CanActivate, ExecutionContext, ForbiddenException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { ROLES_KEY } from 'src/auth/decorators/role-protected.decorator';
import { User } from 'src/auth/entities/user.entity';

@Injectable()
export class UserRoleGuard implements CanActivate {

  constructor(
    private readonly reflector: Reflector
  ){

  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const roles = this.reflector.get<string[]>(ROLES_KEY, context.getHandler());
    const req = context.switchToHttp().getRequest();
    const user = req.user as User;
    if(!roles) return true;
    if(roles.length === 0) return true;
    if (!user) throw new InternalServerErrorException('User not found');
    for(const role of user.roles){
      if(roles.includes(role)) return true;
    }

    throw new ForbiddenException(`User role is not allowed to access this route need ${roles}`);
  }
}
