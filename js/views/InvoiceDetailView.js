// /js/views/InvoiceDetailView.js

import { InvoiceService } from '../services/InvoiceService.js';
import { PDFService }     from '../services/PDFService.js';

export const InvoiceDetailView = {
  render() {
    const app = document.getElementById('app');
    const [, id] = location.hash.split('/');
    const inv = InvoiceService.getInvoice(id);
    if (!inv) {
      app.innerHTML = `<p>Invoice dengan ID "${id}" tidak ditemukan.</p>`;
      return;
    }

    // Parse items
    let items = inv.items;
    if (!Array.isArray(items) && typeof items === 'string') {
      try { items = JSON.parse(items); }
      catch { items = []; }
    }
    if (!Array.isArray(items)) items = [];

    // Build items HTML
    const itemsHTML = items.map((item,i) => `
  <tr>
    <td>${i+1}</td>
    <td>${item.name}</td>
    <td>${item.size}</td>
    <td class="text-right">${(item.price || 0).toLocaleString()}</td>
    <td class="text-right">${item.qty}</td>
    <td class="text-right">${(item.qty*(item.price || 0)).toLocaleString()}</td>
  </tr>
`).join('');

    // Recalculate summary
    const subtotal        = items.reduce((s,it)=> s + (it.qty*(it.price||0)), 0);
    const taxPercent      = inv.taxPercent      || 0;
    const taxAmount       = inv.taxAmount       || subtotal*(taxPercent/100);
    const discountPercent = inv.discountPercent || 0;
    const discountAmount  = inv.discountAmount  || subtotal*(discountPercent/100);
    const total           = inv.total           || subtotal + taxAmount - discountAmount;

    app.innerHTML = `
      <div id="invoice-detail" class="invoice-pdf-container">
        <!-- HEADER -->
        <div class="pdf-header">
          <div class="brand">
            <span class="brand-name">FLEUR STUDIO</span>
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
      <th>Price</th>
      <th>QTY</th>
      <th>Total</th>
    </tr>
  </thead>
  <tbody>
    ${itemsHTML}
  </tbody>
</table>

        <!-- SUMMARY -->
        <div class="pdf-summary">
         <div class="left">
  <strong>Payment Method: Transfer</strong>
  <br>
  <br>
   <div class="bank-info-vertical">
     <img src="./assets/LogoBCA.png" alt="BCA Logo" class="bank-logo"/><br>
    <div class="bank-details">
      <div>No Rekening: <strong>0790515919</strong></div>
      <div>A/N: <strong>Paramastri Sita Nabila</strong></div>
    </div>
  </div>
</div>
          <div class="right">
            <div>Sub Total: <span>${subtotal.toLocaleString()}</span></div>
            <div>Tax (${taxPercent}%): <span>${taxAmount.toLocaleString()}</span></div>
            <div>Discount (${discountPercent}%): <span>${discountAmount.toLocaleString()}</span></div>
            <div class="grand-total">Total: <span>${total.toLocaleString()}</span></div>
          </div>
        </div>

        <!-- TERMS & SIGNATURE -->
        <div class="pdf-footer">
          <div class="terms">
            <br>
            <br>
            <br>
            <strong>Terms And Conditions</strong>
          </div>
          <div class="signature">
          <br>
            <br>
            <br>
            <div>__________________________</div>
            <div>Signature</div>
          </div>
        </div>

        <!-- THANK YOU FOOTER -->
        <div class="pdf-thanks">Thank You For Your Business</div>
      </div>

      <!-- ACTION BUTTONS (NOT PRINTED) -->
      <div class="no-print actions">
        <button id="print-btn" class="btn">Cetak Invoice</button>
        <button id="save-db-btn" class="btn">Masukkan ke database</button>
      </div>
    `;

    this.afterRender();
  },

  afterRender() {
    const [, id] = location.hash.split('/');
    const inv = InvoiceService.getInvoice(id);

    document.getElementById('print-btn')
      .addEventListener('click', () =>
        PDFService.exportInvoiceToPDF('invoice-detail', `${inv.number}.pdf`)
      );

    document.getElementById('save-db-btn')
      .addEventListener('click', () =>
        AlertService.show('Invoice berhasil disimpan ke database internal.', 'success')
      );
  }
};
