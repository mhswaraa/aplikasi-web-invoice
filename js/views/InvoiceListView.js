// views/InvoiceListView.js

import { InvoiceService } from '../services/InvoiceService.js';
import { ImportExportService } from '../services/ImportExportService.js';
import { AlertService } from '../services/AlertService.js';

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

    if (!Array.isArray(invoices) || invoices.length === 0) {
      app.innerHTML = `
        <div class="container mx-auto p-6 bg-white shadow-md rounded-lg text-center">
          <h2 class="text-2xl font-semibold text-gray-800 mb-4">Daftar Invoice</h2>
          <p class="text-gray-600 mb-6">Belum ada data invoice.</p>
          <button id="back-to-form" class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg">+ Buat Invoice Baru</button>
        </div>`;
      this.afterRender();
      return;
    }

    const rows = invoices.map((inv, i) => {
      const items = Array.isArray(inv.items) ? inv.items : [];
      const totalQty = items.reduce((sum, it) => sum + (Number(it.qty) || 0), 0);
      const models = [...new Set(items.map(it => it.model).filter(Boolean))].join(', ') || '-';
      const colors = [...new Set(items.map(it => it.color).filter(Boolean))].join(', ') || '-';

      return `
        <tr class="${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}">
          <td class="px-4 py-2 text-center">${i + 1}</td>
          <td class="px-4 py-2">${inv.number || '-'}</td>
          <td class="px-4 py-2">${inv.date || '-'}</td>
          <td class="px-4 py-2">${inv.buyerName || '-'}</td>
          <td class="px-4 py-2">${models}</td>
          <td class="px-4 py-2">${colors}</td>
          <td class="px-4 py-2 text-right">${totalQty}</td>
          <td class="px-4 py-2 relative">
            <button class="action-toggle px-2 py-1 hover:bg-gray-200 rounded focus:outline-none" data-id="${inv.id}">⋮</button>
          </td>
        </tr>`;
    }).join('');

    app.innerHTML = `
      <div class="container mx-auto p-6 bg-white shadow-md rounded-lg relative">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-2xl font-semibold text-gray-800">Daftar Invoice</h2>
          <div class="space-x-2">
            <button id="export-csv" class="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm">Export CSV</button>
            <input type="file" id="import-csv" accept=".csv" class="hidden" />
            <button id="trigger-import-csv" class="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm">Import CSV</button>
            <button id="back-to-form" class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm">+ Buat Invoice Baru</button>
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

        <div id="inv-action-menu" class="fixed z-50 invisible opacity-0 scale-95 transform transition duration-200 origin-top-right bg-white border rounded shadow-lg">
          <button id="menu-view" class="block w-full text-left px-4 py-2 hover:bg-gray-100">Lihat</button>
          <button id="menu-delete" class="block w-full text-left px-4 py-2 hover:bg-gray-100">Hapus</button>
        </div>
      </div>`;

    this.afterRender();
  },

  afterRender() {
    const menu = document.getElementById('inv-action-menu');
    const btnView = document.getElementById('menu-view');
    const btnDelete = document.getElementById('menu-delete');
    const exportBtn = document.getElementById('export-csv');
    const importInput = document.getElementById('import-csv');
    const triggerImportBtn = document.getElementById('trigger-import-csv');
    let currentId;

    const hideMenu = () => menu.classList.add('invisible', 'opacity-0', 'scale-95');

    document.querySelectorAll('.action-toggle').forEach(btn =>
      btn.addEventListener('click', e => {
        e.stopPropagation();
        currentId = e.currentTarget.dataset.id;
        const rect = e.currentTarget.getBoundingClientRect();
        const top = rect.bottom + window.scrollY;
        let left = rect.right - menu.offsetWidth + window.scrollX;
        if (left + menu.offsetWidth > window.innerWidth) left = window.innerWidth - menu.offsetWidth - 8;
        menu.style.top = `${top}px`;
        menu.style.left = `${Math.max(left, 8)}px`;
        menu.classList.toggle('invisible');
        menu.classList.toggle('opacity-0');
        menu.classList.toggle('scale-95');
      })
    );

    document.addEventListener('click', hideMenu);
    window.addEventListener('resize', hideMenu);

    btnView.addEventListener('click', () => {
      hideMenu();
      location.hash = `#invoice-detail/${currentId}`;
    });

    btnDelete.addEventListener('click', () => {
      hideMenu();
      if (!confirm('Yakin ingin menghapus invoice ini?')) return;
      InvoiceService.deleteInvoice(currentId);
      AlertService.show('Invoice berhasil dihapus.', 'success');
      this.render();
    });

    document.getElementById('back-to-form').addEventListener('click', () => {
      location.hash = '#invoice-form';
    });

    exportBtn.addEventListener('click', () => {
      ImportExportService.exportCSV('invoices');
    });

    triggerImportBtn.addEventListener('click', () => {
      importInput.click();
    });

    importInput.addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;

      ImportExportService.importCSV(
        'invoices',
        file,
        (result, err) => {
          if (err) {
            AlertService.show(`Import gagal: ${err.message}`, 'error');
          } else {
            AlertService.show(`Import selesai. Ditambahkan ${result.added}, Diperbarui ${result.updated}`, 'success');
            this.render();
          }
        },
        {
          uniqueKey: 'number',
          updateExisting: false
        }
      );
      importInput.value = '';
    });
  }
};
