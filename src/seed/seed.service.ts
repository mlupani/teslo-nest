import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { initialData } from './data/seed-data';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../auth/entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService {
  constructor(
    private readonly ProductsService: ProductsService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async execute() {
    await this.deleteAllTables();
    const user = await this.insertNewUsers();
    await this.insertNewProducts(user);
    return 'Execute Seed';
  }

  async deleteAllTables(){
    await this.ProductsService.deleteAllProducts();
    await this.userRepository.delete({});
  }

  async insertNewUsers(){
    const users = initialData.users;
    const createUsersPromises = [];
    users.forEach((user) => {
      user.password = bcrypt.hashSync(user.password, 10);
      createUsersPromises.push(this.userRepository.create(user));
    });
    const dbUsers = await this.userRepository.save(createUsersPromises)
    return dbUsers[0];
  }

  private async insertNewProducts(user: User) {
    await this.ProductsService.deleteAllProducts();
    const products = initialData.products;
    const createProductsPromises = [];
    products.forEach((product) =>
      createProductsPromises.push(this.ProductsService.create(product, user)),
    );
    await Promise.all(createProductsPromises);
  }
}
