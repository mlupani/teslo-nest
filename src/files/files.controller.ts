import { Response } from 'Express';
import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
  Get,
  Param,
  Res,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { fileNamer, fileFilter } from './helpers';
import { ConfigService } from '@nestjs/config';

@Controller('files')
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly configService: ConfigService,
  ) {}

  @Post('product')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: fileFilter,
      /*
      limits: {
        fileSize: 1024 * 1024 * 5,
      },
      */
      storage: diskStorage({
        destination: './uploads/products',
        filename: fileNamer,
      }),
    }),
  )
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('file must be an image');

    const secure_url =
      this.configService.get('API_URL') + '/files/product/' + file.filename;
    return { secure_url };
  }

  @Get('product/:imageName')
  getProductImage(@Param('imageName') file: string, @Res() res: Response) {
    const path = this.filesService.getProductImage(file);
    res.sendFile(path);
  }
}
