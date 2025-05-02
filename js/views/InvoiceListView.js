// /js/views/InvoiceListView.js

import { InvoiceService }      from '../services/InvoiceService.js';
import { ImportExportService } from '../services/ImportExportService.js';

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

    // Jika tidak ada invoice
    if (!Array.isArray(invoices) || invoices.length === 0) {
      app.innerHTML = `
      <div class="container mx-auto p-6 bg-white shadow-md rounded-lg text-center">
        <h2 class="text-2xl font-semibold text-gray-800 mb-4">Daftar Invoice</h2>
        <p class="text-gray-600 mb-6">Belum ada data invoice.</p>
        <button
          id="back-to-form"
          class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg"
        >+ Buat Invoice Baru</button>
      </div>`;
      this.afterRender();
      return;
    }

    // Bangun baris tabel: nomor, tanggal, buyer, model unik, warna unik, total qty
    const rows = invoices.map((inv, i) => {
      const items = Array.isArray(inv.items) ? inv.items : [];
      const totalQty = items.reduce((sum, it) => sum + (Number(it.qty) || 0), 0);

      // daftar model & warna unik
      const models = [...new Set(items.map(it => it.model).filter(m => m))].join(', ') || '-';
      const colors = [...new Set(items.map(it => it.color).filter(c => c))].join(', ') || '-';

      return `
      <tr class="${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}">
        <td class="px-4 py-2 text-center">${i + 1}</td>
        <td class="px-4 py-2">${inv.number || '-'}</td>
        <td class="px-4 py-2">${inv.date   || '-'}</td>
        <td class="px-4 py-2">${inv.buyerName || '-'}</td>
        <td class="px-4 py-2">${models}</td>
        <td class="px-4 py-2">${colors}</td>
        <td class="px-4 py-2 text-right">${totalQty}</td>
        <td class="px-4 py-2 text-center space-x-2">
          <button
            class="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm view-detail"
            data-id="${inv.id}"
            title="Lihat Invoice"
            aria-label="Lihat Invoice"
          >Lihat</button>
          <button
            class="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm delete-inv"
            data-id="${inv.id}"
            title="Hapus Invoice"
            aria-label="Hapus Invoice"
          >Hapus</button>
        </td>
      </tr>`;
    }).join('');

    app.innerHTML = `
    <div class="container mx-auto p-6 bg-white shadow-md rounded-lg">
      <div class="flex items-center justify-between mb-4">
        <h2 class="text-2xl font-semibold text-gray-800">Daftar Invoice</h2>
        <div class="space-x-2">
          <button
            id="export-csv"
            class="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm"
          >Export CSV</button>
          <input type="file" id="import-csv" accept=".csv" class="hidden" />
          <button
            id="trigger-import-csv"
            class="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm"
          >Import CSV</button>
          <button
            id="back-to-form"
            class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm"
          >+ Buat Invoice Baru</button>
        </div>
      </div>

      <div class="overflow-x-auto">
        <table class="min-w-full table-auto border-collapse">
          <thead>
            <tr class="bg-gray-100">
              <th class="px-4 py-2 text-left text-gray-600">No</th>
              <th class="px-4 py-2 text-left text-gray-600">Nomor</th>
              <th class="px-4 py-2 text-left text-gray-600">Tanggal</th>
              <th class="px-4 py-2 text-left text-gray-600">Buyer</th>
              <th class="px-4 py-2 text-left text-gray-600">Model</th>
              <th class="px-4 py-2 text-left text-gray-600">Warna</th>
              <th class="px-4 py-2 text-right text-gray-600">Total Qty</th>
              <th class="px-4 py-2 text-center text-gray-600">Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      </div>
    </div>`;

    this.afterRender();
  },

  afterRender() {
    // Buat invoice baru
    document.getElementById('back-to-form')
      .addEventListener('click', () => location.hash = '#invoice-form');

    // Lihat detail
    document.querySelectorAll('button[title="Lihat Invoice"]').forEach(btn =>
      btn.addEventListener('click', e =>
        location.hash = `#invoice-detail/${e.currentTarget.dataset.id}`
      )
    );

    // Hapus invoice
    document.querySelectorAll('button[title="Hapus Invoice"]').forEach(btn =>
      btn.addEventListener('click', e => {
        const id = e.currentTarget.dataset.id;
        if (!confirm('Yakin ingin menghapus invoice ini?')) return;
        InvoiceService.deleteInvoice(id);
        this.render();
      })
    );

    // Export CSV
    document.getElementById('export-csv')
      .addEventListener('click', () => ImportExportService.exportCSV('invoices'));

    // Trigger import CSV
    const importInput = document.getElementById('import-csv');
    document.getElementById('trigger-import-csv')
      .addEventListener('click', () => importInput.click());

    // Handle file import
    importInput.addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;
      ImportExportService.importCSV('invoices', file, (count, err) => {
        if (err) alert('Import gagal: ' + err.message);
        else {
          alert(`Berhasil import ${count} invoice`);
          this.render();
        }
      });
      importInput.value = '';
    });
  }
};
