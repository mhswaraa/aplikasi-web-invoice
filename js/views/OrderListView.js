// /js/views/OrderListView.js
import { OrderService } from '../services/OrderService.js';
import { ProductionService } from '../services/ProductionService.js';
import { AlertService } from '../services/AlertService.js';

export const OrderListView = {
  render() {
    const app    = document.getElementById('app');
    const orders = OrderService.getAllOrders();

    const rows = orders.map((o, i) => {
      // Hitung total qty dari semua items
      const totalQty = Array.isArray(o.items)
        ? o.items.reduce((sum, it) => sum + (Number(it.qtyFabric) || 0), 0)
        : 0;

      // Tombol “Proses” hanya untuk order Draft/Confirmed
      const btnProcess = ['Draft', 'Confirmed'].includes(o.status)
        ? `<button class="btn process-order" data-id="${o.id}">Proses</button>`
        : '';

      // Tampilkan tanggal masuk dan format human readable
      const date = new Date(o.orderDate || o.createdAt).toLocaleDateString();

      return `
        <tr>
          <td>${i + 1}</td>
          <td>${date}</td>
          <td>${o.clientName}</td>
          <td>${o.package}</td>
          <td>${o.model}</td>
          <td>${o.items.map(it=>it.color||'-').join(', ')}</td>
          <td>${totalQty}</td>
          <td>${o.status}</td>
          <td>
            <button class="btn detail-order" data-id="${o.id}">Detail</button>
            <button class="btn view-order"   data-id="${o.id}">Edit</button>
            <button class="btn delete-order" data-id="${o.id}">Hapus</button>
            ${btnProcess}
          </td>
        </tr>
      `;
    }).join('');

    app.innerHTML = `
      <div class="order-list-container">
        <h2>Order Masuk</h2>
        <button id="add-order" class="btn">Tambah Order</button>
        <table class="item-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Tgl Masuk</th>
              <th>Klien</th>
              <th>Paket</th>
              <th>Model</th>
              <th>Warna</th>
              <th>Total Qty Kain</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${rows || `
              <tr>
                <td colspan="9" style="text-align:center">
                  Belum ada order.
                </td>
              </tr>`}
          </tbody>
        </table>
      </div>
    `;
    this.afterRender();
  },

  afterRender() {
    // Tambah Order
    document.getElementById('add-order')
      .addEventListener('click', () => location.hash = '#order-form');

    // Detail
    document.querySelectorAll('.detail-order').forEach(btn =>
      btn.addEventListener('click', e => {
        const id = e.currentTarget.dataset.id;
        location.hash = `#order-detail/${id}`;
      })
    );

    // Edit
    document.querySelectorAll('.view-order').forEach(btn =>
      btn.addEventListener('click', e => {
        const id = e.currentTarget.dataset.id;
        location.hash = `#order-form/${id}`;
      })
    );

    // Hapus
    document.querySelectorAll('.delete-order').forEach(btn =>
      btn.addEventListener('click', e => {
        const id = e.currentTarget.dataset.id;
        if (!confirm('Yakin hapus order ini?')) return;
        OrderService.deleteOrder(id);
        this.render();
      })
    );

    // Proses ke Produksi
    document.querySelectorAll('.process-order').forEach(btn =>
      btn.addEventListener('click', e => {
        const id = e.currentTarget.dataset.id;
        if (!confirm('Proses order ini ke produksi?')) return;

        const prod = ProductionService.initFromOrder(id);
        const ord = OrderService.getOrder(id);
        ord.status = 'On Production';
        OrderService.saveOrder(ord);

        AlertService.show(`Order ${ord.orderCode} diproses (Prod ID: ${prod.id})`, 'success');
        this.render();
      })
    );
  }
};
