import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dto/Pagination.dto';
import { validate as IsUUID } from 'uuid';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const product = this.productRepository.create(createProductDto);
    try {
      await this.productRepository.save(product);
      return product;
    } catch (error) {
      this.handleDbExceptions(error);
    }
  }

  async findAll(PaginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = PaginationDto;
    return await this.productRepository.find({
      take: limit,
      skip: offset,
    });
  }

  async findOne(term: string) {
    let product: Product;

    if (IsUUID(term)) {
      product = await this.productRepository.findOneBy({ id: term });
    } else {
      // UNA MANERA DE HACERLO
      /*
      product = await this.productRepository.findOne({
        where: [{ title: term }, { slug: term }],
      });
      */
      //LA OTRA MANERA ES CON QUERY BUILDER
      term = term.toLocaleLowerCase();
      product = await this.productRepository
        .createQueryBuilder('product')
        .where('LOWER(product.title) = :term', { term })
        .orWhere('product.slug = :term', { term })
        .getOne();
    }

    if (!product) {
      throw new NotFoundException(`Product with ${term} not found`);
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const product = await this.productRepository.preload({
      id,
      ...updateProductDto,
    });
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    try {
      await this.productRepository.save(product);
      return product;
    } catch (error) {
      this.handleDbExceptions(error);
    }
  }

  async remove(id: string) {
    return await this.productRepository.delete(id);
  }

  private handleDbExceptions(error: any) {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error check logs');
  }
}
