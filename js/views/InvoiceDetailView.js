// /js/views/InvoiceDetailView.js

import { InvoiceService }    from '../services/InvoiceService.js';
import { PDFService }        from '../services/PDFService.js';
import { OperationService }  from '../services/OperationService.js';
import { AlertService }      from '../services/AlertService.js';

export const InvoiceDetailView = {
  render() {
    const app       = document.getElementById('app');
    const [, invId] = location.hash.split('/');
    const inv       = InvoiceService.getInvoice(invId);

    if (!inv) {
      app.innerHTML = `<p>Invoice \"${invId}\" tidak ditemukan.</p>`;
      return;
    }

    // Parse items (string → array jika perlu)
    let items = Array.isArray(inv.items) ? inv.items : [];
    if (typeof inv.items === 'string') {
      try { items = JSON.parse(inv.items); }
      catch { items = []; }
    }

    // Build HTML tabel dengan kolom Model & Warna
    const itemsHTML = items.map((it, i) => {
      const line = (it.qty || 0) * (it.price || 0);
      return `
        <tr>
          <td>${i + 1}</td>
          <td>${it.name || '-'}</td>
          <td>${it.model || '-'}</td>
          <td>${it.color || '-'}</td>
          <td>${it.size || '-'}</td>
          <td class=\"text-right\">${(it.price||0).toLocaleString()}</td>
          <td class=\"text-right\">${it.qty||0}</td>
          <td class=\"text-right\">${line.toLocaleString()}</td>
        </tr>`;
    }).join('');

    // Hitung summary
    const subtotal        = items.reduce((sum, it) => sum + ((it.qty||0) * (it.price||0)), 0);
    const taxPercent      = inv.taxPercent      || 0;
    const taxAmount       = inv.taxAmount       || subtotal * (taxPercent / 100);
    const discountPercent = inv.discountPercent || 0;
    const discountAmount  = inv.discountAmount  || subtotal * (discountPercent / 100);
    const grossTotal      = inv.total           || subtotal + taxAmount - discountAmount;

    // Data operasional
    const ops      = OperationService.getByInvoice(inv.id);
    const totalOps = ops.reduce((sum, op) => sum + (op.totalCost||0), 0);
    const netTotal = grossTotal - totalOps;
    const opsRowsHTML = ops.map((op, i) => `
        <tr>
          <td>${i + 1}</td>
          <td>${op.itemName || '-'}</td>
          <td class=\"text-right\">${op.qty||0}</td>
          <td class=\"text-right\">${(op.unitCost||0).toLocaleString()}</td>
          <td class=\"text-right\">${(op.totalCost||0).toLocaleString()}</td>
        </tr>`).join('');

    // Render invoice + op-report
    app.innerHTML = `
      <div id=\"invoice-detail\" class=\"invoice-pdf-container\">
        <!-- HEADER -->
        <div class=\"pdf-header\">
          <div class=\"brand\"><span class=\"brand-name\">FLEUR STUDIO</span></div>
          <div class=\"invoice-meta\">
            <div>Invoice No: <strong>${inv.number}</strong></div>
            <div>Date: <strong>${inv.date}</strong></div>
          </div>
        </div>

        <!-- TITLE -->
        <h1 class=\"pdf-title\">INVOICE</h1>

        <!-- BUYER INFO -->
        <div class=\"pdf-to\">
          <strong>Invoice To:</strong>
          <div>${inv.buyerName}</div>
        </div>

        <!-- ITEMS TABLE -->
        <table class=\"pdf-table\">
          <thead>
            <tr>
              <th>No</th>
              <th>Description</th>
              <th>Model</th>
              <th>Color</th>
              <th>Size</th>
              <th class=\"text-right\">Price</th>
              <th class=\"text-right\">Qty</th>
              <th class=\"text-right\">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>

        <!-- SUMMARY -->
        <div class=\"pdf-summary\">
          <div class=\"left\">
            <strong>Payment Method:</strong> Transfer
            <div class=\"bank-info-vertical\" style=\"margin-top:1rem;\">
              <img src=\"./assets/LogoBCA.png\" alt=\"BCA Logo\" style=\"width:80px;\"/>
              <div class=\"bank-details\" style=\"line-height:1.4;\">
                <div>No Rekening: <strong>0790515919</strong></div>
                <div>A/N: <strong>Paramastri Sita Nabila</strong></div>
              </div>
            </div>
          </div>
          <div class=\"right\">
            <div>Sub Total: <span>${subtotal.toLocaleString()}</span></div>
            <div>Tax (${taxPercent}%): <span>${taxAmount.toLocaleString()}</span></div>
            <div>Discount (${discountPercent}%): <span>${discountAmount.toLocaleString()}</span></div>
            <div class=\"grand-total\">Total: <span>${grossTotal.toLocaleString()}</span></div>
          </div>
        </div>

        <!-- SIGNATURE -->
        <div class=\"signature-block\" style=\"display:flex;justify-content:space-between;margin-top:2rem;\">
          <div class=\"sig-col\" style=\"text-align:center;\">
            <div>__________________________</div>
            <div style=\"margin-top:0.5rem;\">(Paramastri Sita Nabila)</div>
            <div>Founder/CEO</div>
          </div>
          <div class=\"sig-col\" style=\"text-align:center;\">
            <div>__________________________</div>
            <div style=\"margin-top:0.5rem;\">(${inv.buyerName})</div>
            <div>Penerima</div>
          </div>
        </div>

        <!-- ACTION BUTTONS -->
        <div class=\"no-print actions\" style=\"margin-top:1.5rem;\">
          <button id=\"print-btn\" class=\"btn\">Cetak Invoice</button>
          <button id=\"save-db-btn\" class=\"btn\">Simpan DB</button>
          <button id=\"to-op-btn\" class=\"btn\">Operasional</button>
          <button id=\"download-report-btn\" class=\"btn\">Download Laporan Operasional</button>
        </div>
      </div>

      <!-- OP-REPORT SECTION -->
      <div id=\"op-report\" class=\"pdf-op-container\" style=\"display:none;padding:1rem;background:#fff;\">
        <h1 style=\"text-align:center;margin-bottom:1rem;\">LAPORAN OPERASIONAL</h1>
        <div style=\"margin-bottom:1rem;\">
          <div><strong>Invoice No:</strong> ${inv.number}</div>
          <div><strong>Date:</strong> ${inv.date}</div>
          <div><strong>Klien:</strong> ${inv.buyerName}</div>
          <div><strong>Total Invoice:</strong> ${grossTotal.toLocaleString()}</div>
        </div>
        <div style=\"border-top:1px solid #ccc; padding-top:0.5rem; margin-bottom:1rem;\">
          <div><strong>Total Operasional:</strong> ${totalOps.toLocaleString()}</div>
          <div><strong>Net Income:</strong> ${netTotal.toLocaleString()}</div>
        </div>
        <table class=\"pdf-table\" style=\"width:100%;border-collapse:collapse;\">
          <thead>
            <tr>
              <th>No</th><th>Item</th><th class=\"text-right\">Qty</th>
              <th class=\"text-right\">Unit Cost</th><th class=\"text-right\">Total Cost</th>
            </tr>
          </thead>
          <tbody>
            ${opsRowsHTML || `<tr><td colspan=\"5\" style=\"text-align:center;padding:8px;\">Belum ada operasional.</td></tr>`}
          </tbody>
        </table>
      </div>
    `;

    this.afterRender();
  },

  afterRender() {
    const [, invId] = location.hash.split('/');
    const inv       = InvoiceService.getInvoice(invId);

    // Cetak Invoice
    document.getElementById('print-btn').addEventListener('click', () => {
      document.querySelector('.actions').style.display = 'none';
      PDFService.exportInvoiceToPDF('invoice-detail', `${inv.number}.pdf`)
        .then(() => document.querySelector('.actions').style.display = '');
    });

    // Simpan DB
    document.getElementById('save-db-btn').addEventListener('click', () =>
      AlertService.show('Invoice berhasil disimpan.', 'success')
    );

    // Menuju halaman operasional
    document.getElementById('to-op-btn').addEventListener('click', () =>
      location.hash = `#operation/${inv.id}`
    );

    // Download laporan operasional
    document.getElementById('download-report-btn').addEventListener('click', () => {
      const invEl    = document.getElementById('invoice-detail');
      const rptEl    = document.getElementById('op-report');
      invEl.style.display = 'none';
      rptEl.style.display = 'block';
      PDFService.exportInvoiceToPDF('op-report', `Laporan-Operasional-${inv.number}.pdf`)
        .then(() => {
          rptEl.style.display = 'none';
          invEl.style.display = 'block';
        });
    });
  }
};
