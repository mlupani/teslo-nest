import { Type } from 'class-transformer';
import { IsOptional, IsPositive, Min } from 'class-validator';
export class PaginationDto {
  @IsOptional()
  @IsPositive()
  @Type(() => Number) // Type transform the value to number
  limit?: number;

  @IsOptional()
  @Min(0)
  @Type(() => Number) // Type transform the value to number
  offset?: number;
}
