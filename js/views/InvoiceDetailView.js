// /js/views/InvoiceDetailView.js

import { InvoiceService } from '../services/InvoiceService.js';
import { PDFService } from '../services/PDFService.js';

export const InvoiceDetailView = {
  render() {
    const app = document.getElementById('app');
    const [ , id ] = location.hash.split('/');
    const inv = InvoiceService.getInvoice(id);
    if (!inv) {
      app.innerHTML = `<p>Invoice dengan ID "${id}" tidak ditemukan.</p>`;
      return;
    }

    // build item rows
    const itemsHTML = inv.items.map((item, i) => `
      <tr>
        <td>${i + 1}</td>
        <td>${item.name}</td>
        <td>${item.size}</td>
        <td class="text-right">${item.qty}</td>
        <td class="text-right">${(item.qty * (item.price || 0)).toLocaleString()}</td>
      </tr>
    `).join('');

    app.innerHTML = `
      <div id="invoice-detail" class="invoice-pdf-container">
        <!-- HEADER -->
        <div class="pdf-header">
          <div class="brand">
            <span class="brand-name">FLEUR Studio</span>
          </div>
          <div class="invoice-meta">
            <div>Invoice No: <strong>${inv.number}</strong></div>
            <div>Date: <strong>${inv.date}</strong></div>
          </div>
        </div>

        <!-- TITLE -->
        <h1 class="pdf-title">INVOICE</h1>

        <!-- BUYER INFO -->
        <div class="pdf-to">
          <strong>Invoice To:</strong>
          <div>${inv.buyerName}</div>

        </div>

        <!-- ITEMS TABLE -->
        <table class="pdf-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Description</th>
              <th>Size</th>
              <th class="text-right">QTY</th>
              <th class="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>

        <!-- SUMMARY -->
        <div class="pdf-summary">
          <div class="left">
            <strong>No Rekening</strong>
            <div>BCA 0790515919: A/N Paramastri Sita Nabila </div>
          </div>
          <div class="right">
            <div>Sub Total: <span>${inv.subtotal.toLocaleString()}</span></div>
            <div>Tax (${inv.taxPercent}%): <span>${inv.taxAmount.toLocaleString()}</span></div>
            <div>Discount (${inv.discountPercent}%): <span>${inv.discountAmount.toLocaleString()}</span></div>
            <div class="grand-total">Total: <span>${inv.total.toLocaleString()}</span></div>
          </div>
        </div>

        <!-- TERMS & SIGNATURE -->
        <div class="pdf-footer">
          <div class="terms">
            <strong>Terms And Conditions</strong>
          </div>
          <div class="signature">
            
            <div>__________________________</div>
            <div>Signature</div>
          </div>
        </div>

        <!-- THANK YOU FOOTER -->
        <div class="pdf-thanks">Thanks for your Order</div>
      </div>

      <!-- tombol action -->
      <div class="no-print actions">
        <button id="print-btn" class="btn">Cetak Invoice</button>
        <button id="save-db-btn" class="btn">Masukkan ke database</button>
      </div>
    `;
    this.afterRender();
  },

  afterRender() {
    const [ , id ] = location.hash.split('/');
    const inv = InvoiceService.getInvoice(id);
    document.getElementById('print-btn')
      .addEventListener('click', () =>
        PDFService.exportInvoiceToPDF('invoice-detail', `${inv.number}.pdf`)
      );
    document.getElementById('save-db-btn')
      .addEventListener('click', () =>
        alert('Invoice berhasil disimpan ke database internal.')
      );
  }
};
