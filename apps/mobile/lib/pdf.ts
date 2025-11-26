import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { Platform } from "react-native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import type { SavedJob, AppSettings } from "@brickie/lib";
import { formatPriceRange, formatLabourRange, formatRange } from "@brickie/lib";

export async function generatePDF(
  job: SavedJob,
  settings: AppSettings
): Promise<void> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4 size
  const { height } = page.getSize();

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const margin = 50;
  let y = height - margin;
  const lineHeight = 18;
  const sectionGap = 25;

  const darkGray = rgb(0.2, 0.2, 0.2);
  const gray = rgb(0.4, 0.4, 0.4);
  const brickRed = rgb(0.78, 0.36, 0.23);

  // Header
  page.drawText("BRICKIE ESTIMATE", {
    x: margin,
    y,
    size: 24,
    font: fontBold,
    color: brickRed,
  });
  y -= 30;

  if (settings.companyName) {
    page.drawText(settings.companyName, {
      x: margin,
      y,
      size: 14,
      font: fontBold,
      color: darkGray,
    });
    y -= lineHeight;
  }

  const dateStr = new Date(job.timestamp).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  page.drawText(`Date: ${dateStr}`, {
    x: margin,
    y,
    size: 10,
    font,
    color: gray,
  });
  y -= sectionGap;

  // Job Details Section
  page.drawText("JOB DETAILS", {
    x: margin,
    y,
    size: 12,
    font: fontBold,
    color: darkGray,
  });
  y -= lineHeight;

  const jobDetails = [
    `Job Type: ${job.inputs.jobType}`,
    `Anchor Dimension: ${job.inputs.anchorType} = ${job.inputs.anchorValue}m`,
    `Difficulty: ${job.inputs.difficulty}`,
    `Has Openings: ${job.inputs.hasOpenings ? "Yes" : "No"}`,
    `Estimated Area: ${job.outputs.area_m2.toFixed(1)} m²`,
  ];

  for (const detail of jobDetails) {
    page.drawText(detail, {
      x: margin,
      y,
      size: 10,
      font,
      color: darkGray,
    });
    y -= lineHeight;
  }
  y -= sectionGap - lineHeight;

  // Price Section
  page.drawText("ESTIMATED PRICE", {
    x: margin,
    y,
    size: 12,
    font: fontBold,
    color: darkGray,
  });
  y -= lineHeight + 5;

  page.drawText(formatPriceRange(job.outputs.recommended_price_gbp_range), {
    x: margin,
    y,
    size: 20,
    font: fontBold,
    color: brickRed,
  });
  y -= sectionGap;

  // Labour & Materials Section
  page.drawText("LABOUR & MATERIALS", {
    x: margin,
    y,
    size: 12,
    font: fontBold,
    color: darkGray,
  });
  y -= lineHeight;

  const labourMaterials = [
    `Labour: ${formatLabourRange(job.outputs.labour_hours_range)}`,
    `Bricks: ${formatRange(job.outputs.brick_count_range)}`,
    `Sand: ${formatRange(job.outputs.materials.sand_kg_range)} kg`,
    `Cement: ${formatRange(job.outputs.materials.cement_bags_range)} bags`,
  ];

  if (job.outputs.materials.other?.length > 0) {
    labourMaterials.push(`Other: ${job.outputs.materials.other.join(", ")}`);
  }

  for (const item of labourMaterials) {
    page.drawText(item, {
      x: margin,
      y,
      size: 10,
      font,
      color: darkGray,
    });
    y -= lineHeight;
  }
  y -= sectionGap - lineHeight;

  // Assumptions Section
  if (job.outputs.assumptions?.length > 0) {
    page.drawText("ASSUMPTIONS", {
      x: margin,
      y,
      size: 12,
      font: fontBold,
      color: darkGray,
    });
    y -= lineHeight;

    for (const assumption of job.outputs.assumptions) {
      const text = `• ${assumption}`;
      page.drawText(text.substring(0, 80), {
        x: margin,
        y,
        size: 9,
        font,
        color: gray,
      });
      y -= lineHeight - 3;
    }
    y -= sectionGap - lineHeight;
  }

  // Exclusions Section
  if (job.outputs.exclusions?.length > 0) {
    page.drawText("EXCLUSIONS", {
      x: margin,
      y,
      size: 12,
      font: fontBold,
      color: darkGray,
    });
    y -= lineHeight;

    for (const exclusion of job.outputs.exclusions) {
      const text = `• ${exclusion}`;
      page.drawText(text.substring(0, 80), {
        x: margin,
        y,
        size: 9,
        font,
        color: gray,
      });
      y -= lineHeight - 3;
    }
    y -= sectionGap - lineHeight;
  }

  // Disclaimer
  y = Math.max(y, margin + 80);

  page.drawLine({
    start: { x: margin, y: y + 10 },
    end: { x: 595 - margin, y: y + 10 },
    thickness: 0.5,
    color: rgb(0.8, 0.8, 0.8),
  });

  y -= 10;
  page.drawText("DISCLAIMER", {
    x: margin,
    y,
    size: 10,
    font: fontBold,
    color: gray,
  });
  y -= lineHeight - 3;

  // Word wrap disclaimer
  const disclaimerWords = settings.disclaimerText.split(" ");
  let line = "";
  const maxWidth = 495;

  for (const word of disclaimerWords) {
    const testLine = line + (line ? " " : "") + word;
    const width = font.widthOfTextAtSize(testLine, 8);

    if (width > maxWidth) {
      page.drawText(line, {
        x: margin,
        y,
        size: 8,
        font,
        color: gray,
      });
      y -= 12;
      line = word;
    } else {
      line = testLine;
    }
  }

  if (line) {
    page.drawText(line, {
      x: margin,
      y,
      size: 8,
      font,
      color: gray,
    });
  }

  // Footer
  page.drawText("Generated by Brickie App", {
    x: margin,
    y: margin - 10,
    size: 8,
    font,
    color: rgb(0.6, 0.6, 0.6),
  });

  // Save/Download PDF
  const pdfBytes = await pdfDoc.save();
  const base64 = bytesToBase64(pdfBytes);
  const filename = `brickie-estimate-${job.id}.pdf`;

  if (Platform.OS === "web") {
    // Web: Download the file
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } else {
    // Native: Save and share
    const fileUri = `${FileSystem.documentDirectory}${filename}`;
    await FileSystem.writeAsStringAsync(fileUri, base64, {
      encoding: FileSystem.EncodingType.Base64,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: "application/pdf",
        dialogTitle: "Share Estimate PDF",
      });
    }
  }
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
