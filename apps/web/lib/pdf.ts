import { PDFDocument, rgb, StandardFonts, PDFPage, PDFFont } from "pdf-lib";
import type { SavedJob, AppSettings } from "@brickie/lib";
import { formatRange, calculateFinalPricing, formatCurrency, type PricingInputs } from "@brickie/lib";

// Colors
const BRICK_RED = rgb(0.91, 0.36, 0.21); // #E85D35
const DARK = rgb(0.1, 0.12, 0.18); // #1A1F2E
const GRAY = rgb(0.4, 0.43, 0.47);
const LIGHT_GRAY = rgb(0.6, 0.63, 0.67);
const VERY_LIGHT = rgb(0.96, 0.96, 0.97);

interface DrawTextOptions {
  page: PDFPage;
  text: string;
  x: number;
  y: number;
  size: number;
  font: PDFFont;
  color?: ReturnType<typeof rgb>;
  maxWidth?: number;
}

function drawText({ page, text, x, y, size, font, color = DARK, maxWidth }: DrawTextOptions): number {
  if (maxWidth) {
    // Word wrap
    const words = text.split(" ");
    let line = "";
    let currentY = y;

    for (const word of words) {
      const testLine = line + (line ? " " : "") + word;
      const width = font.widthOfTextAtSize(testLine, size);

      if (width > maxWidth && line) {
        page.drawText(line, { x, y: currentY, size, font, color });
        currentY -= size + 4;
        line = word;
      } else {
        line = testLine;
      }
    }

    if (line) {
      page.drawText(line, { x, y: currentY, size, font, color });
      currentY -= size + 4;
    }

    return currentY;
  }

  page.drawText(text, { x, y, size, font, color });
  return y - size - 4;
}

