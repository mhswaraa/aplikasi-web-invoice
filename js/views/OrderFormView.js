// /js/views/OrderFormView.js
import { OrderService }  from '../services/OrderService.js';
import { ClientService } from '../services/ClientService.js';

export const OrderFormView = {
  render() {
    // 1) Ambil ID dengan benar
    const [ , orderId ] = location.hash.split('/');
    // 2) Jika ada ID, load data existing, kalau tidak pakai template kosong
    const data = orderId
      ? OrderService.getOrder(orderId)
      : { clientId:'', clientCode:'', package:'', model:'', items:[{size:'',qtyFabric:1,price:0}], notes:'' };

    // 3) Build HTML
    const clients = ClientService.getAllClients();
    const opts = clients.map(c =>
      `<option value="${c.id}" ${c.id===data.clientId?'selected':''}>${c.name}</option>`
    ).join('');

    const rowsHTML = (data.items || []).map((it, idx) => `
      <tr data-index="${idx+1}">
        <td>${idx+1}</td>
        <td><input name="size" value="${it.size}" required /></td>
        <td><input name="qtyFabric" type="number" min="1" value="${it.qtyFabric}" required /></td>
        <td><input name="price" type="number" min="0" value="${it.price}" required /></td>
        <td><button type="button" class="delete-row-btn">Hapus</button></td>
      </tr>
    `).join('');

    document.getElementById('app').innerHTML = `
      <div class="order-form-container">
        <h2>${orderId?'Edit':'Tambah'} Order</h2>
        <form id="order-form">
          <div class="form-group">
            <label>Nama Klien</label>
            <select id="client" required>
              <option value="">-- Pilih Klien --</option>${opts}
            </select>
          </div>
          <div class="form-group">
            <label>Kode Klien</label>
            <input id="clientCode" disabled value="${data.clientCode||''}" />
          </div>
          <div class="form-group">
            <label>Paket Produksi</label>
            <select id="package" required>
              ${['Sample','Basic','Produksi','Produksi Plus']
                 .map(p=>`<option ${p===data.package?'selected':''}>${p}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Model</label>
            <input id="model" value="${data.model||''}" required />
          </div>
          <table class="item-table">
            <thead>
              <tr><th>No</th><th>Size</th><th>Qty</th><th>Price/pcs</th><th>Aksi</th></tr>
            </thead>
            <tbody id="order-items">${rowsHTML}</tbody>
          </table>
          <button type="button" id="add-row-btn" class="btn">+ Tambah Baris</button>
          <div class="form-group">
            <label>Deskripsi Tambahan</label>
            <textarea id="notes">${data.notes||''}</textarea>
          </div>
          <div class="form-group">
            <button class="btn">${orderId?'Update':'Simpan'}</button>
            <button type="button" id="cancel-btn" class="btn">Batal</button>
          </div>
        </form>
      </div>`;

    this.afterRender(orderId);
  },

  afterRender(orderId) {
    const form         = document.getElementById('order-form');
    const clientSelect = document.getElementById('client');
    const codeInput    = document.getElementById('clientCode');
    const tbody        = document.getElementById('order-items');
    let rowCount       = tbody.children.length;

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
          <td><input name="size" required/></td>
          <td><input name="qtyFabric" type="number" min="1" value="1" required/></td>
          <td><input name="price" type="number" min="0" value="0" required/></td>
          <td><button type="button" class="delete-row-btn">Hapus</button></td>`;
        tbody.appendChild(tr);
      });

    tbody.addEventListener('click', e => {
      if (!e.target.classList.contains('delete-row-btn')) return;
      e.target.closest('tr').remove();
      Array.from(tbody.children).forEach((tr, idx) => {
        tr.dataset.index = idx+1;
        tr.children[0].textContent = idx+1;
      });
      rowCount = tbody.children.length;
    });

    form.addEventListener('submit', e => {
      e.preventDefault();
      const items = Array.from(tbody.children).map(tr => ({
        size: tr.querySelector('input[name="size"]').value.trim(),
        qtyFabric: Number(tr.querySelector('input[name="qtyFabric"]').value),
        price: Number(tr.querySelector('input[name="price"]').value)
      }));
      const orderObj = {
        id: orderId,
        clientId: clientSelect.value,
        clientName: clientSelect.options[clientSelect.selectedIndex].text,
        clientCode: codeInput.value,
        package: document.getElementById('package').value,
        model: document.getElementById('model').value.trim(),
        items,
        notes: document.getElementById('notes').value.trim(),
        status: orderId
          ? OrderService.getOrder(orderId).status
          : 'Draft'
      };
      OrderService.saveOrder(orderObj);
      location.hash = '#order-list';
    });

    document.getElementById('cancel-btn')
      .addEventListener('click', () => location.hash = '#order-list');
  }
};
