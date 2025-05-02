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
      app.innerHTML = `<p>Invoice "${invId}" tidak ditemukan.</p>`;
      return;
    }

    // parse items
    let items = Array.isArray(inv.items) ? inv.items : [];
    if (typeof inv.items === 'string') {
      try { items = JSON.parse(inv.items); }
      catch { items = []; }
    }
    // Ambil tanggal & waktu saat ini di Bandung
const nowString = new Date().toLocaleString('id-ID', {
  timeZone: 'Asia/Jakarta',
  day:   '2-digit',
  month: '2-digit',
  year:  'numeric',
});


    // build rows items
    const itemsHTML = items.map((it,i) => {
      const line = (it.qty||0) * (it.price||0);
      return `
        <tr>
          <td>${i+1}</td>
          <td>${it.name||'-'}</td>
          <td>${it.model||'-'}</td>
          <td>${it.color||'-'}</td>
          <td>${it.size||'-'}</td>
          <td class="text-right">${(it.price||0).toLocaleString()}</td>
          <td class="text-right">${it.qty||0}</td>
          <td class="text-right">${line.toLocaleString()}</td>
        </tr>`;
    }).join('');

    // summary
    const subtotal        = items.reduce((s,it)=> s + (it.qty||0)*(it.price||0),0);
    const taxPercent      = inv.taxPercent      || 0;
    const taxAmount       = inv.taxAmount       || subtotal*(taxPercent/100);
    const discountPercent = inv.discountPercent || 0;
    const discountAmount  = inv.discountAmount  || subtotal*(discountPercent/100);
    const grossTotal      = inv.total           || subtotal + taxAmount - discountAmount;

    // operational
    const ops      = OperationService.getByInvoice(inv.id);
    const totalOps = ops.reduce((s,op)=> s + (op.totalCost||0),0);
    const netTotal = grossTotal - totalOps;
    const opsRowsHTML = ops.map((op,i)=>`
        <tr>
          <td>${i+1}</td>
          <td>${op.itemName||'-'}</td>
          <td class="text-right">${op.qty||0}</td>
          <td class="text-right">${(op.unitCost||0).toLocaleString()}</td>
          <td class="text-right">${(op.totalCost||0).toLocaleString()}</td>
        </tr>`).join('');

    app.innerHTML = `
      <style>
        .invoice-pdf-container { max-width:800px; margin:auto; font-family:Arial,sans-serif; color:#333; }
        .header-table, .client-table, .pdf-table { width:100%; border-collapse:collapse; margin-bottom:1rem; }
        .header-table td { vertical-align:top; }
        .brand-name { font-size:28px; font-weight:bold; }
        .pdf-table th, .pdf-table td { border:1px solid #000; padding:8px; font-size:13px; }
        .pdf-table th { background:#f0f0f0; }
        .text-right { text-align:right; }
        .pdf-summary { display:flex; justify-content:flex-end; margin-top:1.5rem; }
        .pdf-summary .right { width:300px; }
        .pdf-summary .right div { display:flex; justify-content:space-between; margin-bottom:4px; }
        .pdf-summary .grand-total { font-size:16px; font-weight:bold; }
        .notes { font-size:12px; margin-top:2rem; }
        .signature-block { display:flex; justify-content:space-between; align-items:flex-end; margin-top:3rem; }
        .sig-col { text-align:center; }
        .sig-col .line { margin-top:2.5rem; border-top:1px solid #000; width:200px; margin-left:auto; margin-right:auto; }
        .no-print { margin-top:2rem; }
        .btn { padding:8px 16px; margin-right:8px; background:#2a9d8f; color:#fff; border:none; cursor:pointer; }
        .btn:hover { background:#217271; }
      </style>

      <div id="invoice-detail" class="invoice-pdf-container">
        <!-- HEADER -->
        <table class="header-table">
          <tr>
            <td style="width:60%;">
              <div class="brand-name">FLEUR STUDIO</div>
              <div>Jl. Jetayu II, Gajahan, Kec. Ps. Kliwon, Kota Surakarta, Jawa Tengah</div>
            </td>
            <td style="text-align:right;">
              <div><strong>Invoice No:</strong> ${inv.number}</div>
              <div><strong>Date:</strong> ${inv.date}</div>
            </td>
          </tr>
        </table>

        <!-- BUYER INFO -->
        <table class="client-table">
          <tr>
            <td><strong>Invoice To:</strong></td><td>${inv.buyerName}</td>
          </tr>
          ${inv.buyerAddress?`
          <tr><td><strong>Alamat:</strong></td><td>${inv.buyerAddress}</td></tr>`:''}
        </table>

        <!-- ITEMS -->
        <table class="pdf-table">
          <thead>
            <tr>
              <th>No</th><th>Description</th><th>Model</th><th>Color</th><th>Size</th>
              <th class="text-right">Price</th><th class="text-right">Qty</th><th class="text-right">Total</th>
            </tr>
          </thead>
          <tbody>${itemsHTML}</tbody>
        </table>

        <!-- SUMMARY di kanan -->
        <div class="pdf-summary">
          <div class="right">
            <div><span>Sub Total:</span><span>${subtotal.toLocaleString()}</span></div>
            <div><span>Tax (${taxPercent}%):</span><span>${taxAmount.toLocaleString()}</span></div>
            <div><span>Discount (${discountPercent}%):</span><span>${discountAmount.toLocaleString()}</span></div>
            <div class="grand-total"><span>Total:</span><span>${grossTotal.toLocaleString()}</span></div>
          </div>
        </div>
        <br>
        <br>
        <br>
        <!-- PAYMENT & BANK -->
        <div class="mb-6">
          <div><strong>Payment Method:</strong> Transfer</div>
          <div class="flex items-center mt-2">
            <img src="./assets/LogoBCA.png" alt="BCA Logo" class="w-20 mr-4"/>
            <div>
              <div>No Rekening: <strong>0790515919</strong></div>
              <div>A/N: <strong>Paramastri Sita Nabila</strong></div>
            </div>
          </div>
        </div>

        <!-- NOTES -->
        <div class="notes">
          <strong>Catatan:</strong><br/>
        </div>

        <!-- SIGNATURE (baseline-aligned) -->
        <div class="signature-block">
          <div class="sig-col">
            <div>Surakarta, ${nowString}</div>
            <br>
            <br>
            <div class="line"></div>
            <div>Paramastri Sita Nabila</div>
            <div>Founder/CEO</div>
          </div>
          <div class="sig-col">
            <br/><br/>
            <div class="line"></div>
            <div>${inv.buyerName}</div>
            <div>Penerima</div>
          </div>
        </div>

        <!-- ACTIONS -->
        <div class="no-print">
          <button id="print-btn" class="btn">Cetak Invoice</button>
          <button id="save-db-btn" class="btn">Simpan DB</button>
          <button id="to-op-btn" class="btn">Operasional</button>
          <button id="download-report-btn" class="btn">Download Laporan Operasional</button>
        </div>
      </div>

      <!-- OPERASIONAL REPORT (hidden) -->
      <div id="op-report" class="invoice-pdf-container" style="display:none;">
        <h1 style="text-align:center; margin-bottom:1rem;">LAPORAN OPERASIONAL</h1>
        <div><strong>Invoice No:</strong> ${inv.number}</div>
        <div><strong>Date:</strong> ${inv.date}</div>
        <div><strong>Total Invoice:</strong> ${grossTotal.toLocaleString()}</div>
        <div style="margin:1rem 0; border-top:1px solid #000; padding-top:0.5rem;">
          <div><strong>Total Operasional:</strong> ${totalOps.toLocaleString()}</div>
          <div><strong>Net Income:</strong> ${netTotal.toLocaleString()}</div>
        </div>
        <table class="pdf-table">
          <thead>
            <tr>
              <th>No</th><th>Item</th><th class="text-right">Qty</th>
              <th class="text-right">Unit Cost</th><th class="text-right">Total Cost</th>
            </tr>
          </thead>
          <tbody>${opsRowsHTML || `
            <tr><td colspan="5" style="text-align:center; padding:8px;">Belum ada operasional.</td></tr>`}
          </tbody>
        </table>
      </div>
    `;

    this.afterRender();
  },

  afterRender() {
    const [, invId] = location.hash.split('/');
    const inv       = InvoiceService.getInvoice(invId);

    document.getElementById('print-btn').addEventListener('click', () => {
      document.querySelector('.no-print').style.display = 'none';
      PDFService.exportInvoiceToPDF('invoice-detail', `${inv.number}.pdf`)
        .then(() => document.querySelector('.no-print').style.display = '');
    });

    document.getElementById('save-db-btn')
      .addEventListener('click', () => AlertService.show('Invoice berhasil disimpan.', 'success'));

    document.getElementById('to-op-btn')
      .addEventListener('click', () => location.hash = `#operation/${inv.id}`);

    document.getElementById('download-report-btn')
      .addEventListener('click', () => {
        const invEl = document.getElementById('invoice-detail');
        const rptEl = document.getElementById('op-report');
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