export async function generatePDF(
  job: SavedJob,
  settings: AppSettings
): Promise<void> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4
  const { width, height } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const margin = 50;
  const contentWidth = width - margin * 2;
  let y = height - margin;

  // Try to embed logo if provided
  let logoImage: Awaited<ReturnType<typeof pdfDoc.embedPng>> | null = null;
  if (settings.logoUrl) {
    try {
      const response = await fetch(settings.logoUrl);
      const imageData = await response.arrayBuffer();
      const uint8Array = new Uint8Array(imageData);

      // Detect image type from URL or try PNG first
      if (settings.logoUrl.toLowerCase().includes(".png")) {
        logoImage = await pdfDoc.embedPng(uint8Array);
      } else {
        try {
          logoImage = await pdfDoc.embedJpg(uint8Array);
        } catch {
          logoImage = await pdfDoc.embedPng(uint8Array);
        }
      }
    } catch (err) {
      console.error("Failed to embed logo:", err);
    }
  }

  // ============ HEADER ============
  const headerHeight = 100;

  // Header background
  page.drawRectangle({
    x: 0,
    y: height - headerHeight,
    width,
    height: headerHeight,
    color: DARK,
  });

  // Logo or company name
  let headerX = margin;
  if (logoImage) {
    const logoMaxHeight = 50;
    const logoMaxWidth = 120;
    const scale = Math.min(logoMaxHeight / logoImage.height, logoMaxWidth / logoImage.width);
    const logoWidth = logoImage.width * scale;
    const logoHeight = logoImage.height * scale;

    page.drawImage(logoImage, {
      x: margin,
      y: height - headerHeight / 2 - logoHeight / 2,
      width: logoWidth,
      height: logoHeight,
    });
    headerX = margin + logoWidth + 20;
  }

  // Company name
  if (settings.companyName) {
    page.drawText(settings.companyName.toUpperCase(), {
      x: logoImage ? headerX : margin,
      y: height - 45,
      size: logoImage ? 14 : 20,
      font: fontBold,
      color: rgb(1, 1, 1),
    });
  }

  // "QUOTATION" badge on right
  const quoteText = "QUOTATION";
  const quoteWidth = fontBold.widthOfTextAtSize(quoteText, 12);
  page.drawRectangle({
    x: width - margin - quoteWidth - 20,
    y: height - 55,
    width: quoteWidth + 20,
    height: 26,
    color: BRICK_RED,
  });
  page.drawText(quoteText, {
    x: width - margin - quoteWidth - 10,
    y: height - 48,
    size: 12,
    font: fontBold,
    color: rgb(1, 1, 1),
  });

  // Date
  const dateStr = new Date(job.timestamp).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  page.drawText(dateStr, {
    x: width - margin - fontBold.widthOfTextAtSize(dateStr, 10),
    y: height - 75,
    size: 10,
    font,
    color: rgb(0.7, 0.7, 0.7),
  });

  y = height - headerHeight - 30;

  // ============ CONTACT INFO ============
  if (settings.phone || settings.address || settings.email) {
    const contactY = y;
    let contactX = margin;

    if (settings.phone) {
      page.drawText(settings.phone, { x: contactX, y: contactY, size: 10, font, color: GRAY });
      contactX += font.widthOfTextAtSize(settings.phone, 10) + 20;
    }
    if (settings.email) {
      page.drawText(settings.email, { x: contactX, y: contactY, size: 10, font, color: GRAY });
    }
    if (settings.address) {
      const addressOneLine = settings.address.replace(/\n/g, ", ");
      page.drawText(addressOneLine, { x: margin, y: contactY - 14, size: 9, font, color: LIGHT_GRAY });
    }
    y -= 40;
  }

  // ============ JOB DETAILS BOX ============
  const boxHeight = 80;
  page.drawRectangle({
    x: margin,
    y: y - boxHeight,
    width: contentWidth,
    height: boxHeight,
    color: VERY_LIGHT,
  });

  // Job type and details
  page.drawText(job.inputs.jobType.toUpperCase(), {
    x: margin + 15,
    y: y - 25,
    size: 16,
    font: fontBold,
    color: DARK,
  });

  const jobMeta = `${job.inputs.difficulty} • ${job.inputs.anchorType}: ${job.inputs.anchorValue}m${job.inputs.hasOpenings ? " • Has openings" : ""}`;
  page.drawText(jobMeta, {
    x: margin + 15,
    y: y - 45,
    size: 10,
    font,
    color: GRAY,
  });

  // Area badge
  const areaText = `${job.outputs.area_m2.toFixed(1)} m²`;
  page.drawText(areaText, {
    x: width - margin - 15 - font.widthOfTextAtSize(areaText, 14),
    y: y - 35,
    size: 14,
    font: fontBold,
    color: BRICK_RED,
  });

  y -= boxHeight + 25;

  // ============ PRICING ============
  // Calculate final pricing
  const pricingInputs: PricingInputs = {
    method: settings.defaultPricingMethod,
    dayRate: settings.defaultDayRate,
    ratePer1000: settings.defaultRatePer1000,
    ratePerM2: settings.defaultRatePerM2,
    materialMarkup: settings.materialMarkup,
    includeVAT: settings.vatRegistered,
    vatRate: settings.vatRate,
  };
  const pricing = calculateFinalPricing(job.outputs, pricingInputs, job.inputs.jobType);

  page.drawText("QUOTE BREAKDOWN", {
    x: margin,
    y,
    size: 11,
    font: fontBold,
    color: GRAY,
  });
  y -= 25;

  // Price lines
  const priceLines = [
    { label: "Labour", value: `${formatCurrency(pricing.labourLow)} – ${formatCurrency(pricing.labourHigh)}` },
    { label: "Materials", value: `${formatCurrency(pricing.materialsLow)} – ${formatCurrency(pricing.materialsHigh)}` },
  ];

  if (settings.vatRegistered) {
    priceLines.push({
      label: "VAT (20%)",
      value: `${formatCurrency(pricing.vatLow)} – ${formatCurrency(pricing.vatHigh)}`,
    });
  }

  for (const line of priceLines) {
    page.drawText(line.label, { x: margin, y, size: 10, font, color: GRAY });
    page.drawText(line.value, {
      x: width - margin - font.widthOfTextAtSize(line.value, 10),
      y,
      size: 10,
      font,
      color: DARK,
    });
    y -= 18;
  }

  // Divider
  y -= 5;
  page.drawLine({
    start: { x: margin, y },
    end: { x: width - margin, y },
    thickness: 1,
    color: rgb(0.9, 0.9, 0.9),
  });
  y -= 15;

  // Total
  const totalText = `${formatCurrency(pricing.totalLow)} – ${formatCurrency(pricing.totalHigh)}`;
  page.drawText("TOTAL", {
    x: margin,
    y,
    size: 12,
    font: fontBold,
    color: DARK,
  });
  page.drawText(totalText, {
    x: width - margin - fontBold.widthOfTextAtSize(totalText, 18),
    y: y - 2,
    size: 18,
    font: fontBold,
    color: BRICK_RED,
  });

  if (settings.vatRegistered) {
    page.drawText("inc. VAT", {
      x: width - margin - font.widthOfTextAtSize("inc. VAT", 9),
      y: y - 18,
      size: 9,
      font,
      color: LIGHT_GRAY,
    });
  }

  y -= 50;

  // ============ MATERIALS ============
  page.drawText("MATERIALS REQUIRED", {
    x: margin,
    y,
    size: 11,
    font: fontBold,
    color: GRAY,
  });
  y -= 20;

  const materials = [
    { label: "Bricks", value: formatRange(job.outputs.brick_count_range) },
    { label: "Sand", value: `${formatRange(job.outputs.materials.sand_kg_range)} kg` },
    { label: "Cement", value: `${formatRange(job.outputs.materials.cement_bags_range)} bags` },
  ];

  for (const mat of materials) {
    page.drawText(`${mat.label}:`, { x: margin, y, size: 10, font, color: GRAY });
    page.drawText(mat.value, { x: margin + 80, y, size: 10, font: fontBold, color: DARK });
    y -= 16;
  }

  y -= 20;

  // ============ LABOUR ============
  page.drawText("ESTIMATED LABOUR", {
    x: margin,
    y,
    size: 11,
    font: fontBold,
    color: GRAY,
  });
  y -= 20;

  const hours = job.outputs.labour_hours_range;
  const days = [Math.ceil(hours[0] / 8 * 10) / 10, Math.ceil(hours[1] / 8 * 10) / 10];
  page.drawText(`${hours[0]}–${hours[1]} hours (${days[0]}–${days[1]} days)`, {
    x: margin,
    y,
    size: 10,
    font,
    color: DARK,
  });
  y -= 30;

  // ============ ASSUMPTIONS ============
  if (job.outputs.assumptions?.length > 0) {
    page.drawText("ASSUMPTIONS", { x: margin, y, size: 11, font: fontBold, color: GRAY });
    y -= 18;

    for (const item of job.outputs.assumptions.slice(0, 5)) {
      page.drawText(`• ${item}`, { x: margin, y, size: 9, font, color: GRAY });
      y -= 14;
    }
    y -= 15;
  }

  // ============ EXCLUSIONS ============
  if (job.outputs.exclusions?.length > 0) {
    page.drawText("NOT INCLUDED", { x: margin, y, size: 11, font: fontBold, color: GRAY });
    y -= 18;

    for (const item of job.outputs.exclusions.slice(0, 5)) {
      page.drawText(`• ${item}`, { x: margin, y, size: 9, font, color: GRAY });
      y -= 14;
    }
    y -= 15;
  }

  // ============ DISCLAIMER ============
  // Draw at bottom of page
  const disclaimerY = margin + 60;

  page.drawLine({
    start: { x: margin, y: disclaimerY + 15 },
    end: { x: width - margin, y: disclaimerY + 15 },
    thickness: 0.5,
    color: rgb(0.85, 0.85, 0.85),
  });

  page.drawText("TERMS & CONDITIONS", {
    x: margin,
    y: disclaimerY,
    size: 8,
    font: fontBold,
    color: LIGHT_GRAY,
  });

  drawText({
    page,
    text: settings.disclaimerText,
    x: margin,
    y: disclaimerY - 12,
    size: 7,
    font,
    color: LIGHT_GRAY,
    maxWidth: contentWidth,
  });

  // ============ FOOTER ============
  const footerY = margin - 15;

  page.drawText("Powered by Brickie", {
    x: margin,
    y: footerY,
    size: 8,
    font,
    color: rgb(0.75, 0.75, 0.75),
  });

  const refText = `Ref: ${job.id.slice(0, 8).toUpperCase()}`;
  page.drawText(refText, {
    x: width - margin - font.widthOfTextAtSize(refText, 8),
    y: footerY,
    size: 8,
    font,
    color: rgb(0.75, 0.75, 0.75),
  });

  // ============ DOWNLOAD ============
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;

  const fileName = settings.companyName
    ? `${settings.companyName.replace(/[^a-z0-9]/gi, "-").toLowerCase()}-quote-${job.id.slice(0, 8)}.pdf`
    : `brickie-quote-${job.id.slice(0, 8)}.pdf`;

  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
