// /js/views/ClientListView.js
import { ClientService } from '../services/ClientService.js';

export const ClientListView = {
  render() {
    const app     = document.getElementById('app');
    const clients = ClientService.getAllClients();

    // Bangun baris tabel
    const rows = clients.map((c, i) => `
      <tr class="even:bg-gray-50">
        <td class="px-4 py-2 text-center">${i + 1}</td>
        <td class="px-4 py-2">${c.clientCode}</td>
        <td class="px-4 py-2">${c.name}</td>
        <td class="px-4 py-2">${c.phone || '-'}</td>
        <td class="px-4 py-2">${c.email || '-'}</td>
        <td class="px-4 py-2 text-center space-x-2">
          <button
            class="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm"
            data-id="${c.id}"
            title="Edit Klien"
            aria-label="Edit Klien"
          >
            Edit
          </button>
          <button
            class="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
            data-id="${c.id}"
            title="Hapus Klien"
            aria-label="Hapus Klien"
          >
            Hapus
          </button>
        </td>
      </tr>
    `).join('');

    // Jika kosong
    const emptyRow = `
      <tr>
        <td colspan="6" class="px-4 py-8 text-center text-gray-500">
          Belum ada klien.
        </td>
      </tr>
    `;

    app.innerHTML = `
      <div class="container mx-auto p-6 bg-white shadow-md rounded-lg">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-2xl font-semibold text-gray-800">Data Klien</h2>
          <button
            id="add-client"
            class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm"
          >
            + Tambah Klien
          </button>
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
              ${rows.length ? rows : emptyRow}
            </tbody>
          </table>
        </div>
      </div>
    `;

    this.afterRender();
  },

  afterRender() {
    // Tambah Klien
    document
      .getElementById('add-client')
      .addEventListener('click', () => location.hash = '#client-form');

    // Edit Klien
    document.querySelectorAll('button[title="Edit Klien"]').forEach(btn =>
      btn.addEventListener('click', e => {
        const id = e.currentTarget.dataset.id;
        location.hash = `#client-form/${id}`;
      })
    );

    // Hapus Klien
    document.querySelectorAll('button[title="Hapus Klien"]').forEach(btn =>
      btn.addEventListener('click', e => {
        const id = e.currentTarget.dataset.id;
        if (!confirm('Yakin ingin menghapus klien ini?')) return;
        ClientService.deleteClient(id);
        // Refresh ulang tampilan
        this.render();
      })
    );
  }
};
