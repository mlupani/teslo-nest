import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Min } from 'class-validator';
export class PaginationDto {
  @ApiProperty({
    default: 10,
    description: 'Amount of items per page',
  })
  @IsOptional()
  @IsPositive()
  @Type(() => Number) // Type transform the value to number
  limit?: number;

  @ApiProperty({
    default: 0,
    description: 'Amount of items to skip',
  })
  @IsOptional()
  @Min(0)
  @Type(() => Number) // Type transform the value to number
  offset?: number;
}
