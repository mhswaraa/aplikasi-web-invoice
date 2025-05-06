// /js/views/ProductionListView.js

import { ProductionService }   from '../services/ProductionService.js';
import { ImportExportService } from '../services/ImportExportService.js';
import { AlertService }        from '../services/AlertService.js';

export const ProductionListView = {
  // state untuk paging
  _state: {
    page:     1,
    pageSize: 10
  },

  render() {
    const { page, pageSize } = this._state;
    const app   = document.getElementById('app');
    const prods = ProductionService.getAllProductions();

    // hitung total halaman
    const totalPages = Math.max(1, Math.ceil(prods.length / pageSize));

    // ambil slice untuk halaman sekarang
    const sliceStart = (page - 1) * pageSize;
    const pageData   = prods.slice(sliceStart, sliceStart + pageSize);

    // bangun baris tabel untuk pageData
    const rows = pageData.map((p, idx) => {
      const globalIndex = sliceStart + idx + 1;
      const totalJadi   = p.items.reduce((sum, it) => sum + (it.qtyJadi || 0), 0);
      const totalDefect = p.items.reduce((sum, it) => sum + (it.defect  || 0), 0);
      const orderDate   = p.orderDate
        ? new Date(p.orderDate).toLocaleDateString('id-ID', { day:'2-digit', month:'2-digit', year:'numeric' })
        : '-';
      const startDate   = new Date(p.createdAt).toLocaleDateString('id-ID', { day:'2-digit', month:'2-digit', year:'numeric' });
      const colors      = Array.isArray(p.items)
        ? [...new Set(p.items.map(it => it.color || '-'))].join(', ')
        : '-';

      return `
        <tr class="${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}">
          <td class="px-4 py-2 text-center">${globalIndex}</td>
          <td class="px-4 py-2">${orderDate}</td>
          <td class="px-4 py-2">${p.model || '-'}</td>
          <td class="px-4 py-2">${colors}</td>
          <td class="px-4 py-2">${p.clientName}</td>
          <td class="px-4 py-2">${p.status.replace('_',' ')}</td>
          <td class="px-4 py-2">${startDate}</td>
          <td class="px-4 py-2 text-right">${totalJadi}</td>
          <td class="px-4 py-2 text-right">${totalDefect}</td>
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
          Belum ada produksi.
        </td>
      </tr>`;

    // pagination controls
    const paginationHTML = totalPages > 1
      ? `
        <div class="flex justify-center items-center mt-4 space-x-4">
          <button id="page-prev" class="px-3 py-1 bg-gray-200 rounded" ${page === 1 ? 'disabled' : ''}>
            ◀
          </button>
          <span>Halaman ${page} / ${totalPages}</span>
          <button id="page-next" class="px-3 py-1 bg-gray-200 rounded" ${page === totalPages ? 'disabled' : ''}>
            ▶
          </button>
        </div>`
      : '';

    app.innerHTML = `
      <div class="container mx-auto p-6 bg-white shadow-md rounded-lg relative">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-2xl font-semibold text-gray-800">Laporan Produksi</h2>
          <div class="space-x-2">
            <button id="export-productions"
                    class="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg text-sm">
              Export CSV
            </button>
            <input type="file" id="import-productions" accept=".csv" class="hidden" />
            <button id="trigger-import-productions"
                    class="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm">
              Import CSV
            </button>
          </div>
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

        ${paginationHTML}

        <!-- GLOBAL action menu -->
        <div id="prod-action-menu" class="
          fixed z-50 invisible opacity-0 scale-95
          transform transition duration-200 origin-top-right
          bg-white border rounded shadow-lg
        ">
          <button id="menu-edit"   class="block w-full text-left px-4 py-2 hover:bg-gray-100">
            Edit
          </button>
          <button id="menu-delete" class="block w-full text-left px-4 py-2 hover:bg-gray-100">
            Hapus
          </button>
        </div>
      </div>`;

    this.afterRender();
  },

  afterRender() {
    const menu        = document.getElementById('prod-action-menu');
    const btnEdit     = document.getElementById('menu-edit');
    const btnDelete   = document.getElementById('menu-delete');
    const exportBtn   = document.getElementById('export-productions');
    const importInput = document.getElementById('import-productions');
    const triggerBtn  = document.getElementById('trigger-import-productions');
    const prevBtn     = document.getElementById('page-prev');
    const nextBtn     = document.getElementById('page-next');
    let   currentId;

    // pastikan menu absolute di body
    menu.style.position = 'absolute';
    document.body.appendChild(menu);

    const hideMenu = () =>
      menu.classList.add('invisible','opacity-0','scale-95');

    // Toggle dropdown
    document.querySelectorAll('.action-toggle').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        currentId = btn.dataset.id;
        const rect = btn.getBoundingClientRect();
        const top  = rect.bottom + window.scrollY;
        const left = rect.left   + window.scrollX;
        menu.style.top  = `${top}px`;
        menu.style.left = `${left}px`;
        menu.classList.toggle('invisible');
        menu.classList.toggle('opacity-0');
        menu.classList.toggle('scale-95');
      });
    });
    document.addEventListener('click', hideMenu);
    window.addEventListener('resize', hideMenu);

    // Edit produksi
    btnEdit.addEventListener('click', () => {
      hideMenu();
      location.hash = `#production-form/${currentId}`;
    });
    // Hapus produksi
    btnDelete.addEventListener('click', () => {
      hideMenu();
      if (!confirm('Yakin hapus laporan produksi ini?')) return;
      ProductionService.deleteProduction(currentId);
      AlertService.show('Laporan produksi berhasil dihapus.', 'success');
      this.render();
    });

    // Export CSV
    exportBtn.addEventListener('click', () => {
      ImportExportService.exportCSV('productions');
    });

    // Trigger import dialog
    triggerBtn.addEventListener('click', () => importInput.click());

    // Import CSV
    importInput.addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file) return;
      ImportExportService.importCSV(
        'productions',
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
          uniqueKey: 'id',
          updateExisting: true
        }
      );
      importInput.value = '';
    });

    // Pagination handlers
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        if (this._state.page > 1) {
          this._state.page--;
          this.render();
        }
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        const maxPage = Math.ceil(
          ProductionService.getAllProductions().length / this._state.pageSize
        );
        if (this._state.page < maxPage) {
          this._state.page++;
          this.render();
        }
      });
    }
  }
};
