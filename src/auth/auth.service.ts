import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto, LoginUserDto } from './dto';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async create(CreateUserDto: CreateUserDto) {
    try {
      const user = this.userRepository.create(CreateUserDto);
      user.password = await bcrypt.hash(user.password, 10);
      await this.userRepository.save(user);
      delete user.password;
      const token = this.jwtService.sign({ id: user.id });
      return {
        ...user,
        token,
      };
    } catch (error) {
      this.handleDbExceptions(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;
    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true, id: true },
    });
    if (!user) throw new UnauthorizedException('Invalid credentials (email)');
    if (!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException('Invalid credentials (password)');
    const token = this.jwtService.sign({ id: user.id });
    return {
      ...user,
      token,
    };
  }

  async revalidateToken(user: User) {
    return {
      ...user,
      token: this.jwtService.sign({ id: user.id })
    }
  }

  handleDbExceptions(error: any): never {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }

    throw new InternalServerErrorException('Check logs');
  }
}
