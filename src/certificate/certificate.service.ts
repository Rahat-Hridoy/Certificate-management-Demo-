import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CertificateProcessor } from './certificate.processor';
import * as path from 'path';
import * as fs from 'fs';

const PDF_DIR = path.join(process.cwd(), 'public', 'pdfs');

@Injectable()
export class CertificateService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly processor: CertificateProcessor,
  ) {}

  async processCsv(templateId: string, csvBuffer: Buffer) {
    const template = await this.prisma.template.findUnique({
      where: { id: templateId },
    });
    if (!template) throw new NotFoundException('Template not found');


    const { htmlContent, title, subtitle } = template;

    const rows = await this.processor.parseCsv(csvBuffer);
    console.log('PARSED ROWS:', JSON.stringify(rows, null, 2));

    if (rows.length === 0) throw new Error('CSV file is empty');

    fs.mkdirSync(PDF_DIR, { recursive: true });

    const results: any[] = [];

    for (const row of rows) {
      const filledHtml = this.processor.fillPlaceholders(htmlContent, {
        title,
        subtitle,
        ...row,
      });
      console.log('FILLED HTML:', filledHtml);

      const fileName = `cert_${Date.now()}_${Math.random().toString(36).slice(2)}.pdf`;
      const filePath = path.join(PDF_DIR, fileName);
      await this.processor.generatePdf(filledHtml, filePath);

      const cert = await this.prisma.certificate.create({
        data: {
          name: row['name'] ?? 'Unknown',
          pdfUrl: `/pdfs/${fileName}`,
          templateId,
        },
      });

      results.push(cert);
    }

    return results;
  }

  async getById(id: string) {
    const cert = await this.prisma.certificate.findUnique({
      where: { id },
      include: { template: true },
    });
    if (!cert) throw new NotFoundException('Certificate not found');
    return cert;
  }

  async listByTemplate(templateId: string) {
    return this.prisma.certificate.findMany({
      where: { templateId },
      orderBy: { createdAt: 'desc' },
    });
  }
}