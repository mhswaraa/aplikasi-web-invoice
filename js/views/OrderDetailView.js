// /js/views/OrderDetailView.js

import { OrderService }      from '../services/OrderService.js';
import { ProductionService } from '../services/ProductionService.js';
import { AlertService }      from '../services/AlertService.js';

export const OrderDetailView = {
  render() {
    const app = document.getElementById('app');
    const [, id] = location.hash.split('/');
    const o = OrderService.getOrder(id);

    if (!o) {
      app.innerHTML = `
        <div class="container mx-auto p-6">
          <p class="text-red-600">Order dengan ID "${id}" tidak ditemukan.</p>
        </div>
      `;
      return;
    }

    // Build detail rows
    const itemsHTML = (Array.isArray(o.items) ? o.items : []).map((it, idx) => {
      const lineTotal = (Number(it.qtyFabric) || 0) * (Number(it.price) || 0);
      return `
        <tr class="${idx % 2 === 0 ? 'bg-gray-50' : ''}">
          <td class="px-4 py-2 text-center">${idx + 1}</td>
          <td class="px-4 py-2">${it.size}</td>
          <td class="px-4 py-2">${it.color || '-'}</td>
          <td class="px-4 py-2 text-right">${it.qtyFabric}</td>
          <td class="px-4 py-2 text-right">${it.price.toLocaleString()}</td>
          <td class="px-4 py-2 text-right">${lineTotal.toLocaleString()}</td>
        </tr>
      `;
    }).join('');

    const emptyRow = `
      <tr>
        <td colspan="6" class="px-4 py-8 text-center text-gray-500">
          Belum ada item.
        </td>
      </tr>
    `;

    // Compute totals
    const subtotalQty  = o.items.reduce((sum, it) => sum + (Number(it.qtyFabric) || 0), 0);
    const subtotalCost = o.items.reduce((sum, it) =>
      sum + ((Number(it.qtyFabric) || 0) * (Number(it.price) || 0)), 0);

    // Format dates
    const createdAt = new Date(o.createdAt).toLocaleString('id-ID');
    const orderDate = new Date(o.orderDate || o.createdAt).toLocaleDateString('id-ID');

    app.innerHTML = `
      <div class="container mx-auto p-6 bg-white shadow rounded-lg">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-2xl font-semibold text-gray-800">Detail Order</h2>
          <div class="space-x-2">
            <button
              id="back-btn"
              type="button"
              class="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm">
              ← Kembali ke List
            </button>
            <!-- TOMBOL PRODUKSI / SELESAI -->
            <button
              id="production-btn"
              type="button"
              class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm">
              <!-- label akan di‑set di afterRender() -->
            </button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 text-gray-700">
          <div><strong>Tanggal Order:</strong> ${orderDate}</div>
          <div><strong>Dibuat:</strong> ${createdAt}</div>
          <div><strong>Klien:</strong> ${o.clientName} (${o.clientCode})</div>
          <div><strong>Paket:</strong> ${o.package}</div>
          <div><strong>Model:</strong> ${o.model}</div>
          <div><strong>Warna:</strong> ${o.items.map(it => it.color || '-').join(', ')}</div>
          <div><strong>Status:</strong> <span id="status-label">${o.status}</span></div>
          <div><strong>Deskripsi:</strong> ${o.notes || '-'}</div>
        </div>

        <div class="overflow-x-auto mb-6">
          <table class="min-w-full table-auto border-collapse">
            <thead>
              <tr class="bg-gray-100">
                <th class="px-4 py-2 text-left text-gray-600">No</th>
                <th class="px-4 py-2 text-left text-gray-600">Size</th>
                <th class="px-4 py-2 text-left text-gray-600">Warna</th>
                <th class="px-4 py-2 text-right text-gray-600">Qty Kain</th>
                <th class="px-4 py-2 text-right text-gray-600">Harga/pcs</th>
                <th class="px-4 py-2 text-right text-gray-600">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              ${o.items.length ? itemsHTML : emptyRow}
            </tbody>
          </table>
        </div>

        <div class="flex justify-end space-x-12 text-gray-800">
          <div>
            <div> <strong>Total Qty Kain:</strong> </div>
            <div class="text-xl font-semibold text-right">${subtotalQty}</div>
          </div>
          <div>
            <div> <strong>Total Biaya:</strong> </div>
            <div class="text-xl font-semibold text-right">${subtotalCost.toLocaleString()}</div>
          </div>
        </div>
      </div>
    `;

    this.afterRender(id);
  },

  afterRender(id) {
    const backBtn  = document.getElementById('back-btn');
    const prodBtn  = document.getElementById('production-btn');
    const statusEl = document.getElementById('status-label');

    // Kembali ke daftar order
    backBtn.addEventListener('click', () => location.hash = '#order-list');

    // Cek entri produksi terkait order ini
    const existingProd = ProductionService
      .getAllProductions()
      .find(p => p.orderId === id);

    // Reset tombol agar selalu mulai dari default biru
    prodBtn.disabled = false;
    prodBtn.style.display = 'inline-block';
    prodBtn.className = 'px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm';
    prodBtn.replaceWith(prodBtn.cloneNode(true)); // Hilangkan listeners lama
    const newBtn = document.getElementById('production-btn');

    if (!existingProd) {
      // Belum ada produksi → “Mulai Produksi”
      newBtn.textContent = 'Mulai Produksi';
      newBtn.addEventListener('click', () => {
        newBtn.disabled = true;
        ProductionService.initFromOrder(id);
        // update status order jadi in_progress
        const o = OrderService.getOrder(id);
        o.status = 'in_progress';
        OrderService.saveOrder(o);
        statusEl.textContent = o.status;
        AlertService.show('Produksi dimulai.', 'success');
        location.hash = '#production-list';
      });

    } else if (existingProd.status !== 'done') {
      // Ada produksi & belum selesai → sembunyikan tombol
      newBtn.style.display = 'none';

    } else {
      // Produksi selesai → “Order Selesai”
      newBtn.textContent = 'Order Selesai';
      newBtn.className = 'px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm';
      newBtn.addEventListener('click', () => {
        // update status order jadi done
        const o = OrderService.getOrder(id);
        o.status = 'done';
        OrderService.saveOrder(o);
        statusEl.textContent = o.status;
        AlertService.show('Order selesai.', 'success');
      });
    }
  }
};
