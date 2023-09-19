import { join } from 'path';
import { Injectable, BadRequestException } from '@nestjs/common';
import { existsSync } from 'fs';

@Injectable()
export class FilesService {
  getProductImage(file) {
    const path = join(__dirname, '../../uploads/products', file);
    if (!existsSync(path)) throw new BadRequestException('file not found');

    return path;
  }
}
