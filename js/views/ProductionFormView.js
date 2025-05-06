// /js/views/ProductionFormView.js

import { ProductionService } from '../services/ProductionService.js';
import { AlertService }      from '../services/AlertService.js';

export const ProductionFormView = {
  render() {
    const app        = document.getElementById('app');
    const [, prodId] = location.hash.split('/');
    const prod       = ProductionService.getProduction(prodId);

    if (!prod) {
      app.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full">
          <p class="text-red-500 mb-4">Produksi ID "${prodId}" tidak ditemukan.</p>
          <button
            id="back-list"
            class="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg"
          >Kembali</button>
        </div>`;
      setTimeout(() => {
        AlertService.show(`Produksi dengan ID ${prodId} tidak ditemukan.`, 'error');
        document.getElementById('back-list')
          .addEventListener('click', () => location.hash = '#production-list');
      }, 0);
      return;
    }

    // Build rows
    const rowsHTML = prod.items.map((it, idx) => `
      <tr class="${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}">
        <td class="px-4 py-2 text-center">${idx + 1}</td>
        <td class="px-4 py-2">${it.size}</td>
        <td class="px-4 py-2">${it.color || '-'}</td>
        <td class="px-4 py-2 text-right">${it.qtyFabric}</td>
        <td class="px-4 py-2">
          <input
            type="number"
            name="qtyJadi"
            min="0"
            value="${it.qtyJadi || 0}"
            required
            class="w-20 px-2 py-1 border rounded text-right focus:ring-2 focus:ring-teal-200"
          />
        </td>
        <td class="px-4 py-2">
          <input
            type="number"
            name="defect"
            min="0"
            value="${it.defect || 0}"
            required
            class="w-20 px-2 py-1 border rounded text-right focus:ring-2 focus:ring-teal-200"
          />
        </td>
      </tr>
    `).join('');

    app.innerHTML = `
      <div class="max-w-4xl mx-auto py-8 px-4">
        <div class="bg-white shadow rounded-lg p-6 mb-6">
          <h2 class="text-2xl font-semibold text-gray-800 mb-2">
            Edit Produksi – Order ${prod.orderCode}
          </h2>
          <p class="text-gray-600">Tanggal Mulai: <span class="font-medium">${new Date(prod.createdAt).toLocaleDateString('id-ID')}</span></p>
        </div>

        <form id="production-form" class="bg-white shadow rounded-lg overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full table-auto border-collapse">
              <thead class="bg-gray-100">
                <tr>
                  <th class="px-4 py-2 text-left text-gray-600">No</th>
                  <th class="px-4 py-2 text-left text-gray-600">Size</th>
                  <th class="px-4 py-2 text-left text-gray-600">Warna</th>
                  <th class="px-4 py-2 text-right text-gray-600">Qty Kain</th>
                  <th class="px-4 py-2 text-right text-gray-600">Qty Jadi</th>
                  <th class="px-4 py-2 text-right text-gray-600">Defect</th>
                </tr>
              </thead>
              <tbody>${rowsHTML}</tbody>
            </table>
          </div>

          <div class="p-6 space-y-4">
            <div>
              <label for="status" class="block mb-1 font-medium text-gray-700">
                Status Produksi
              </label>
              <select
                id="status"
                name="status"
                class="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-teal-200"
              >
                ${['pending', 'in_progress', 'done']
                  .map(s => `<option value="${s}" ${prod.status === s ? 'selected' : ''}>
                    ${s.replace('_', ' ')}
                  </option>`)
                  .join('')}
              </select>
            </div>

            <div class="flex flex-wrap gap-4">
              <button
                type="submit"
                class="flex-1 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg shadow"
              >
                Simpan
              </button>
              <button
                type="button"
                id="back-list"
                class="flex-1 px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium rounded-lg shadow"
              >
                Batal
              </button>
              ${prod.status === 'done'
                ? `<button
                    type="button"
                    id="to-invoice"
                    class="flex-1 px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-medium rounded-lg shadow"
                  >Buat Invoice</button>`
                : ''}
            </div>
          </div>
        </form>
      </div>
    `;

    this.afterRender(prod);
  },

  afterRender(prod) {
    const form    = document.getElementById('production-form');
    const backBtn = document.getElementById('back-list');

    form.addEventListener('submit', e => {
      e.preventDefault();

      // Ambil data dari input
      const updatedItems = Array.from(form.querySelectorAll('tbody tr')).map(tr => ({
        size:      tr.children[1].textContent,
        color:     tr.children[2].textContent,
        qtyFabric: Number(tr.children[3].textContent),
        qtyJadi:   Number(tr.querySelector('input[name="qtyJadi"]').value),
        defect:    Number(tr.querySelector('input[name="defect"]').value),
      }));

      prod.items  = updatedItems;
      prod.status = form.status.value;
      ProductionService.saveProduction(prod);

      AlertService.show('Laporan produksi berhasil disimpan.', 'success');
      this.render();
    });

    backBtn.addEventListener('click', () => {
      AlertService.show('Perubahan dibatalkan.', 'info');
      location.hash = '#production-list';
    });

    const btnInv = document.getElementById('to-invoice');
    if (btnInv) {
      btnInv.addEventListener('click', () => {
        location.hash = `#invoice-form?productionId=${prod.id}`;
      });
    }
  }
};
