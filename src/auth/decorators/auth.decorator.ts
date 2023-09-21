import { UseGuards, applyDecorators } from "@nestjs/common"
import { ValidRoles } from "../interfaces/valid-roles"
import { RoleProtected } from './role-protected.decorator';
import { AuthGuard } from "@nestjs/passport";
import { UserRoleGuard } from "../guards/user-role/user-role.guard";

export const Auth = (...roles: ValidRoles[]) => {
    return applyDecorators(
        RoleProtected(...roles),
        UseGuards(AuthGuard(), UserRoleGuard)
    )
}