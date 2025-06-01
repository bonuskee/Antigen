import { jsPDF } from "jspdf";
import * as XLSX from "xlsx";
import { Submission, WeeklyStats } from "./mock-atk";
import { endOfWeek, format, startOfWeek } from "./format";

// Add these utility functions for date manipulation using your custom format lib
export function getLastNDays(n: number) {
  const result = [];
  const today = new Date();

  for (let i = n - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);
    result.push(date);
  }

  return result;
}



// Add these functions to generate chart data
export function generateTrendData(submissions: Submission[]) {
  // Get the last 7 days
  const last7Days = getLastNDays(7);

  // Initialize data structure
  const trendData = last7Days.map((day) => ({
    date: format(day, "MMM d"),
    positive: 0,
    negative: 0,
    total: 0,
  }));

  // Populate with submission data
  submissions.forEach((submission: Submission) => {
    const submissionDate = new Date(submission.date);
    const formattedDate = format(submissionDate, "MMM d");

    // Find matching day
    const dayData = trendData.find((day) => day.date === formattedDate);
    if (dayData) {
      dayData.total += 1;
      if (submission.result === "Positive") {
        dayData.positive += 1;
      } else {
        dayData.negative += 1;
      }
    }
  });

  return trendData;
}

export const generateDistributionData = (
  submissions: Submission[]
): { status: "Positive" | "Negative"; value: number; fill: string }[] => {
  const positive = submissions.filter(
    (sub) => sub.result === "Positive"
  ).length;
  const negative = submissions.filter(
    (sub) => sub.result === "Negative"
  ).length;

  return [
    { status: "Positive", value: positive, fill: "#ef4444" },
    { status: "Negative", value: negative, fill: "#22c55e" },
  ];
};

// Add these functions for export functionality
export function exportToExcel(submissions: Submission[]) {
  // Prepare data for export
  const data = submissions.map((sub) => ({
    ID: sub.id,
    Name: sub.name,
    Email: sub.email,
    Date: format(new Date(sub.date), "yyyy-MM-dd"),
    Time: format(new Date(sub.date), "h:mm aa"),
    Result: sub.result,
    Status: sub.verified ? "Verified" : "Pending",
  }));

  // Convert to worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Create workbook and add worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "ATK Reports");

  // Generate file name
  const fileName = `ATK_Reports_${format(new Date(), "yyyy-MM-dd")}.xlsx`;

  // Write and download
  XLSX.writeFile(workbook, fileName);

  return fileName;
}

export function exportToPDF(submissions: Submission[], stats: WeeklyStats) {
  // Create new PDF document with landscape orientation for more width
  const doc = new jsPDF({
    orientation: 'landscape',
  });

  // Add title
  doc.setFontSize(18);
  doc.text("ATK Reports Dashboard", 14, 20);

  // Add date range
  const startDate = startOfWeek(new Date());
  const endDate = endOfWeek(new Date());
  const dateRangeText = `${format(startDate, "MMM d, yyyy")} - ${format(
    endDate,
    "MMM d, yyyy"
  )}`;
  doc.setFontSize(12);
  doc.text(dateRangeText, 14, 30);

  // Add statistics
  doc.setFontSize(14);
  doc.text("Summary Statistics", 14, 45);
  doc.setFontSize(10);
  doc.text(`Total Submissions: ${stats.totalSubmissions}`, 14, 55);
  doc.text(
    `Positive Tests: ${stats.positiveTests} (${stats.positiveRate}%)`,
    14,
    62
  );
  doc.text(`Pending Verification: ${stats.pendingVerification}`, 14, 69);
  doc.text(`Missed Submissions: ${stats.missedSubmissions}`, 14, 76);

  // Add table headers
  doc.setFontSize(12);
  doc.text("Recent Submission Details", 14, 90);

  const headers = ["ID", "Name", "Email", "Date", "Result", "Status"];
  let y = 100;

  doc.setFillColor(240, 240, 240);
  doc.rect(14, y - 5, 280, 8, "F");

  doc.setFontSize(10);
  // Define column positions with better spacing for all columns
  const columnPositions = [14, 80, 150, 210, 250, 280];

  headers.forEach((header, i) => {
    doc.text(header, columnPositions[i], y);
  });

  y += 8;

  // Add submission data (up to 20 rows)
  const maxRows = Math.min(submissions.length, 20);
  for (let i = 0; i < maxRows; i++) {
    const sub = submissions[i];

    if (y > 270) {
      // Add new page if needed
      doc.addPage();
      y = 20;
    }

    // Truncate long IDs to prevent overlapping
    const truncatedId = sub.id.toString().length > 20
      ? sub.id.toString().substring(0, 20) + "..."
      : sub.id.toString();
    doc.text(truncatedId, columnPositions[0], y);

    // Allow more characters for name and email
    doc.text(sub.name.substring(0, 25), columnPositions[1], y);
    doc.text(sub.email.substring(0, 30), columnPositions[2], y);
    doc.text(format(new Date(sub.date), "yyyy-MM-dd"), columnPositions[3], y);
    doc.text(sub.result, columnPositions[4], y);
    doc.text(sub.verified ? "Verified" : "Pending", columnPositions[5], y);

    y += 7;
  }

  // Generate file name and save
  const fileName = `ATK_Reports_${format(new Date(), "yyyy-MM-dd")}.pdf`;
  doc.save(fileName);

  return fileName;
}
