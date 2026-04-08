import { Injectable } from '@nestjs/common';
import { parse } from 'csv-parse';
import puppeteer from 'puppeteer';

@Injectable()
export class CertificateProcessor {

  parseCsv(buffer: Buffer): Promise<Record<string, string>[]> {
    return new Promise((resolve, reject) => {
      parse(
        buffer,
        {
          columns: true,
          skip_empty_lines: true,
          trim: true,
        },
        (err, records: Record<string, string>[]) => {
          if (err) return reject(err);
          resolve(records);
        },
      );
    });
  }

  // Puppeteer PDF generation
  async generatePdf(html: string, outputPath: string): Promise<void> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    try {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      await page.pdf({
        path: outputPath,
        format: 'A4',
        landscape: true,
        printBackground: true,
      });
    } finally {
      await browser.close();
    }
  }

  // {{key}} → data[key]
  fillPlaceholders(html: string, data: Record<string, string>): string {
    return html.replace(/\{\{(\w+)\}\}/g, (_, key) => data[key] ?? `{{${key}}}`);
  }
}