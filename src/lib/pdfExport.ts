import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { logger } from "@/lib/monitoring";

export const exportEstimateToPDF = async (estimate: {
  id: string;
  customer_name: string;
  total_cost: number;
  items: Array<{
    name: string;
    quantity: number;
    unit: string;
    unit_cost: number;
    total_cost: number;
  }>;
  created_at: string;
}) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  let yPos = 20;

  // Header
  pdf.setFontSize(20);
  pdf.text("Asphalt OS - Estimate", pageWidth / 2, yPos, { align: "center" });
  yPos += 15;

  // Customer info
  pdf.setFontSize(12);
  pdf.text(`Customer: ${estimate.customer_name}`, 20, yPos);
  yPos += 8;
  pdf.text(`Date: ${new Date(estimate.created_at).toLocaleDateString()}`, 20, yPos);
  yPos += 15;

  // Table header
  pdf.setFontSize(10);
  pdf.setFont(undefined, "bold");
  pdf.text("Item", 20, yPos);
  pdf.text("Qty", 100, yPos);
  pdf.text("Unit", 120, yPos);
  pdf.text("Unit Cost", 145, yPos);
  pdf.text("Total", 175, yPos);
  yPos += 5;

  // Line under header
  pdf.line(20, yPos, 190, yPos);
  yPos += 8;

  // Table rows
  pdf.setFont(undefined, "normal");
  estimate.items.forEach((item) => {
    if (yPos > 270) {
      pdf.addPage();
      yPos = 20;
    }

    pdf.text(item.name.substring(0, 30), 20, yPos);
    pdf.text(item.quantity.toString(), 100, yPos);
    pdf.text(item.unit, 120, yPos);
    pdf.text(`$${item.unit_cost.toFixed(2)}`, 145, yPos);
    pdf.text(`$${item.total_cost.toFixed(2)}`, 175, yPos);
    yPos += 8;
  });

  // Total
  yPos += 5;
  pdf.line(20, yPos, 190, yPos);
  yPos += 8;
  pdf.setFont(undefined, "bold");
  pdf.setFontSize(12);
  pdf.text(`Total: $${estimate.total_cost.toFixed(2)}`, 175, yPos, { align: "right" });

  // Save
  pdf.save(`estimate-${estimate.customer_name}-${Date.now()}.pdf`);
};

export const exportAIReportToPDF = async (
  analysis: {
    condition: string;
    confidence_score: number;
    area_sqft: number;
    area_sqm: number;
    detected_issues: Array<{
      type: string;
      severity: string;
      location: string;
    }>;
    recommendations: string[];
    priority: string;
    estimated_repair_cost?: string;
    ai_notes?: string;
  },
  imageDataUrl?: string,
) => {
  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.getWidth();
  let yPos = 20;

  // Header
  pdf.setFontSize(20);
  pdf.text("AI Asphalt Surface Analysis", pageWidth / 2, yPos, { align: "center" });
  yPos += 15;

  // Date
  pdf.setFontSize(10);
  pdf.text(`Report Date: ${new Date().toLocaleDateString()}`, 20, yPos);
  yPos += 15;

  // Summary Section
  pdf.setFontSize(14);
  pdf.setFont(undefined, "bold");
  pdf.text("Summary", 20, yPos);
  yPos += 8;

  pdf.setFontSize(10);
  pdf.setFont(undefined, "normal");
  pdf.text(`Condition: ${analysis.condition}`, 20, yPos);
  yPos += 6;
  pdf.text(`Confidence Score: ${analysis.confidence_score}%`, 20, yPos);
  yPos += 6;
  pdf.text(`Priority: ${analysis.priority}`, 20, yPos);
  yPos += 6;
  if (analysis.area_sqft > 0) {
    pdf.text(
      `Area: ${analysis.area_sqft.toLocaleString()} ft² (${analysis.area_sqm.toLocaleString()} m²)`,
      20,
      yPos,
    );
    yPos += 6;
  }
  if (analysis.estimated_repair_cost) {
    pdf.text(`Estimated Repair Cost: ${analysis.estimated_repair_cost}`, 20, yPos);
    yPos += 6;
  }
  yPos += 5;

  // Image if provided
  if (imageDataUrl) {
    try {
      const imgWidth = 170;
      const imgHeight = 100;
      if (yPos + imgHeight > 270) {
        pdf.addPage();
        yPos = 20;
      }
      pdf.addImage(imageDataUrl, "JPEG", 20, yPos, imgWidth, imgHeight);
      yPos += imgHeight + 10;
    } catch (error) {
      logger.error('Error adding image to PDF', { error });
    }
  }

  // Detected Issues
  if (analysis.detected_issues && analysis.detected_issues.length > 0) {
    if (yPos > 250) {
      pdf.addPage();
      yPos = 20;
    }

    pdf.setFontSize(14);
    pdf.setFont(undefined, "bold");
    pdf.text("Detected Issues", 20, yPos);
    yPos += 8;

    pdf.setFontSize(10);
    pdf.setFont(undefined, "normal");
    analysis.detected_issues.forEach((issue) => {
      if (yPos > 270) {
        pdf.addPage();
        yPos = 20;
      }
      pdf.text(
        `• ${issue.type.replace(/_/g, " ")}: ${issue.severity} (${issue.location})`,
        25,
        yPos,
      );
      yPos += 6;
    });
    yPos += 5;
  }

  // Recommendations
  if (analysis.recommendations && analysis.recommendations.length > 0) {
    if (yPos > 250) {
      pdf.addPage();
      yPos = 20;
    }

    pdf.setFontSize(14);
    pdf.setFont(undefined, "bold");
    pdf.text("Recommendations", 20, yPos);
    yPos += 8;

    pdf.setFontSize(10);
    pdf.setFont(undefined, "normal");
    analysis.recommendations.forEach((rec) => {
      if (yPos > 270) {
        pdf.addPage();
        yPos = 20;
      }
      const lines = pdf.splitTextToSize(`• ${rec}`, 170);
      lines.forEach((line: string) => {
        pdf.text(line, 25, yPos);
        yPos += 6;
      });
    });
    yPos += 5;
  }

  // AI Notes
  if (analysis.ai_notes) {
    if (yPos > 250) {
      pdf.addPage();
      yPos = 20;
    }

    pdf.setFontSize(14);
    pdf.setFont(undefined, "bold");
    pdf.text("AI Analysis Notes", 20, yPos);
    yPos += 8;

    pdf.setFontSize(10);
    pdf.setFont(undefined, "normal");
    const lines = pdf.splitTextToSize(analysis.ai_notes, 170);
    lines.forEach((line: string) => {
      if (yPos > 270) {
        pdf.addPage();
        yPos = 20;
      }
      pdf.text(line, 20, yPos);
      yPos += 6;
    });
  }

  // Footer
  pdf.setFontSize(8);
  pdf.setTextColor(128);
  pdf.text("Powered by Asphalt OS - AI Surface Detection", pageWidth / 2, 285, { align: "center" });

  // Save
  pdf.save(`ai-analysis-report-${Date.now()}.pdf`);
};
