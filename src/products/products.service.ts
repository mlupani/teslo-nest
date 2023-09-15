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
import { DataSource, Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dto/Pagination.dto';
import { validate as IsUUID } from 'uuid';
import { ProductImage, Product } from './entities';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(ProductImage)
    private productImageRepository: Repository<ProductImage>,
    private readonly dataSource: DataSource,
  ) {}

  async create(createProductDto: CreateProductDto) {
    const { images = [], ...restProps } = createProductDto;
    const product = this.productRepository.create({
      ...restProps,
      images: images.map((image) =>
        this.productImageRepository.create({ url: image }),
      ),
    });
    try {
      await this.productRepository.save(product);
      return {
        ...product,
        images,
      };
    } catch (error) {
      this.handleDbExceptions(error);
    }
  }

  async findAll(PaginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = PaginationDto;
    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true,
      },
    });
    return products.map((product) => ({
      ...product,
      images: product.images.map((image) => image.url),
    }));
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
        .leftJoinAndSelect('product.images', 'images')
      });
      */
      //LA OTRA MANERA ES CON QUERY BUILDER
      term = term.toLocaleLowerCase();
      product = await this.productRepository
        .createQueryBuilder('product')
        .where('LOWER(product.title) = :term', { term })
        .orWhere('product.slug = :term', { term })
        .leftJoinAndSelect('product.images', 'images')
        .getOne();
    }

    if (!product) {
      throw new NotFoundException(`Product with ${term} not found`);
    }
    return {
      ...product,
      images: product.images.map((image) => image.url),
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const { images, ...restProps } = updateProductDto;
    const product = await this.productRepository.preload({
      id,
      ...restProps,
    });
    if (!product) {
      throw new NotFoundException(`Product with id ${id} not found`);
    }
    //Query runner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      //await this.productRepository.save(product);
      if (images) {
        await queryRunner.manager.delete(ProductImage, { product: { id } });
        product.images = images.map((image) =>
          this.productImageRepository.create({ url: image }),
        );
        await queryRunner.manager.save(product);
      } else {
        product.images = await this.productImageRepository.find({
          where: { product: { id } },
        });
      }
      await queryRunner.commitTransaction();
      await queryRunner.release();

      return product;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.handleDbExceptions(error);
    }
  }

  async remove(id: string) {
    return await this.productRepository.delete(id);
  }

  async deleteAllProducts() {
    const query = this.productRepository.createQueryBuilder('product');
    try {
      return await query.delete().execute();
    } catch (error) {
      this.handleDbExceptions(error);
    }
  }

  private handleDbExceptions(error: any) {
    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }
    this.logger.error(error);
    throw new InternalServerErrorException('Unexpected error check logs');
  }
}
