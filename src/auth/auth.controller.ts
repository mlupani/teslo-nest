import { Controller, Post, Body, Get, UseGuards, SetMetadata } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginUserDto, CreateUserDto } from './dto';
import { GetUser, RoleProtected, getRawHeaders, Auth } from './decorators';
import { User } from './entities/user.entity';
import { UserRoleGuard } from './guards/user-role/user-role.guard';
import { ValidRoles } from './interfaces/valid-roles';
import { ApiTags } from '@nestjs/swagger'

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  create(@Body() createAuthDto: CreateUserDto) {
    return this.authService.create(createAuthDto);
  }

  @Post('login')
  login(@Body() loginUserDto: LoginUserDto) {
    return this.authService.login(loginUserDto);
  }

  @Get('revalidate-token')
  @Auth()
  async revalidateToken(@GetUser() user: User) {
    return await this.authService.revalidateToken(user);
  }

  @Get('private')
  @UseGuards(AuthGuard())
  privateRoute(@GetUser() user: User, @GetUser('email') userEmail: string, @getRawHeaders() rawHeaders: string[]) {
    return {
      message: 'This is a private route',
      user,
      userEmail,
      rawHeaders
    };
  }

  @Get('private2')
  //@SetMetadata('roles', ['admin', 'super-user'])
  @RoleProtected(ValidRoles.admin, ValidRoles.superUser)
  @UseGuards(AuthGuard(), UserRoleGuard)
  privateRoute2(@GetUser() user: User){
    return {
      message: 'This is a private route 2',
      user
    };
  }

  @Get('private3')
  @Auth(ValidRoles.admin, ValidRoles.superUser)
  privateRoute3(@GetUser() user: User){
    return {
      message: 'This is a private route 3',
      user
    };
  }
}
