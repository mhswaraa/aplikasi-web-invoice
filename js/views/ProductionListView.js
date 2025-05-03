import { ProductionService } from '../services/ProductionService.js';
import { AlertService }      from '../services/AlertService.js';

export const ProductionListView = {
  render() {
    const app   = document.getElementById('app');
    const prods = ProductionService.getAllProductions();

    // Build table rows
    const rows = prods.map((p, i) => {
      const totalJadi   = p.items.reduce((sum, it) => sum + (it.qtyJadi || 0), 0);
      const totalDefect = p.items.reduce((sum, it) => sum + (it.defect  || 0), 0);
      const orderDate = p.orderDate
        ? new Date(p.orderDate).toLocaleDateString('id-ID')
        : '-';
      const colors = Array.isArray(p.items)
        ? [...new Set(p.items.map(it => it.color || '-'))].join(', ')
        : '-';

      return `
        <tr class="${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}">
          <td class="px-4 py-2 text-center">${i+1}</td>
          <td class="px-4 py-2">${orderDate}</td>
          <td class="px-4 py-2">${p.model || '-'}</td>
          <td class="px-4 py-2">${colors}</td>
          <td class="px-4 py-2">${p.clientName}</td>
          <td class="px-4 py-2">${p.status.replace('_',' ')}</td>
          <td class="px-4 py-2">${new Date(p.createdAt).toLocaleDateString('id-ID')}</td>
          <td class="px-4 py-2 text-right">${totalJadi}</td>
          <td class="px-4 py-2 text-right">${totalDefect}</td>
          <td class="px-4 py-2 relative">
            <button
              class="action-toggle px-2 py-1 hover:bg-gray-200 rounded focus:outline-none"
              aria-label="Toggle actions"
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

    app.innerHTML = `
      <div class="container mx-auto p-6 bg-white shadow-md rounded-lg relative">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-2xl font-semibold text-gray-800">Laporan Produksi</h2>
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

        <!-- GLOBAL action menu -->
        <div id="prod-action-menu" class="
          fixed z-50 invisible opacity-0 scale-95
          transform transition duration-200 origin-top-right
          bg-white border rounded shadow-lg
        ">
          <button id="menu-edit"   class="block w-full text-left px-4 py-2 hover:bg-gray-100">Edit</button>
          <button id="menu-delete" class="block w-full text-left px-4 py-2 hover:bg-gray-100">Hapus</button>
        </div>
      </div>
    `;

    this.afterRender();
  },

  afterRender() {
    const menu      = document.getElementById('prod-action-menu');
    const btnEdit   = document.getElementById('menu-edit');
    const btnDelete = document.getElementById('menu-delete');
    let   currentId;

    const hideMenu = () =>
      menu.classList.add('invisible','opacity-0','scale-95');

    // Toggle dropdown
    document.querySelectorAll('.action-toggle').forEach(btn =>
      btn.addEventListener('click', e => {
        e.stopPropagation();
        currentId = e.currentTarget.dataset.id;

        // position the menu under button
        const rect = e.currentTarget.getBoundingClientRect();
        const top  = rect.bottom + window.scrollY;
        let   left = rect.right - menu.offsetWidth + window.scrollX;
        if (left + menu.offsetWidth > window.innerWidth) {
          left = window.innerWidth - menu.offsetWidth - 8;
        }
        menu.style.top  = `${top}px`;
        menu.style.left = `${Math.max(left,8)}px`;

        // show/hide
        menu.classList.toggle('invisible');
        menu.classList.toggle('opacity-0');
        menu.classList.toggle('scale-95');
      })
    );

    document.addEventListener('click', hideMenu);
    window.addEventListener('resize', hideMenu);

    // Action handlers
    btnEdit.addEventListener('click', () => {
      hideMenu();
      location.hash = `#production-form/${currentId}`;
    });
    btnDelete.addEventListener('click', () => {
      hideMenu();
      if (!confirm('Yakin hapus laporan produksi ini?')) return;
      ProductionService.deleteProduction(currentId);
      AlertService.show('Laporan produksi berhasil dihapus.', 'success');
      this.render();
    });
  }
}; 
