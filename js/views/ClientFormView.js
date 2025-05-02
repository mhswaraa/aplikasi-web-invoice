import { ClientService } from '../services/ClientService.js';

export const ClientFormView = {
  render() {
    const app = document.getElementById('app');
    const [, id] = location.hash.split('/');
    const client = id ? ClientService.getClient(id) : {};

    app.innerHTML = `
      <div class="max-w-2xl mx-auto mt-8 bg-white p-6 rounded-lg shadow">
        <h2 class="text-xl font-bold mb-6">${id ? 'Edit' : 'Tambah'} Klien</h2>
        <form id="client-form" class="space-y-4">
          <div>
            <label for="name" class="block font-medium mb-1">Nama Klien<span class="text-red-500">*</span></label>
            <input type="text" id="name" name="name" required
              value="${client.name || ''}"
              class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>

          <div>
            <label for="email" class="block font-medium mb-1">Email</label>
            <input type="email" id="email" name="email"
              value="${client.email || ''}"
              class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>

          <div>
            <label for="phone" class="block font-medium mb-1">Telepon</label>
            <input type="text" id="phone" name="phone"
              value="${client.phone || ''}"
              class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>

          <div>
            <label for="address" class="block font-medium mb-1">Alamat</label>
            <textarea id="address" name="address" rows="3"
              class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >${client.address || ''}</textarea>
          </div>

          <div class="flex justify-between items-center pt-4">
            <button type="submit"
              class="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded shadow">
              ${id ? 'Update' : 'Simpan'}
            </button>
            <button type="button" id="back-list"
              class="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded">
              Batal
            </button>
          </div>
        </form>
      </div>
    `;

    this.afterRender(id);
  },

  afterRender(id) {
    document.getElementById('client-form')
      .addEventListener('submit', e => {
        e.preventDefault();
        const f = e.target;
        const data = {
          id: id || undefined,
          name: f.name.value.trim(),
          email: f.email.value.trim(),
          phone: f.phone.value.trim(),
          address: f.address.value.trim()
        };
        ClientService.saveClient(data);
        location.hash = '#clients';
      });

    document.getElementById('back-list')
      .addEventListener('click', () => location.hash = '#clients');
  }
};
