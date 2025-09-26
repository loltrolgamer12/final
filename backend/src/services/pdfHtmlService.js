const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const puppeteer = require('puppeteer');

async function renderHtmlReporte(data) {
  // Cargar plantilla HTML
  const templatePath = path.join(__dirname, '../templates/reporte.html');
  const templateSource = fs.readFileSync(templatePath, 'utf8');
  const template = handlebars.compile(templateSource);
  // Renderizar HTML con datos
  return template(data);
}

async function generarPdfDesdeHtml(html, outputPath = null) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  // Esperar a que cargue el logo si existe
  await new Promise(resolve => setTimeout(resolve, 500));
  const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true });
  console.log('Tamaño del PDF generado:', pdfBuffer.length);
  await browser.close();
  if (outputPath) fs.writeFileSync(outputPath, pdfBuffer);
  return pdfBuffer;
}

module.exports = {
  renderHtmlReporte,
  generarPdfDesdeHtml
};
