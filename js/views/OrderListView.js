// /js/views/OrderListView.js
import { OrderService }      from '../services/OrderService.js';
import { ProductionService } from '../services/ProductionService.js';
import { AlertService }      from '../services/AlertService.js';

export const OrderListView = {
  render() {
    const app    = document.getElementById('app');
    const orders = OrderService.getAllOrders();

    // Bangun baris tabel
    const rows = orders.map((o, i) => {
      const totalQty = Array.isArray(o.items)
        ? o.items.reduce((sum, it) => sum + (Number(it.qtyFabric)||0), 0)
        : 0;
      const btnProc = ['Draft','Confirmed'].includes(o.status)
        ? 'Proses'
        : null;

      const date = new Date(o.orderDate || o.createdAt)
        .toLocaleDateString('id-ID',{ day:'2-digit', month:'2-digit', year:'numeric' });
      const colors = Array.isArray(o.items)
        ? o.items.map(it => it.color||'-').join(', ')
        : '-';

      return `
        <tr class="${i%2===0?'bg-white':'bg-gray-50'}">
          <td class="px-4 py-2 text-center">${i+1}</td>
          <td class="px-4 py-2">${date}</td>
          <td class="px-4 py-2">${o.clientName}</td>
          <td class="px-4 py-2">${o.package}</td>
          <td class="px-4 py-2">${o.model}</td>
          <td class="px-4 py-2">${colors}</td>
          <td class="px-4 py-2 text-right">${totalQty}</td>
          <td class="px-4 py-2">${o.status}</td>
          <td class="px-4 py-2 relative">
            <button
              class="action-toggle px-2 py-1 hover:bg-gray-200 rounded focus:outline-none"
              aria-label="Toggle actions"
              data-id="${o.id}"
              data-proc="${btnProc||''}"
            >⋮</button>
          </td>
        </tr>`;
    }).join('');

    const emptyRow = `
      <tr>
        <td colspan="9" class="px-4 py-8 text-center text-gray-500">
          Belum ada order.
        </td>
      </tr>`;

    app.innerHTML = `
      <div class="container mx-auto p-6 bg-white shadow-md rounded-lg relative">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-2xl font-semibold text-gray-800">Order Masuk</h2>
          <button
            id="add-order"
            class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm transition"
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
              ${ orders.length ? rows : emptyRow }
            </tbody>
          </table>
        </div>

        <!-- GLOBAL action menu -->
        <div id="order-action-menu" class="
          fixed z-50 invisible opacity-0 scale-95
          transform transition duration-200 origin-top-right
          bg-white border rounded shadow-lg
        ">
          <button id="menu-detail" class="block w-full text-left px-4 py-2 hover:bg-gray-100">Detail</button>
          <button id="menu-edit"   class="block w-full text-left px-4 py-2 hover:bg-gray-100">Edit</button>
          <button id="menu-delete" class="block w-full text-left px-4 py-2 hover:bg-gray-100">Hapus</button>
          <button id="menu-proc"   class="block w-full text-left px-4 py-2 hover:bg-gray-100 hidden">Proses</button>
        </div>
      </div>
    `;

    this.afterRender();
  },

  afterRender() {
    const menu     = document.getElementById('order-action-menu');
    const btnDetail= document.getElementById('menu-detail');
    const btnEdit  = document.getElementById('menu-edit');
    const btnDel   = document.getElementById('menu-delete');
    const btnProc  = document.getElementById('menu-proc');
    let   currentId;

    const hideMenu = () =>
      menu.classList.add('invisible','opacity-0','scale-95');

    // Toggle dropdown
    document.querySelectorAll('.action-toggle').forEach(btn =>
      btn.addEventListener('click', e => {
        e.stopPropagation();
        currentId = e.currentTarget.dataset.id;

        // position
        const rect = e.currentTarget.getBoundingClientRect();
        const top  = rect.bottom + window.scrollY;
        let   left = rect.right - menu.offsetWidth + window.scrollX;
        if (left + menu.offsetWidth > window.innerWidth) {
          left = window.innerWidth - menu.offsetWidth - 8;
        }
        menu.style.top  = `${top}px`;
        menu.style.left = `${Math.max(left,8)}px`;

        // show/hide
        const hasProc = !!e.currentTarget.dataset.proc;
        btnProc.classList.toggle('hidden', !hasProc);
        menu.classList.toggle('invisible');
        menu.classList.toggle('opacity-0');
        menu.classList.toggle('scale-95');
      })
    );

    // klik luar atau resize → hide
    document.addEventListener('click', hideMenu);
    window.addEventListener('resize', hideMenu);

    // action handlers
    btnDetail.addEventListener('click', () => {
      hideMenu();
      location.hash = `#order-detail/${currentId}`;
    });
    btnEdit.addEventListener('click', () => {
      hideMenu();
      location.hash = `#order-form/${currentId}`;
    });
    btnDel.addEventListener('click', () => {
      hideMenu();
      if (!confirm('Yakin hapus order ini?')) return;
      OrderService.deleteOrder(currentId);
      AlertService.show('Order berhasil dihapus.', 'success');
      this.render();
    });
    btnProc.addEventListener('click', () => {
      hideMenu();
      if (!confirm('Proses order ini ke produksi?')) return;
      const prod = ProductionService.initFromOrder(currentId);
      const ord  = OrderService.getOrder(currentId);
      ord.status = 'On Production';
      OrderService.saveOrder(ord);
      AlertService.show(`Order ${ord.orderCode} diproses (Prod ID: ${prod.id})`, 'success');
      this.render();
    });

    // tambah order
    document.getElementById('add-order')
      .addEventListener('click', () => location.hash = '#order-form');
  }
};
