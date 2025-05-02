// /js/views/ProductionListView.js
import { ProductionService } from '../services/ProductionService.js';

export const ProductionListView = {
  render() {
    const app   = document.getElementById('app');
    const prods = ProductionService.getAllProductions();

    // Bangun baris tabel dengan Tailwind
    const rows = prods.map((p, i) => {
      const totalJadi   = p.items.reduce((sum, it) => sum + (it.qtyJadi || 0), 0);
      const totalDefect = p.items.reduce((sum, it) => sum + (it.defect  || 0), 0);

      // Tgl order
      const orderDate = p.orderDate
        ? new Date(p.orderDate).toLocaleDateString('id-ID')
        : '-';
      // Gabungkan warna unik
      const colors = Array.isArray(p.items)
        ? [...new Set(p.items.map(it => it.color || '-'))].join(', ')
        : '-';

      return `
        <tr class="${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}">
          <td class="px-4 py-2 text-center">${i + 1}</td>
          <td class="px-4 py-2">${orderDate}</td>
          <td class="px-4 py-2">${p.model || '-'}</td>
          <td class="px-4 py-2">${colors}</td>
          <td class="px-4 py-2">${p.clientName}</td>
          <td class="px-4 py-2">${p.status.replace('_',' ')}</td>
          <td class="px-4 py-2">${new Date(p.createdAt).toLocaleDateString('id-ID')}</td>
          <td class="px-4 py-2 text-right">${totalJadi}</td>
          <td class="px-4 py-2 text-right">${totalDefect}</td>
          <td class="px-4 py-2 text-center space-x-2">
            <button
              class="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-sm edit-prod"
              data-id="${p.id}"
              title="Edit Produksi"
              aria-label="Edit Produksi"
            >Edit</button>
            <button
              class="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm delete-prod"
              data-id="${p.id}"
              title="Hapus Produksi"
              aria-label="Hapus Produksi"
            >Hapus</button>
          </td>
        </tr>`;
    }).join('');

    const emptyRow = `
      <tr>
        <td colspan="10" class="px-4 py-8 text-center text-gray-500">
          Belum ada produksi.
        </td>
      </tr>`;

    app.innerHTML = `
      <div class="container mx-auto p-6 bg-white shadow-md rounded-lg">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-2xl font-semibold text-gray-800">Laporan Produksi</h2>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full table-auto border-collapse">
            <thead>
              <tr class="bg-gray-100">
                <th class="px-4 py-2 text-left text-gray-600">No</th>
                <th class="px-4 py-2 text-left text-gray-600">Tgl Order</th>
                <th class="px-4 py-2 text-left text-gray-600">Model</th>
                <th class="px-4 py-2 text-left text-gray-600">Warna</th>
                <th class="px-4 py-2 text-left text-gray-600">Klien</th>
                <th class="px-4 py-2 text-left text-gray-600">Status</th>
                <th class="px-4 py-2 text-left text-gray-600">Tgl Mulai</th>
                <th class="px-4 py-2 text-right text-gray-600">Total Jadi</th>
                <th class="px-4 py-2 text-right text-gray-600">Total Defect</th>
                <th class="px-4 py-2 text-center text-gray-600">Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${ prods.length ? rows : emptyRow }
            </tbody>
          </table>
        </div>
      </div>
    `;

    this.afterRender();
  },

  afterRender() {
    // Edit Produksi
    document.querySelectorAll('button[title="Edit Produksi"]').forEach(btn =>
      btn.addEventListener('click', e => {
        const id = e.currentTarget.dataset.id;
        location.hash = `#production-form/${id}`;
      })
    );
    // Hapus Produksi
    document.querySelectorAll('button[title="Hapus Produksi"]').forEach(btn =>
      btn.addEventListener('click', e => {
        const id = e.currentTarget.dataset.id;
        if (!confirm('Yakin hapus laporan produksi ini?')) return;
        ProductionService.deleteProduction(id);
        this.render();
      })
    );
  }
};
