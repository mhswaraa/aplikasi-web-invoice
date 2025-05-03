// /js/views/ClientListView.js
import { ClientService } from '../services/ClientService.js';
import { AlertService }  from '../services/AlertService.js';

export const ClientListView = {
  render() {
    const app     = document.getElementById('app');
    const clients = ClientService.getAllClients();

    const rows = clients.map((c, i) => `
      <tr class="${i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}">
        <td class="px-4 py-2 text-center">${i + 1}</td>
        <td class="px-4 py-2">${c.clientCode}</td>
        <td class="px-4 py-2">${c.name}</td>
        <td class="px-4 py-2">${c.phone || '-'}</td>
        <td class="px-4 py-2">${c.email || '-'}</td>
        <td class="px-4 py-2 text-center relative">
          <!-- Toggle button -->
          <button
            class="action-toggle px-2 py-1 hover:bg-gray-200 rounded focus:outline-none"
            aria-label="Toggle actions"
            data-id="${c.id}"
          >⋮</button>
        </td>
      </tr>
    `).join('');

    app.innerHTML = `
      <div class="container mx-auto p-6 bg-white shadow-md rounded-lg relative">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-2xl font-semibold text-gray-800">Data Klien</h2>
          <button
            id="add-client"
            class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm transition"
          >+ Tambah Klien</button>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full table-auto border-collapse">
            <thead>
              <tr class="bg-gray-100">
                <th class="px-4 py-2 text-left text-gray-600">No</th>
                <th class="px-4 py-2 text-left text-gray-600">Kode Klien</th>
                <th class="px-4 py-2 text-left text-gray-600">Nama</th>
                <th class="px-4 py-2 text-left text-gray-600">Telepon</th>
                <th class="px-4 py-2 text-left text-gray-600">Email</th>
                <th class="px-4 py-2 text-center text-gray-600">Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${rows.length ? rows : `
                <tr>
                  <td colspan="6" class="px-4 py-8 text-center text-gray-500">
                    Belum ada klien.
                  </td>
                </tr>`}
            </tbody>
          </table>
        </div>

        <!-- GLOBAL dropdown container -->
        <div id="global-action-menu" class="
          fixed z-50 invisible opacity-0 scale-95 
          transform transition duration-200 origin-top-right
          bg-white border rounded shadow-lg overflow-hidden
        ">
          <button id="edit-btn"  class="block w-full text-left px-4 py-2 hover:bg-gray-100">Edit</button>
          <button id="del-btn"   class="block w-full text-left px-4 py-2 hover:bg-gray-100">Hapus</button>
        </div>
      </div>
    `;
    this.afterRender();
  },

  afterRender() {
    const menu     = document.getElementById('global-action-menu');
    const editBtn  = document.getElementById('edit-btn');
    const delBtn   = document.getElementById('del-btn');
    let currentId  = null;

    // fungsi untuk sembunyikan dropdown
    const hideMenu = () => {
      if (!menu.classList.contains('invisible')) {
        menu.classList.add('invisible','opacity-0','scale-95');
      }
    };

    // 1) Toggle dropdown show/hide
    document.querySelectorAll('.action-toggle').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();

        currentId = e.currentTarget.dataset.id;

        // hitung ulang posisi berdasarkan bounding terbaru
        const rect = e.currentTarget.getBoundingClientRect();
        const top  = rect.bottom + window.scrollY;
        let   left = rect.right - menu.offsetWidth + window.scrollX;

        // jika melebihi viewport width, geser ke kiri
        if (left + menu.offsetWidth > window.innerWidth) {
          left = window.innerWidth - menu.offsetWidth - 8;
        }

        menu.style.top  = `${top}px`;
        menu.style.left = `${Math.max(left, 8)}px`;

        // toggle animasi
        const isHidden = menu.classList.contains('invisible');
        if (isHidden) {
          menu.classList.remove('invisible','opacity-0','scale-95');
        } else {
          menu.classList.add('invisible','opacity-0','scale-95');
        }
      });
    });

    // 2) Klik luar → hide
    document.addEventListener('click', hideMenu);

    // 3) Resize window → hide
    window.addEventListener('resize', hideMenu);

    // 4) Edit & Delete actions
    editBtn.addEventListener('click', () => {
      if (!currentId) return;
      menu.classList.add('invisible','opacity-0','scale-95');
      location.hash = `#client-form/${currentId}`;
    });
    delBtn.addEventListener('click', () => {
      if (!currentId) return;
      menu.classList.add('invisible','opacity-0','scale-95');
      if (!confirm('Yakin ingin menghapus klien ini?')) return;
      ClientService.deleteClient(currentId);
      AlertService.show('Data klien berhasil dihapus.', 'success');
      this.render();
    });

    // 5) Tombol tambah
    document.getElementById('add-client')
      .addEventListener('click', () => location.hash = '#client-form');
  }
};
