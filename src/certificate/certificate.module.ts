import { Module } from '@nestjs/common';
import { CertificateController } from './certificate.controller';
import { CertificateService } from './certificate.service';
import { CertificateProcessor } from './certificate.processor';

@Module({
  controllers: [CertificateController],
  providers: [CertificateService, CertificateProcessor],
})
export class CertificateModule {}