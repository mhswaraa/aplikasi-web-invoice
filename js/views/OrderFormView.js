// /js/views/OrderFormView.js
import { OrderService }  from '../services/OrderService.js';
import { ClientService } from '../services/ClientService.js';
import { AlertService }  from '../services/AlertService.js';

export const OrderFormView = {
  render() {
    const [, orderId] = location.hash.split('/');
    const today = new Date().toISOString().slice(0,10);
    const data = orderId
      ? OrderService.getOrder(orderId)
      : {
          clientId: '', clientCode: '', package: '', model: '',
          items: [{ size:'', color:'', qtyFabric:1, price:0 }],
          notes: '', orderDate: today
        };

    const clients = ClientService.getAllClients();
    const opts = clients.map(c =>
      `<option value="${c.id}" ${c.id===data.clientId?'selected':''}>${c.name}</option>`
    ).join('');

    const rowsHTML = (data.items || []).map((it, idx) => `
      <tr data-index="${idx+1}" class="border-b">
        <td class="px-2 py-1 text-center">${idx+1}</td>
        <td class="px-2 py-1">
          <input name="size" value="${it.size}" required
            class="w-full border rounded px-2 py-1 focus:ring focus:ring-teal-200"/>
        </td>
        <td class="px-2 py-1">
          <input name="color" value="${it.color||''}" placeholder="Warna" required
            class="w-full border rounded px-2 py-1 focus:ring focus:ring-teal-200"/>
        </td>
        <td class="px-2 py-1">
          <input name="qtyFabric" type="number" min="1" value="${it.qtyFabric}" required
            class="w-full border rounded px-2 py-1 focus:ring focus:ring-teal-200"/>
        </td>
        <td class="px-2 py-1">
          <input name="price" type="number" min="0" value="${it.price}" required
            class="w-full border rounded px-2 py-1 focus:ring focus:ring-teal-200"/>
        </td>
        <td class="px-2 py-1 text-center">
          <button type="button" class="text-red-500 hover:text-red-700 delete-row-btn">
            Hapus
          </button>
        </td>
      </tr>
    `).join('');

    document.getElementById('app').innerHTML = `
      <div class="max-w-3xl mx-auto mt-8 bg-white p-6 rounded-lg shadow">
        <h2 class="text-2xl font-semibold mb-6">${orderId?'Edit':'Tambah'} Order</h2>
        <form id="order-form" class="space-y-4">
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block font-medium mb-1">Nama Klien<span class="text-red-500">*</span></label>
              <select id="client" required
                class="w-full border rounded px-3 py-2 focus:ring focus:ring-teal-200">
                <option value="">-- Pilih Klien --</option>
                ${opts}
              </select>
            </div>
            <div>
              <label class="block font-medium mb-1">Kode Klien</label>
              <input id="clientCode" disabled value="${data.clientCode||''}"
                class="w-full border rounded px-3 py-2 bg-gray-100"/>
            </div>

            <div>
              <label class="block font-medium mb-1">Paket Produksi<span class="text-red-500">*</span></label>
              <select id="package" required
                class="w-full border rounded px-3 py-2 focus:ring focus:ring-teal-200">
                ${['Sample','Basic','Produksi','Produksi Plus']
                  .map(p=>`<option ${p===data.package?'selected':''}>${p}</option>`).join('')}
              </select>
            </div>
            <div>
              <label class="block font-medium mb-1">Model<span class="text-red-500">*</span></label>
              <input id="model" value="${data.model||''}" required
                class="w-full border rounded px-3 py-2 focus:ring focus:ring-teal-200"/>
            </div>

            <div>
              <label class="block font-medium mb-1">Tanggal Order<span class="text-red-500">*</span></label>
              <input type="date" id="orderDate" name="orderDate" value="${data.orderDate||today}" required
                class="w-full border rounded px-3 py-2 focus:ring focus:ring-teal-200"/>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full table-auto mb-4">
              <thead class="bg-teal-50">
                <tr>
                  <th class="px-2 py-2">No</th>
                  <th class="px-2 py-2">Size</th>
                  <th class="px-2 py-2">Warna</th>
                  <th class="px-2 py-2">Qty Yd</th>
                  <th class="px-2 py-2">Price/pcs</th>
                  <th class="px-2 py-2">Aksi</th>
                </tr>
              </thead>
              <tbody id="order-items">
                ${rowsHTML}
              </tbody>
            </table>
          </div>

          <div>
            <button type="button" id="add-row-btn"
              class="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded">
              + Tambah Baris
            </button>
          </div>

          <div>
            <label class="block font-medium mb-1">Deskripsi Tambahan</label>
            <textarea id="notes" name="notes" rows="3"
              class="w-full border rounded px-3 py-2 focus:ring focus:ring-teal-200"
            >${data.notes||''}</textarea>
          </div>

          <div class="flex justify-end space-x-4 pt-4">
            <button type="submit"
              class="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded">
              ${orderId?'Update':'Simpan'}
            </button>
            <button type="button" id="cancel-btn"
              class="bg-gray-300 hover:bg-gray-400 text-black px-6 py-2 rounded">
              Batal
            </button>
          </div>
        </form>
      </div>
    `;

    this.afterRender(orderId);
  },

  afterRender(orderId) {
    const form         = document.getElementById('order-form');
    const clientSelect = document.getElementById('client');
    const codeInput    = document.getElementById('clientCode');
    const tbody        = document.getElementById('order-items');
    let rowCount       = tbody.children.length;

    // update kode klien
    clientSelect.addEventListener('change', () => {
      const c = ClientService.getClient(clientSelect.value);
      codeInput.value = c ? c.clientCode : '';
    });

    // tambah baris
    document.getElementById('add-row-btn')
      .addEventListener('click', () => {
        rowCount++;
        const tr = document.createElement('tr');
        tr.dataset.index = rowCount;
        tr.classList.add('border-b');
        tr.innerHTML = `
          <td class="px-2 py-1 text-center">${rowCount}</td>
          <td class="px-2 py-1"><input name="size" required
                class="w-full border rounded px-2 py-1 focus:ring focus:ring-teal-200"/></td>
          <td class="px-2 py-1"><input name="color" required
                class="w-full border rounded px-2 py-1 focus:ring focus:ring-teal-200"/></td>
          <td class="px-2 py-1"><input name="qtyFabric" type="number" min="1" value="1" required
                class="w-full border rounded px-2 py-1 focus:ring focus:ring-teal-200"/></td>
          <td class="px-2 py-1"><input name="price" type="number" min="0" value="0" required
                class="w-full border rounded px-2 py-1 focus:ring focus:ring-teal-200"/></td>
          <td class="px-2 py-1 text-center">
            <button type="button" class="text-red-500 hover:text-red-700 delete-row-btn">
              Hapus
            </button>
          </td>`;
        tbody.appendChild(tr);
      });

    // hapus baris & alert
    tbody.addEventListener('click', e => {
      if (!e.target.classList.contains('delete-row-btn')) return;
      e.target.closest('tr').remove();
      AlertService.show('Baris berhasil dihapus.', 'success');
      // re-index
      Array.from(tbody.children).forEach((tr, idx) => {
        tr.dataset.index = idx+1;
        tr.cells[0].textContent = idx+1;
      });
      rowCount = tbody.children.length;
    });

    // submit form & alert
    form.addEventListener('submit', e => {
      e.preventDefault();
      const items = Array.from(tbody.children).map(tr => ({
        size:       tr.querySelector('input[name="size"]').value.trim(),
        color:      tr.querySelector('input[name="color"]').value.trim(),
        qtyFabric:  Number(tr.querySelector('input[name="qtyFabric"]').value),
        price:      Number(tr.querySelector('input[name="price"]').value),
      }));

      const existing = OrderService.getOrder(orderId) || {};
      const orderObj = {
        id:         orderId,
        orderCode:  existing.orderCode,
        createdAt:  existing.createdAt,
        clientId:   clientSelect.value,
        clientName: clientSelect.options[clientSelect.selectedIndex].text,
        clientCode: codeInput.value,
        package:    document.getElementById('package').value,
        model:      document.getElementById('model').value.trim(),
        orderDate:  document.getElementById('orderDate').value,
        items,
        notes:      document.getElementById('notes').value.trim(),
        status:     existing.status
      };

      OrderService.saveOrder(orderObj);
      AlertService.show(`Order ${orderObj.orderCode} berhasil disimpan.`, 'success');
      location.hash = '#order-list';
    });

    // batal
    document.getElementById('cancel-btn')
      .addEventListener('click', () => {
        AlertService.show('Pembatalan, kembali ke daftar order.', 'info');
        location.hash = '#order-list';
      });
  }
};