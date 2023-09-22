import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  MinLength,
  IsNumber,
  IsPositive,
  IsOptional,
  IsInt,
  IsArray,
  IsIn,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    description: 'Product title',
    minLength: 1,
    nullable: false,
  })
  @IsString()
  @MinLength(1)
  title: string;

  @ApiProperty({
    description: 'Product price',
    minimum: 0,
    default: 0,
  })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  price?: number;
  @ApiProperty({
    description: 'Product description',
    minLength: 1,
    nullable: true,
  })
  @IsString()
  @IsOptional()
  description?: string;
  @ApiProperty({
    description: 'Product slug',
    minLength: 1,
    nullable: true,
  })
  @IsString()
  @IsOptional()
  slug?: string;
  @ApiProperty({
    description: 'Product stock',
    minimum: 0,
    default: 0,
  })
  @IsInt()
  @IsPositive()
  @IsOptional()
  stock?: number;
  @ApiProperty({
    description: 'Product sizes',
    example: ['S', 'M', 'L', 'XL'],
  })
  @IsString({ each: true })
  @IsArray()
  sizes: string[];
  @ApiProperty({
    description: 'Product gender'
  })
  @IsIn(['men', 'women', 'unisex', 'kid'])
  gender: string;
  @ApiProperty({
    description: 'Product category',
    example: ['T-shirt', 'Pants', 'Shoes', 'Hat'],
  })
  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  tags: string[];
  @ApiProperty({
    description: 'Product images',
    example: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
  })
  @IsString({ each: true })
  @IsArray()
  @IsOptional()
  images?: string[];
}
