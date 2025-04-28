// /js/views/InvoiceListView.js

import { InvoiceService }        from '../services/InvoiceService.js';
import { ImportExportService }   from '../services/ImportExportService.js';

export const InvoiceListView = {
  render() {
    const app = document.getElementById('app');
    let invoices = [];
    try {
      invoices = InvoiceService.getAllInvoices() || [];
    } catch (err) {
      console.error('[InvoiceListView] getAllInvoices ERROR', err);
      invoices = [];
    }

    // Kontrol Export/Import CSV
    const csvControls = `
      <div class="csv-controls" style="margin-bottom:1rem;">
        <button id="export-csv" class="btn">Export CSV</button>
        <input type="file" id="import-csv" accept=".csv" style="display:none;" />
        <button id="trigger-import-csv" class="btn">Import CSV</button>
      </div>
    `;

    // Kasih tahu kalau error atau kosong
    if (!Array.isArray(invoices) || invoices.length === 0) {
      app.innerHTML = `
        <div class="invoice-list-container">
          <h2>Daftar Invoice</h2>
          <p>Tidak ada data invoice.</p>
          <button id="back-to-form" class="btn">Buat Invoice Baru</button>
          ${csvControls}
        </div>
      `;
      this.afterRender();
      return;
    }

    // Bangun baris tabel dengan proteksi items
    const rows = invoices.map(inv => {
      const items = Array.isArray(inv.items) ? inv.items : [];
      const totalQty = items.reduce((sum, it) => {
        const qty = Number(it.qty) || 0;
        return sum + qty;
      }, 0);

      return `
        <tr>
          <td>${inv.number || '-'}</td>
          <td>${inv.date || '-'}</td>
          <td>${inv.buyerName || '-'}</td>
          <td>${totalQty}</td>
          <td>
            <button class="btn view-detail" data-id="${inv.id}">Lihat</button>
            <button class="btn delete-inv" data-id="${inv.id}">Hapus</button>
          </td>
        </tr>
      `;
    }).join('');

    app.innerHTML = `
      <div class="invoice-list-container">
        <h2>Daftar Invoice</h2>
        ${csvControls}
        <table class="item-table">
          <thead>
            <tr>
              <th>Nomor</th>
              <th>Tanggal</th>
              <th>Buyer</th>
              <th>Total Qty</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <button id="back-to-form" class="btn">Buat Invoice Baru</button>
      </div>
    `;
    this.afterRender();
  },

  afterRender() {
    // Back to form
    document.getElementById('back-to-form')
      .addEventListener('click', () => location.hash = '#invoice-form');

    // View detail
    document.querySelectorAll('.view-detail').forEach(btn =>
      btn.addEventListener('click', e =>
        location.hash = `#invoice-detail/${e.currentTarget.dataset.id}`
      )
    );

    // Delete
    document.querySelectorAll('.delete-inv').forEach(btn =>
      btn.addEventListener('click', e => {
        const id = e.currentTarget.dataset.id;
        if (!confirm('Yakin ingin menghapus invoice ini?')) return;
        InvoiceService.deleteInvoice(id);
        this.render();
      })
    );

    // Export CSV
    const btnExport = document.getElementById('export-csv');
    if (btnExport) {
      btnExport.addEventListener('click', () => {
        console.log('Export CSV button clicked');
        window.ImportExportService.exportCSV('invoices');
      });
    }

    // Trigger Import CSV
    const importInput = document.getElementById('import-csv');
    document
      .getElementById('trigger-import-csv')
      .addEventListener('click', () => importInput.click());

    // Handle import file
    if (importInput) {
      importInput.addEventListener('change', e => {
        const file = e.target.files[0];
        if (!file) return;
        window.ImportExportService.importCSV('invoices', file, (count, err) => {
          if (err) {
            alert('Import gagal: ' + err.message);
          } else {
            alert(`Berhasil import ${count} invoice`);
            this.render();
          }
        });
        importInput.value = '';
      });
    }
  }
};
