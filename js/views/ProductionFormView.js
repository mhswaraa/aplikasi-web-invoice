// /js/views/ProductionFormView.js

import { ProductionService } from '../services/ProductionService.js';
import { AlertService }      from '../services/AlertService.js';

export const ProductionFormView = {
  render() {
    const app     = document.getElementById('app');
    const [, prodId] = location.hash.split('/');
    const prod    = ProductionService.getProduction(prodId);

    if (!prod) {
      app.innerHTML = `
        <div class="container mx-auto p-6 bg-white shadow-md rounded-lg text-center">
          <p class="text-red-500">Produksi ID "${prodId}" tidak ditemukan.</p>
          <button
            id="back-list"
            class="mt-4 px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg"
          >Kembali</button>
        </div>`;
      // tombol kembali
      setTimeout(() => {
        document.getElementById('back-list')
          .addEventListener('click', () => location.hash = '#production-list');
      }, 0);
      return;
    }

    // build rows, termasuk kolom warna
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
            class="w-20 px-2 py-1 border rounded text-right"
          />
        </td>
        <td class="px-4 py-2">
          <input
            type="number"
            name="defect"
            min="0"
            value="${it.defect || 0}"
            required
            class="w-20 px-2 py-1 border rounded text-right"
          />
        </td>
      </tr>
    `).join('');

    app.innerHTML = `
      <div class="container mx-auto p-6 bg-white shadow-md rounded-lg">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-2xl font-semibold text-gray-800">
            Edit Produksi – Order ${prod.orderCode}
          </h2>
        </div>

        <form id="production-form">
          <div class="overflow-x-auto mb-6">
            <table class="min-w-full table-auto border-collapse">
              <thead>
                <tr class="bg-gray-100">
                  <th class="px-4 py-2 text-left text-gray-600">No</th>
                  <th class="px-4 py-2 text-left text-gray-600">Size</th>
                  <th class="px-4 py-2 text-left text-gray-600">Warna</th>
                  <th class="px-4 py-2 text-right text-gray-600">Qty Kain</th>
                  <th class="px-4 py-2 text-right text-gray-600">Qty Jadi</th>
                  <th class="px-4 py-2 text-right text-gray-600">Defect</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHTML}
              </tbody>
            </table>
          </div>

          <div class="mb-6">
            <label for="status" class="block mb-1 font-medium text-gray-700">
              Status Produksi
            </label>
            <select
              id="status"
              name="status"
              class="w-full px-3 py-2 border rounded"
            >
              ${['pending','in_progress','done']
                .map(s => `
                  <option value="${s}"
                    ${prod.status === s ? 'selected' : ''}>
                    ${s.replace(/_/g,' ')}
                  </option>`)
                .join('')}
            </select>
          </div>

          <div class="flex space-x-4">
            <button
              type="submit"
              class="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
            >Simpan</button>

            <button
              type="button"
              id="back-list"
              class="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg"
            >Batal</button>

            ${
              prod.status === 'done'
                ? `<button
                    type="button"
                    id="to-invoice"
                    class="px-6 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg"
                  >Buat Invoice</button>`
                : ''
            }
          </div>
        </form>
      </div>
    `;

    this.afterRender(prod);
  },

  afterRender(prod) {
    const form = document.getElementById('production-form');

    // Simpan
    form.addEventListener('submit', e => {
      e.preventDefault();
      const updatedItems = Array.from(
        form.querySelectorAll('tbody tr')
      ).map(tr => ({
        size:      tr.children[1].textContent,
        color:     tr.children[2].textContent,
        qtyFabric: Number(tr.children[3].textContent),
        qtyJadi:   Number(tr.querySelector('input[name="qtyJadi"]').value),
        defect:    Number(tr.querySelector('input[name="defect"]').value),
      }));

      prod.items  = updatedItems;
      prod.status = form.status.value;
      ProductionService.saveProduction(prod);

      AlertService.show('Laporan produksi tersimpan.', 'success');
      this.render();
    });

    // Batal
    document.getElementById('back-list')
      .addEventListener('click', () => location.hash = '#production-list');

    // Buat Invoice (jika status done)
    const btnInv = document.getElementById('to-invoice');
    if (btnInv) {
      btnInv.addEventListener('click', () => {
        location.hash = `#invoice-form?productionId=${prod.id}`;
      });
    }
  }
};
