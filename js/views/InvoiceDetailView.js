// /js/views/InvoiceDetailView.js

import { InvoiceService }    from '../services/InvoiceService.js';
import { PDFService }        from '../services/PDFService.js';
import { OperationService }  from '../services/OperationService.js';
import { AlertService }      from '../services/AlertService.js';

export const InvoiceDetailView = {
  render() {
    const app     = document.getElementById('app');
    const [, invId] = location.hash.split('/');
    const inv     = InvoiceService.getInvoice(invId);
    if (!inv) {
      app.innerHTML = `<p>Invoice "${invId}" tidak ditemukan.</p>`;
      return;
    }

    // — Invoice items & summary (tidak diubah, ringkas disini) —
    let items = Array.isArray(inv.items) ? inv.items : [];
    if (typeof inv.items === 'string') {
      try { items = JSON.parse(inv.items); } catch { items = []; }
    }
    const itemsHTML = items.map((it,i) => {
      const line = it.qty * (it.price||0);
      return `
        <tr>
          <td>${i+1}</td>
          <td>${it.name}</td>
          <td>${it.size}</td>
          <td class="text-right">${(it.price||0).toLocaleString()}</td>
          <td class="text-right">${it.qty}</td>
          <td class="text-right">${line.toLocaleString()}</td>
        </tr>`;
    }).join('');
    const subtotal        = items.reduce((s,it)=> s + it.qty*(it.price||0),0);
    const taxPercent      = inv.taxPercent      || 0;
    const taxAmount       = inv.taxAmount       || subtotal*(taxPercent/100);
    const discountPercent = inv.discountPercent || 0;
    const discountAmount  = inv.discountAmount  || subtotal*(discountPercent/100);
    const grossTotal      = inv.total           || subtotal + taxAmount - discountAmount;

    // — Operational data —
    const ops      = OperationService.getByInvoice(inv.id);
    const totalOps = ops.reduce((s,op)=> s + op.totalCost, 0);
    const netTotal = grossTotal - totalOps;
    const opsRowsHTML = ops.map((op,i) => `
        <tr>
          <td>${i+1}</td>
          <td>${op.itemName}</td>
          <td class="text-right">${op.qty}</td>
          <td class="text-right">${op.unitCost.toLocaleString()}</td>
          <td class="text-right">${op.totalCost.toLocaleString()}</td>
        </tr>`).join('');

    // — Render Invoice + hidden Op-report wrapper —
    app.innerHTML = `
      <div id="invoice-detail" class="invoice-pdf-container">
        <!-- HEADER -->
        <div class="pdf-header">
          <div class="brand"><span class="brand-name">FLEUR STUDIO</span></div>
          <div class="invoice-meta">
            <div>Invoice No: <strong>${inv.number}</strong></div>
            <div>Date: <strong>${inv.date}</strong></div>
          </div>
        </div>
        <h1 class="pdf-title">INVOICE</h1>
        <div class="pdf-to">
          <strong>Invoice To:</strong>
          <div>${inv.buyerName}</div>
        </div>

        <!-- ITEMS -->
        <table class="pdf-table">
          <thead>
            <tr>
              <th>No</th><th>Description</th><th>Size</th>
              <th class="text-right">Price</th><th class="text-right">Qty</th>
              <th class="text-right">Total</th>
            </tr>
          </thead>
          <tbody>${itemsHTML}</tbody>
        </table>

        <!-- SUMMARY -->
        <div class="pdf-summary">
          <div class="left">
            <strong>Payment Method:</strong> Transfer
            <div class="bank-info-vertical" style="display:flex;flex-direction:column;align-items:flex-start;gap:8px;margin-top:1rem;">
              <img src="./assets/LogoBCA.png" alt="BCA Logo" style="width:80px;"/>
              <div class="bank-details" style="line-height:1.4;">
                <div>No Rekening: <strong>0790515919</strong></div>
                <div>A/N: <strong>Paramastri Sita Nabila</strong></div>
              </div>
            </div>
          </div>
          <div class="right">
            <div>Sub Total: <span>${subtotal.toLocaleString()}</span></div>
            <div>Tax (${taxPercent}%): <span>${taxAmount.toLocaleString()}</span></div>
            <div>Discount (${discountPercent}%): <span>${discountAmount.toLocaleString()}</span></div>
            <div class="grand-total">Total: <span>${grossTotal.toLocaleString()}</span></div>
          </div>
        </div>

        <!-- ACTION BUTTONS -->
        <div class="no-print actions">
          <button id="print-btn" class="btn">Cetak Invoice</button>
          <button id="save-db-btn" class="btn">Simpan DB</button>
          <button id="to-op-btn" class="btn">Operasional</button>
          <button id="download-report-btn" class="btn">Download Laporan Operasional</button>
        </div>
      </div>

      <!-- OP-REPORT SECTION -->
      <div id="op-report" class="pdf-op-container" style="display:none; padding:1rem; background:#fff;">
        <h1 style="text-align:center; margin-bottom:1rem;">LAPORAN OPERASIONAL</h1>
        <div style="margin-bottom:1rem;">
          <div><strong>Invoice No:</strong> ${inv.number}</div>
          <div><strong>Date:</strong> ${inv.date}</div>
          <div><strong>Klien:</strong> ${inv.buyerName}</div>
          <div><strong>Total Invoice:</strong> ${grossTotal.toLocaleString()}</div>
        </div>
        <div style="margin-bottom:1rem; border-top:1px solid #ccc; padding-top:0.5rem;">
          <div><strong>Total Operasional:</strong> ${totalOps.toLocaleString()}</div>
          <div><strong>Net Income:</strong> ${netTotal.toLocaleString()}</div>
        </div>
        <table class="pdf-table" style="width:100%; border-collapse:collapse;">
          <thead>
            <tr>
              <th style="border:1px solid #ddd; padding:4px;">No</th>
              <th style="border:1px solid #ddd; padding:4px;">Item</th>
              <th style="border:1px solid #ddd; padding:4px;" class="text-right">Qty</th>
              <th style="border:1px solid #ddd; padding:4px;" class="text-right">Unit Cost</th>
              <th style="border:1px solid #ddd; padding:4px;" class="text-right">Total Cost</th>
            </tr>
          </thead>
          <tbody>
            ${opsRowsHTML || `<tr><td colspan="5" style="text-align:center; padding:8px;">Belum ada operasional.</td></tr>`}
          </tbody>
        </table>
      </div>
    `;

    this.afterRender();
  },

  afterRender() {
    const [, invId] = location.hash.split('/');
    const inv     = InvoiceService.getInvoice(invId);

    // 1) Cetak Invoice: sembunyikan op-report
    document.getElementById('print-btn').addEventListener('click', () => {
      const reportEl = document.getElementById('op-report');
      reportEl.style.display = 'none';

      PDFService.exportInvoiceToPDF('invoice-detail', `${inv.number}.pdf`);

      setTimeout(() => {
        reportEl.style.display = 'none';
      }, 300);
    });

    // 2) Simpan DB
    document.getElementById('save-db-btn')
      .addEventListener('click', () =>
        AlertService.show('Invoice berhasil disimpan.', 'success')
      );

    // 3) Operasional page
    document.getElementById('to-op-btn')
      .addEventListener('click', () =>
        location.hash = `#operation/${inv.id}`
      );

    // 4) Download Laporan Operasional
    document.getElementById('download-report-btn')
      .addEventListener('click', () => {
        // hide invoice-detail, show op-report
        const invEl    = document.getElementById('invoice-detail');
        const reportEl = document.getElementById('op-report');
        invEl.style.display    = 'none';
        reportEl.style.display = 'block';

        PDFService.exportInvoiceToPDF('op-report', `Laporan-Operasional-${inv.number}.pdf`);

        setTimeout(() => {
          reportEl.style.display = 'none';
          invEl.style.display    = 'block';
        }, 500);
      });
  }
};
