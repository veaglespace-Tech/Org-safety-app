import React from 'react';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { FileSpreadsheet, FileText } from 'lucide-react';

export default function ExportButtons({ data = [], columns = [], filename = 'Export' }) {
  const handleExportExcel = () => {
    if (!data.length) return;
    
    // Map data to requested columns
    const exportData = data.map(row => {
      const rowData = {};
      columns.forEach(col => {
        rowData[col.header] = typeof col.value === 'function' ? col.value(row) : row[col.key];
      });
      return rowData;
    });

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    XLSX.writeFile(workbook, `${filename}.xlsx`);
  };

  const handleExportPDF = () => {
    if (!data.length) return;

    const doc = new jsPDF('landscape');
    
    const tableColumn = columns.map(col => col.header);
    const tableRows = data.map(row => {
      return columns.map(col => {
        const val = typeof col.value === 'function' ? col.value(row) : row[col.key];
        return val !== null && val !== undefined ? String(val) : '';
      });
    });

    // Add title
    doc.setFontSize(14);
    doc.text(`${filename} Report`, 14, 15);
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 22);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 28,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [59, 130, 246] }
    });

    doc.save(`${filename}.pdf`);
  };

  if (data.length === 0) return null;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleExportExcel}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-500/10 dark:text-green-400 dark:hover:bg-green-500/20 border border-green-200 dark:border-green-500/20 rounded-lg transition-colors"
        title="Download Excel"
      >
        <FileSpreadsheet size={16} />
        Excel
      </button>
      <button
        onClick={handleExportPDF}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400 dark:hover:bg-red-500/20 border border-red-200 dark:border-red-500/20 rounded-lg transition-colors"
        title="Download PDF"
      >
        <FileText size={16} />
        PDF
      </button>
    </div>
  );
}
