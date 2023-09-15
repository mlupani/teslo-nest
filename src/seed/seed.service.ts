import { Injectable } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { initialData } from './data/seed-data';

@Injectable()
export class SeedService {
  constructor(private readonly ProductsService: ProductsService) {}

  async execute() {
    await this.insertNewProducts();
    return 'Execute Seed';
  }

  private async insertNewProducts() {
    await this.ProductsService.deleteAllProducts();
    const products = initialData.products;
    const createProductsPromises = [];
    products.forEach((product) =>
      createProductsPromises.push(this.ProductsService.create(product)),
    );
    await Promise.all(createProductsPromises);
  }
}
