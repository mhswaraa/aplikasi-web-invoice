// /js/views/OrderDetailView.js

import { OrderService } from '../services/OrderService.js';

export const OrderDetailView = {
  render() {
    const app = document.getElementById('app');
    const [, id] = location.hash.split('/');
    const o = OrderService.getOrder(id);

    if (!o) {
      app.innerHTML = `<p>Order dengan ID "${id}" tidak ditemukan.</p>`;
      return;
    }

    // Bangun baris detail items
    const itemsHTML = (Array.isArray(o.items) ? o.items : []).map((it, idx) => {
      const lineTotal = (Number(it.qtyFabric) || 0) * (Number(it.price) || 0);
      return `
        <tr>
          <td>${idx+1}</td>
          <td>${it.size}</td>
          <td class="text-right">${it.qtyFabric}</td>
          <td class="text-right">${(it.price).toLocaleString()}</td>
          <td class="text-right">${lineTotal.toLocaleString()}</td>
        </tr>
      `;
    }).join('');

    // Hitung subtotal kain dan total biaya
    const subtotalQty = o.items.reduce((sum, it) => sum + (Number(it.qtyFabric)||0), 0);
    const subtotalCost= o.items.reduce((sum, it) => sum + ((Number(it.qtyFabric)||0)*(Number(it.price)||0)), 0);

    app.innerHTML = `
      <div class="order-detail-container">
        <h2>Detail Order ${o.orderCode}</h2>
        <p><strong>Klien:</strong> ${o.clientName} (${o.clientCode})</p>
        <p><strong>Paket:</strong> ${o.package}</p>
        <p><strong>Model:</strong> ${o.model}</p>
        <p><strong>Status:</strong> ${o.status}</p>
        <p><strong>Deskripsi:</strong> ${o.notes}</p>
        <p><strong>Dibuat:</strong> ${new Date(o.createdAt).toLocaleString()}</p>

        <table class="item-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Size</th>
              <th class="text-right">Qty Kain</th>
              <th class="text-right">Harga/pcs</th>
              <th class="text-right">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
        </table>

        <p class="total-qty">Total Qty Kain: ${subtotalQty}</p>
        <p class="total-qty">Total Biaya: ${subtotalCost.toLocaleString()}</p>

        <div class="no-print">
          <button id="back-btn" class="btn">Kembali ke List</button>
          <button id="to-production" class="btn">Buat Produksi</button>
        </div>
      </div>
    `;
    this.afterRender(id);
  },

  afterRender(id) {
    document.getElementById('back-btn')
      .addEventListener('click', () => location.hash = '#order-list');

    document.getElementById('to-production')
      .addEventListener('click', () => {
        // Arahkan ke form produksi, misal #production-form/{orderId}
        location.hash = `#production-form/${id}`;
      });
  }
};
