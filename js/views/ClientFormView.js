// /js/views/ClientFormView.js
import { ClientService } from '../services/ClientService.js';

export const ClientFormView = {
  render() {
    const app = document.getElementById('app');
    const [ , , id ] = location.hash.split('/');
    const client = id ? ClientService.getClient(id) : {};

    app.innerHTML = `
      <div class="client-form-container">
        <h2>${id ? 'Edit' : 'Tambah'} Klien</h2>
        <form id="client-form">
          <div class="form-group">
            <label for="name">Nama Klien</label>
            <input type="text" id="name" name="name" value="${client.name||''}" required />
          </div>
          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" name="email" value="${client.email||''}" />
          </div>
          <div class="form-group">
            <label for="phone">Telepon</label>
            <input type="text" id="phone" name="phone" value="${client.phone||''}" />
          </div>
          <div class="form-group">
            <label for="address">Alamat</label>
            <textarea id="address" name="address">${client.address||''}</textarea>
          </div>
          <div class="form-group">
            <button type="submit" class="btn">${id ? 'Update' : 'Simpan'}</button>
            <button type="button" id="back-list" class="btn">Batal</button>
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
          address: f.address.value.trim(),
        //   terms: Number(f.terms.value) || 0
        };
        ClientService.saveClient(data);
        location.hash = '#clients';
      });

    document.getElementById('back-list')
      .addEventListener('click', () => location.hash = '#clients');
  }
};
