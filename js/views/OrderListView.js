// /js/views/OrderListView.js
import { OrderService }       from '../services/OrderService.js';
import { ProductionService }  from '../services/ProductionService.js';
import { AlertService }       from '../services/AlertService.js';

export const OrderListView = {
  render() {
    const app    = document.getElementById('app');
    const orders = OrderService.getAllOrders();

    // Bangun baris tabel
    const rows = orders.map((o, i) => {
      // Total qty
      const totalQty = Array.isArray(o.items)
        ? o.items.reduce((sum, it) => sum + (Number(it.qtyFabric)||0), 0)
        : 0;
      // Tombol proses (jika status Draft/Confirmed)
      const btnProcess = ['Draft','Confirmed'].includes(o.status)
        ? `<button
             class="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm process-order"
             data-id="${o.id}"
             title="Proses Order"
             aria-label="Proses Order"
           >Proses</button>`
        : '';
      // Tanggal masuk
      const date = new Date(o.orderDate || o.createdAt)
        .toLocaleDateString('id-ID', { day:'2-digit', month:'2-digit', year:'numeric' });
      // Semua warna (gabung)
      const colors = Array.isArray(o.items)
        ? o.items.map(it => it.color||'-').join(', ')
        : '-';

      return `
      <tr class="${ i%2===0 ? 'bg-white' : 'bg-gray-50' }">
        <td class="px-4 py-2 text-center">${i+1}</td>
        <td class="px-4 py-2">${date}</td>
        <td class="px-4 py-2">${o.clientName}</td>
        <td class="px-4 py-2">${o.package}</td>
        <td class="px-4 py-2">${o.model}</td>
        <td class="px-4 py-2">${colors}</td>
        <td class="px-4 py-2 text-right">${totalQty}</td>
        <td class="px-4 py-2">${o.status}</td>
        <td class="px-4 py-2 text-center space-x-2">
          <button
            class="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm detail-order"
            data-id="${o.id}"
            title="Detail Order"
            aria-label="Detail Order"
          >Detail</button>
          <button
            class="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-sm view-order"
            data-id="${o.id}"
            title="Edit Order"
            aria-label="Edit Order"
          >Edit</button>
          <button
            class="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm delete-order"
            data-id="${o.id}"
            title="Hapus Order"
            aria-label="Hapus Order"
          >Hapus</button>
          ${btnProcess}
        </td>
      </tr>`;
    }).join('');

    // Baris kosong bila belum ada data
    const emptyRow = `
      <tr>
        <td colspan="9" class="px-4 py-8 text-center text-gray-500">
          Belum ada order.
        </td>
      </tr>`;

    app.innerHTML = `
      <div class="container mx-auto p-6 bg-white shadow-md rounded-lg">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-2xl font-semibold text-gray-800">Order Masuk</h2>
          <button
            id="add-order"
            class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm"
          >+ Tambah Order</button>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full table-auto border-collapse">
            <thead>
              <tr class="bg-gray-100">
                <th class="px-4 py-2 text-left text-gray-600">No</th>
                <th class="px-4 py-2 text-left text-gray-600">Tgl Masuk</th>
                <th class="px-4 py-2 text-left text-gray-600">Klien</th>
                <th class="px-4 py-2 text-left text-gray-600">Paket</th>
                <th class="px-4 py-2 text-left text-gray-600">Model</th>
                <th class="px-4 py-2 text-left text-gray-600">Warna</th>
                <th class="px-4 py-2 text-right text-gray-600">Qty</th>
                <th class="px-4 py-2 text-left text-gray-600">Status</th>
                <th class="px-4 py-2 text-center text-gray-600">Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${ rows.length ? rows : emptyRow }
            </tbody>
          </table>
        </div>
      </div>
    `;

    this.afterRender();
  },

  afterRender() {
    // Tambah Order
    document.getElementById('add-order')
      .addEventListener('click', () => location.hash = '#order-form');

    // Detail
    document.querySelectorAll('button[title="Detail Order"]').forEach(btn =>
      btn.addEventListener('click', e => {
        const id = e.currentTarget.dataset.id;
        location.hash = `#order-detail/${id}`;
      })
    );

    // Edit
    document.querySelectorAll('button[title="Edit Order"]').forEach(btn =>
      btn.addEventListener('click', e => {
        const id = e.currentTarget.dataset.id;
        location.hash = `#order-form/${id}`;
      })
    );

    // Hapus
    document.querySelectorAll('button[title="Hapus Order"]').forEach(btn =>
      btn.addEventListener('click', e => {
        const id = e.currentTarget.dataset.id;
        if (!confirm('Yakin hapus order ini?')) return;
        OrderService.deleteOrder(id);
        this.render();
      })
    );

    // Proses → Produksi
    document.querySelectorAll('.process-order').forEach(btn =>
      btn.addEventListener('click', e => {
        const id = e.currentTarget.dataset.id;
        if (!confirm('Proses order ini ke produksi?')) return;
        const prod = ProductionService.initFromOrder(id);
        const ord  = OrderService.getOrder(id);
        ord.status = 'On Production';
        OrderService.saveOrder(ord);
        AlertService.show(`Order ${ord.orderCode} diproses (Prod ID: ${prod.id})`, 'success');
        this.render();
      })
    );
  }
};
