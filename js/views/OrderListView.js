// /js/views/OrderListView.js

import { OrderService }        from '../services/OrderService.js';
import { ProductionService }   from '../services/ProductionService.js';
import { ImportExportService } from '../services/ImportExportService.js';
import { AlertService }        from '../services/AlertService.js';

export const OrderListView = {
  // state untuk pagination
  _state: {
    waitingPage: 1,
    prodPage:    1,
    donePage:    1,
    pageSize:   10
  },

  render() {
    const { waitingPage, prodPage, donePage, pageSize } = this._state;
    const app    = document.getElementById('app');
    const orders = OrderService.getAllOrders();

    // 1) Pisahkan status
    const waiting      = orders.filter(o => ['Draft','Confirmed'].includes(o.status));
    const onProduction = orders.filter(o => o.status === 'On Production');
    const doneOrders   = orders.filter(o => o.status === 'done');

    // 2) Kalkulasi paging: total pages
    const pages = arr => Math.ceil(arr.length / pageSize);

    // 3) Ambil slice untuk halaman saat ini
    const slicePage = (arr, page) => {
      const start = (page - 1) * pageSize;
      return arr.slice(start, start + pageSize);
    };

    // 4) Helper build rows
    const buildRows = (arr) => arr.map((o, i) => {
      const totalQty = (o.items || []).reduce((s, it) => s + Number(it.qtyFabric||0), 0);
      const date     = new Date(o.orderDate || o.createdAt)
                        .toLocaleDateString('id-ID',{ day:'2-digit', month:'2-digit', year:'numeric' });
      const colors   = (o.items||[]).map(it=>it.color||'-').join(', ');
      const canProc  = ['Draft','Confirmed'].includes(o.status);
      return `
        <tr class="${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}">
          <td class="px-4 py-2 text-center">${i + 1}</td>
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
              data-id="${o.id}"
              data-canproc="${canProc}"
            >⋮</button>
          </td>
        </tr>`;
    }).join('');

    // 5) Tampilkan tabel + pagination controls
    const renderTable = (title, dataArr, page, stateKey) => {
      const totalPages = pages(dataArr);
      const pageData   = slicePage(dataArr, page);
      const emptyRow   = `
        <tr>
          <td colspan="9" class="px-4 py-8 text-center text-gray-500">Tidak ada data.</td>
        </tr>`;
      return `
        <div>
          <h3 class="text-xl font-medium mb-2">${title}</h3>
          <div class="overflow-x-auto bg-white shadow rounded-lg">
            <table class="min-w-full table-auto border-collapse">
              <thead class="bg-gray-100">
                <tr>
                  <th class="px-4 py-2">No</th>
                  <th class="px-4 py-2">Tgl Masuk</th>
                  <th class="px-4 py-2">Klien</th>
                  <th class="px-4 py-2">Paket</th>
                  <th class="px-4 py-2">Model</th>
                  <th class="px-4 py-2">Warna</th>
                  <th class="px-4 py-2 text-right">Qty</th>
                  <th class="px-4 py-2">Status</th>
                  <th class="px-4 py-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                ${ pageData.length ? buildRows(pageData) : emptyRow }
              </tbody>
            </table>
          </div>
          ${ totalPages > 1
            ? `<div class="flex justify-center items-center mt-2 space-x-4">
                <button class="page-btn bg-gray-200 px-3 py-1 rounded" data-key="${stateKey}" data-dir="-1">
                  ◀
                </button>
                <span>Halaman ${page} / ${totalPages}</span>
                <button class="page-btn bg-gray-200 px-3 py-1 rounded" data-key="${stateKey}" data-dir="1">
                  ▶
                </button>
              </div>`
            : ''
          }
        </div>`;
    };

    app.innerHTML = `
      <div class="container mx-auto p-6 space-y-8">

        <!-- Header & tombol umum -->
        <div class="flex items-center justify-between">
          <h2 class="text-2xl font-semibold">Order Masuk</h2>
          <div class="space-x-2">
            <button id="export-orders" class="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm">Export CSV</button>
            <input type="file" id="import-orders" accept=".csv" class="hidden" />
            <button id="trigger-import-orders" class="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm">Import CSV</button>
            <button id="add-order" class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm">+ Tambah Order</button>
          </div>
        </div>

        ${renderTable('Menunggu Proses', waiting, waitingPage, 'waitingPage')}
        ${renderTable('On Production', onProduction, prodPage,    'prodPage')}
        ${renderTable('Selesai',            doneOrders, donePage,  'donePage')}

        <!-- GLOBAL action menu -->
        <div id="order-action-menu" class="fixed z-50 invisible opacity-0 scale-95
             transform transition duration-200 origin-top-right
             bg-white border rounded shadow-lg">
          <button id="menu-detail"  class="block w-full text-left px-4 py-2 hover:bg-gray-100">Detail</button>
          <button id="menu-edit"    class="block w-full text-left px-4 py-2 hover:bg-gray-100">Edit</button>
          <button id="menu-delete"  class="block w-full text-left px-4 py-2 hover:bg-gray-100">Hapus</button>
          <button id="menu-proc"    class="block w-full text-left px-4 py-2 hover:bg-gray-100">Proses</button>
        </div>
      </div>
    `;

    this.afterRender();
  },

  afterRender() {
    const { pageSize } = this._state;
    const menu         = document.getElementById('order-action-menu');
    const btnDetail    = document.getElementById('menu-detail');
    const btnEdit      = document.getElementById('menu-edit');
    const btnDel       = document.getElementById('menu-delete');
    const btnProc      = document.getElementById('menu-proc');
    const exportBtn    = document.getElementById('export-orders');
    const importInput  = document.getElementById('import-orders');
    const triggerImport= document.getElementById('trigger-import-orders');
    const addBtn       = document.getElementById('add-order');
    let   currentId, canProc;

    const hideMenu = () => menu.classList.add('invisible','opacity-0','scale-95');

    // Pastikan menu dalam <body> agar position:absolute mengacu ke viewport
document.body.appendChild(menu);
menu.style.position = 'absolute';

// Toggle dropdown per row
document.querySelectorAll('.action-toggle').forEach(btn =>
  btn.addEventListener('click', e => {
    e.stopPropagation();
    currentId = btn.dataset.id;
    canProc   = btn.dataset.canproc === 'true';

    // ambil bounding tombol
    const rect = btn.getBoundingClientRect();

    // hitung posisi menu
    const top  = rect.bottom + window.scrollY;            // segera di bawah tombol
    const left = rect.left   + window.scrollX;            // sejajar sisi kiri tombol

    // assign posisi
    menu.style.top  = `${top}px`;
    menu.style.left = `${left}px`;

    // show/hide tombol Proses
    btnProc.classList.toggle('hidden', !canProc);

    // toggle visibility
    menu.classList.toggle('invisible');
    menu.classList.toggle('opacity-0');
    menu.classList.toggle('scale-95');
  })
);

// klik luar → hide
document.addEventListener('click', () => {
  menu.classList.add('invisible','opacity-0','scale-95');
});

    // Action handlers…
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
      if (!confirm('Proses order ke produksi?')) return;
      const prod = ProductionService.initFromOrder(currentId);
      const ord  = OrderService.getOrder(currentId);
      ord.status = 'On Production';
      OrderService.saveOrder(ord);
      AlertService.show(`Order ${ord.orderCode} diproses (Prod ID: ${prod.id})`, 'success');
      this.render();
    });
    addBtn.addEventListener('click', () => location.hash = '#order-form');

    // Export CSV
    exportBtn.addEventListener('click', () => ImportExportService.exportCSV('orders'));

    // Import CSV
    triggerImport.addEventListener('click', () => importInput.click());
    importInput.addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;
      ImportExportService.importCSV(
        'orders', file,
        (result, err) => {
          if (err) {
            AlertService.show(`Import gagal: ${err.message}`, 'error');
          } else {
            AlertService.show(
              `Import selesai. Ditambahkan ${result.added}, Diperbarui ${result.updated}`,
              'success'
            );
            this.render();
          }
        },
        { uniqueKey: 'orderCode', updateExisting: true }
      );
      importInput.value = '';
    });

    // Pagination buttons
    document.querySelectorAll('.page-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        const key = btn.dataset.key;        // 'waitingPage' | 'prodPage' | 'donePage'
        const dir = Number(btn.dataset.dir); // -1 atau +1
        const max = Math.ceil(
          OrderService.getAllOrders()
            .filter(o =>
              key === 'waitingPage'
                ? ['Draft','Confirmed'].includes(o.status)
                : key === 'prodPage'
                  ? o.status === 'On Production'
                  : o.status === 'done'
            ).length / pageSize
        );
        this._state[key] = Math.min(
          Math.max(this._state[key] + dir, 1),
          max
        );
        this.render();
      });
    });
  }
};
