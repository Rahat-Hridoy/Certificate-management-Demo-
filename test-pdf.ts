import puppeteer from 'puppeteer';
import * as path from 'path';
import * as fs from 'fs';

async function main() {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  const page = await browser.newPage();

  const html = `
    <html>
      <body style="text-align:center; font-family:Arial; padding:50px">
        <h1>Certificate of Achievement</h1>
        <p>This certificate is presented to</p>
        <h2>John Doe</h2>
        <p>Course: Web Development</p>
        <p>Date: 2025-01-15</p>
      </body>
    </html>
  `;

  await page.setContent(html, { waitUntil: 'domcontentloaded' });

  const outputPath = path.join(process.cwd(), 'test-output.pdf');
  await page.pdf({
    path: outputPath,
    format: 'A4',
    printBackground: true,
  });

  await browser.close();
  console.log('PDF generated at:', outputPath);
}

main();