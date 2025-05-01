// /js/views/ClientListView.js
import { ClientService } from '../services/ClientService.js';

export const ClientListView = {
  render() {
    const app = document.getElementById('app');
    const clients = ClientService.getAllClients();

    const rows = clients.map((c, i) => `
      <tr>
        <td>${i+1}</td>
        <td>${c.clientCode}</td>
        <td>${c.name}</td>
        <td>${c.phone || '-'}</td>
        <td>${c.email || '-'}</td>
        <td>
          <button class="btn edit-client" data-id="${c.id}">Edit</button>
          <button class="btn delete-client" data-id="${c.id}">Hapus</button>
        </td>
      </tr>
    `).join('');

    app.innerHTML = `
      <div class="client-list-container">
        <h2>Data Klien</h2>
        <button id="add-client" class="btn">Tambah Klien</button>
        <table class="item-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Kode Klien</th>
              <th>Nama</th>
              <th>Telepon</th>
              <th>Email</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${rows || `<tr><td colspan="6" style="text-align:center">Belum ada klien.</td></tr>`}
          </tbody>
        </table>
      </div>
    `;
    this.afterRender();
  },

  afterRender() {
    document.getElementById('add-client')
      .addEventListener('click', () => location.hash = '#client-form');

    document.querySelectorAll('.edit-client').forEach(btn =>
      btn.addEventListener('click', e => {
        const id = e.currentTarget.dataset.id;
        location.hash = `#client-form/${id}`;
      })
    );

    document.querySelectorAll('.delete-client').forEach(btn =>
      btn.addEventListener('click', e => {
        const id = e.currentTarget.dataset.id;
        if (!confirm('Yakin ingin menghapus klien ini?')) return;
        ClientService.deleteClient(id);
        this.render();
      })
    );
  }
};
