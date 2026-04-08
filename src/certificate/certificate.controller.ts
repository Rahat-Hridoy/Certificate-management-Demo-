import {
  Controller,
  Post,
  Get,
  Param,
  Query,
  Body,
  UploadedFile,
  UseInterceptors,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CertificateService } from './certificate.service';

@Controller('certificates')
export class CertificateController {
  constructor(private readonly certificateService: CertificateService) {}

  @Post('upload-csv')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      fileFilter: (_, file, cb) => {
        if (!file.originalname.endsWith('.csv')) {
          return cb(new BadRequestException('Only .csv files allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  async uploadCsv(
    @Body('templateId') templateId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!templateId) throw new BadRequestException('templateId is required');
    if (!file) throw new BadRequestException('CSV file is required');

    const certificates = await this.certificateService.processCsv(
      templateId,
      file.buffer,
    );

    return {
      message: `${certificates.length} certificate(s) generated`,
      certificates,
    };
  }

  @Get()
  listByTemplate(@Query('templateId') templateId: string) {
    return this.certificateService.listByTemplate(templateId);
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.certificateService.getById(id);
  }
}