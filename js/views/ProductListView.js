// /js/views/ProductListView.js

import { ProductService }      from '../services/ProductService.js';
import { ClientService }       from '../services/ClientService.js';
import { ImportExportService } from '../services/ImportExportService.js';
import { AlertService }        from '../services/AlertService.js';

export const ProductListView = {
  render() {
    const app      = document.getElementById('app');
    const products = ProductService.getAllProducts();

    // Build table rows
    const rows = products.map((p, i) => {
      const client = ClientService.getClient(p.clientId);
      const clientName = client ? client.name : '-';
      return `
        <tr class="${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}">
          <td class="px-4 py-2 text-center">${i + 1}</td>
          <td class="px-4 py-2">${p.productCode}</td>
          <td class="px-4 py-2">${p.name}</td>
          <td class="px-4 py-2">${clientName}</td>
          <td class="px-4 py-2 text-right">${p.sewingCost.toLocaleString()}</td>
          <td class="px-4 py-2 text-right">${p.fabricConsumption}</td>
          <td class="px-4 py-2 text-right">${p.price.toLocaleString()}</td>
          <td class="px-4 py-2">${p.vendor || '-'}</td>
          <td class="px-4 py-2">${p.updatedAt}</td>
          <td class="px-4 py-2 relative">
            <button
              class="action-toggle px-2 py-1 hover:bg-gray-200 rounded focus:outline-none"
              data-id="${p.id}"
            >⋮</button>
          </td>
        </tr>`;
    }).join('');

    const emptyRow = `
      <tr>
        <td colspan="10" class="px-4 py-8 text-center text-gray-500">
          Belum ada data produk.
        </td>
      </tr>`;

    app.innerHTML = `
      <div class="container mx-auto p-6 bg-white shadow-md rounded-lg relative">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-2xl font-semibold text-gray-800">Master Produk</h2>
          <div class="space-x-2">
            <button id="export-products" class="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm">
              Export CSV
            </button>
            <input type="file" id="import-products" accept=".csv" class="hidden" />
            <button id="trigger-import-products" class="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm">
              Import CSV
            </button>
            <button id="add-product" class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm">
              + Tambah Produk
            </button>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full table-auto border-collapse">
            <thead>
              <tr class="bg-gray-100">
                <th class="px-4 py-2">No</th>
                <th class="px-4 py-2">Kode</th>
                <th class="px-4 py-2">Nama</th>
                <th class="px-4 py-2">Klien</th>
                <th class="px-4 py-2 text-right">Ongkos</th>
                <th class="px-4 py-2 text-right">Kain (m)</th>
                <th class="px-4 py-2 text-right">Harga</th>
                <th class="px-4 py-2">Vendor</th>
                <th class="px-4 py-2">Updated</th>
                <th class="px-4 py-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${products.length ? rows : emptyRow}
            </tbody>
          </table>
        </div>

        <div id="product-action-menu" class="
          fixed z-50 invisible opacity-0 scale-95
          transform transition duration-200 origin-top-right
          bg-white border rounded shadow-lg
        ">
          <button id="menu-edit" class="block w-full text-left px-4 py-2 hover:bg-gray-100">Edit</button>
          <button id="menu-delete" class="block w-full text-left px-4 py-2 hover:bg-gray-100">Hapus</button>
        </div>
      </div>`;

    this.afterRender();
  },

  afterRender() {
    const menu     = document.getElementById('product-action-menu');
    const btnEdit  = document.getElementById('menu-edit');
    const btnDel   = document.getElementById('menu-delete');
    const exportBtn = document.getElementById('export-products');
    const importInput = document.getElementById('import-products');
    const triggerImport = document.getElementById('trigger-import-products');
    let   currentId;

    const hideMenu = () => menu.classList.add('invisible','opacity-0','scale-95');

    // Toggle action menu
    document.querySelectorAll('.action-toggle').forEach(btn =>
      btn.addEventListener('click', e => {
        e.stopPropagation();
        currentId = btn.dataset.id;
        const rect = btn.getBoundingClientRect();
        const top  = rect.bottom + window.scrollY;
        let   left = rect.right - menu.offsetWidth + window.scrollX;
        if (left + menu.offsetWidth > window.innerWidth) {
          left = window.innerWidth - menu.offsetWidth - 8;
        }
        menu.style.top  = `${top}px`;
        menu.style.left = `${Math.max(left,8)}px`;
        menu.classList.toggle('invisible');
        menu.classList.toggle('opacity-0');
        menu.classList.toggle('scale-95');
      })
    );
    document.addEventListener('click', hideMenu);
    window.addEventListener('resize', hideMenu);

    // Add new product
    document.getElementById('add-product')
      .addEventListener('click', () => location.hash = '#product-form');

    // Edit product
    btnEdit.addEventListener('click', () => {
      hideMenu();
      if (!currentId) return;
      location.hash = `#product-form/${currentId}`;
    });

    // Delete product
    btnDel.addEventListener('click', () => {
      hideMenu();
      if (!currentId) return;
      if (!confirm('Yakin hapus produk ini?')) return;
      ProductService.deleteProduct(currentId);
      AlertService.show('Produk berhasil dihapus.', 'success');
      this.render();
    });

    // Export CSV
    exportBtn.addEventListener('click', () => {
      ImportExportService.exportCSV('products');
    });

    // Trigger import input
    triggerImport.addEventListener('click', () => {
      importInput.click();
    });

    // Import CSV
    importInput.addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;
      ImportExportService.importCSV(
        'products',
        file,
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
        {
          uniqueKey: 'productCode',
          updateExisting: true
        }
      );
      importInput.value = '';
    });
  }
};
