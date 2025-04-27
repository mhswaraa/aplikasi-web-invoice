// /js/services/PDFService.js

export const PDFService = {
    exportInvoiceToPDF(elementId, filename = 'invoice.pdf') {
      const element = document.getElementById(elementId);
      if (!element) return;
  
      html2pdf()
        .from(element)
        .set({
          margin: 0.5,
          filename,
          html2canvas: { scale: 2 },
          jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
        })
        .save();
    }
  };
  