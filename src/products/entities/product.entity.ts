import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
  BeforeUpdate,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { ProductImage } from './product-image.entity';
import { User } from 'src/auth/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity({ name: 'products' })
export class Product {
  @ApiProperty({
    example: '28f2d8d5-b588-44cf-8c8e-cc28405ffb95',
    description: 'The unique identifier of the product',
    uniqueItems: true,
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    example: 'Teslo T-shirt',
    description: 'Product title',
    uniqueItems: true,
  })
  @ApiProperty()
  @Column('text', {
    nullable: false,
    unique: true,
  })
  title: string;

  @ApiProperty({
    example: 10,
    description: 'Product price',
  })
  @Column('float', {
    default: 0,
  })
  price: number;

  @ApiProperty({
    example: 'teslo_t-shirt',
    description: 'Product slug',
  })
  @Column('text', {
    nullable: false,
    unique: true,
  })
  slug: string;

  @ApiProperty({
    example: 0,
    description: 'Product stock',
  })
  @Column('int', {
    default: 0,
  })
  stock: number;

  @ApiProperty({
    example: ['S', 'M', 'L', 'XL'],
    description: 'Product sizes',
  })
  @Column('text', {
    array: true,
  })
  sizes: string[];

  @ApiProperty({
    example: 'Women',
    description: 'Product Gender'
  })
  @Column('text')
  gender: string;

  @ApiProperty({
    example: 'T-shirt',
    description: 'Product category',
  })
  @Column('text', {
    array: true,
    default: [],
  })
  tags: string[];

  @ApiProperty({
    example: ['http://image1.png', 'http://image2.png'],
    description: 'Product image',
  })
  @OneToMany(() => ProductImage, (image) => image.product, {
    cascade: true,
    eager: true,
  })
  images?: ProductImage[];

  @ManyToOne(
    () => User,
    (user) => user.product,
    { eager: true}
  )
  user: User;

  @BeforeInsert()
  @BeforeUpdate()
  checkSlug() {
    if (!this.slug) {
      this.slug = this.title;
    }
    this.slug = this.slug.toLowerCase().replaceAll(' ', '_');
    this.slug = this.slug.toLowerCase().replaceAll('´', '');
  }
}
