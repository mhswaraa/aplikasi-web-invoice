import { OrderService }  from '../services/OrderService.js';
import { ClientService } from '../services/ClientService.js';

export const OrderFormView = {
  render() {
    const app = document.getElementById('app');
    const [ , , id ] = location.hash.split('/');
    const data = id
      ? OrderService.getOrder(id)
      : { clientId: '', clientCode: '', package: '', model: '', items: [], notes: '' };

    const clients = ClientService.getAllClients();
    const opts = clients.map(c => `
      <option value="${c.id}" ${c.id === data.clientId ? 'selected' : ''}>
        ${c.name}
      </option>`).join('');

    const initialItems = (Array.isArray(data.items) && data.items.length)
      ? data.items
      : [{ size: '', qtyFabric: 1, price: 0 }];

    const rowsHTML = initialItems.map((it, idx) => `
      <tr data-index="${idx+1}">
        <td>${idx+1}</td>
        <td><input name="size" value="${it.size||''}" required /></td>
        <td><input name="qtyFabric" type="number" min="1" value="${it.qtyFabric}" required /></td>
        <td><input name="price" type="number" min="0" value="${it.price}" required /></td>
        <td><button type="button" class="delete-row-btn">Hapus</button></td>
      </tr>
    `).join('');

    app.innerHTML = `
      <div class="order-form-container">
        <h2>${id ? 'Edit' : 'Tambah'} Order</h2>
        <form id="order-form">
          <div class="form-group">
            <label for="client">Nama Klien</label>
            <select id="client" name="client" required>
              <option value="">-- Pilih Klien --</option>
              ${opts}
            </select>
          </div>
          <div class="form-group">
            <label>Kode Klien</label>
            <input type="text" id="clientCode" disabled value="${data.clientCode||''}" />
          </div>
          <div class="form-group">
            <label for="package">Paket Produksi</label>
            <select id="package" name="package" required>
              ${['Sample','Basic','Produksi','Produksi Plus']
                .map(p => `<option ${p===data.package?'selected':''}>${p}</option>`)
                .join('')}
            </select>
          </div>
          <div class="form-group">
            <label for="model">Model</label>
            <input type="text" id="model" name="model" value="${data.model||''}" required />
          </div>

          <table class="item-table" id="order-items">
            <thead>
              <tr>
                <th>No</th>
                <th>Size</th>
                <th>Qty Kain</th>
                <th>Harga/pcs</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHTML}
            </tbody>
          </table>
          <button type="button" id="add-row-btn" class="btn">+ Tambah Baris</button>

          <div class="form-group">
            <label for="notes">Deskripsi Tambahan</label>
            <textarea id="notes" name="notes">${data.notes||''}</textarea>
          </div>
          <div class="form-group">
            <button type="submit" class="btn">${id ? 'Update' : 'Simpan'}</button>
            <button type="button" id="back-list" class="btn">Batal</button>
          </div>
        </form>
      </div>
    `;

    this.afterRender(data);
  },

  afterRender(data) {
    const form        = document.getElementById('order-form');
    const clientSelect= form.client;
    const codeInput   = document.getElementById('clientCode');
    const tbody       = document.querySelector('#order-items tbody');
    let rowCount      = tbody.children.length;

    clientSelect.addEventListener('change', () => {
      const c = ClientService.getClient(clientSelect.value);
      codeInput.value = c ? c.clientCode : '';
    });

    document.getElementById('add-row-btn')
      .addEventListener('click', () => {
        rowCount++;
        const tr = document.createElement('tr');
        tr.dataset.index = rowCount;
        tr.innerHTML = `
          <td>${rowCount}</td>
          <td><input name="size" required /></td>
          <td><input name="qtyFabric" type="number" min="1" value="1" required /></td>
          <td><input name="price" type="number" min="0" value="0" required /></td>
          <td><button type="button" class="delete-row-btn">Hapus</button></td>
        `;
        tbody.appendChild(tr);
      });

    tbody.addEventListener('click', e => {
      if (e.target.classList.contains('delete-row-btn')) {
        e.target.closest('tr').remove();
        Array.from(tbody.children).forEach((tr, idx) => {
          tr.dataset.index = idx+1;
          tr.children[0].textContent = idx+1;
        });
        rowCount = tbody.children.length;
      }
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      const items = Array.from(tbody.children).map(tr => ({
        size:      tr.querySelector('input[name="size"]').value.trim(),
        qtyFabric: Number(tr.querySelector('input[name="qtyFabric"]').value),
        price:     Number(tr.querySelector('input[name="price"]').value)
      }));

      const o = {
        id:         data.id,
        clientId:   form.client.value,
        clientName: clientSelect.options[clientSelect.selectedIndex].text,
        clientCode: codeInput.value,
        package:    form.package.value,
        model:      form.model.value.trim(),
        items,
        notes:      form.notes.value.trim()
      };

      OrderService.saveOrder(o);
      location.hash = '#order-list';
    });

    document.getElementById('back-list')
      .addEventListener('click', () => location.hash = '#order-list');
  }
};
