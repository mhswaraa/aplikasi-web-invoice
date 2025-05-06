// /js/views/ProductFormView .js

import { ProductService } from '../services/ProductService.js';
import { ClientService }  from '../services/ClientService.js';
import { AlertService }   from '../services/AlertService.js';

export const ProductFormView = {
  render() {
    const app        = document.getElementById('app');
    const [ , prodId ] = location.hash.split('/');
    const prod       = prodId
      ? ProductService.getProduct(prodId)
      : null;

    // default/new
    const today = new Date().toISOString().slice(0,10);
    const data = prod || {
      productCode: ProductService.generateProductCode(),
      name: '',
      clientId: '',
      sewingCost: 0,
      fabricConsumption: 0,
      price: 0,
      vendor: '',
      updatedAt: today
    };

    // client options
    const clients = ClientService.getAllClients();
    const opts = clients.map(c =>
      `<option value="${c.id}" ${c.id===data.clientId?'selected':''}>
         ${c.name}
       </option>`
    ).join('');

    app.innerHTML = `
      <div class="max-w-2xl mx-auto mt-8 bg-white p-6 rounded-lg shadow">
        <h2 class="text-xl font-bold mb-6">
          ${prod ? 'Edit' : 'Tambah'} Produk
        </h2>
        <form id="product-form" class="space-y-4">
          <div>
            <label class="block font-medium mb-1">Kode Produk</label>
            <input type="text" name="productCode" readonly
              value="${data.productCode}"
              class="w-full bg-gray-100 border rounded px-3 py-2"/>
          </div>
          <div>
            <label class="block font-medium mb-1">Nama Produk<span class="text-red-500">*</span></label>
            <input type="text" name="name" required
              value="${data.name}"
              class="w-full border rounded px-3 py-2 focus:ring"/>
          </div>
          <div>
            <label class="block font-medium mb-1">Klien<span class="text-red-500">*</span></label>
            <select name="clientId" required
              class="w-full border rounded px-3 py-2 focus:ring">
              <option value="">-- Pilih Klien --</option>
              ${opts}
            </select>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block font-medium mb-1">Ongkos Jahit</label>
              <input type="number" name="sewingCost" min="0"
                value="${data.sewingCost}"
                class="w-full border rounded px-3 py-2 focus:ring"/>
            </div>
            <div>
              <label class="block font-medium mb-1">Konsumsi Kain (m)</label>
              <input type="number" name="fabricConsumption" min="0" step="0.1"
                value="${data.fabricConsumption}"
                class="w-full border rounded px-3 py-2 focus:ring"/>
            </div>
            <div>
              <label class="block font-medium mb-1">Harga Jual</label>
              <input type="number" name="price" min="0"
                value="${data.price}"
                class="w-full border rounded px-3 py-2 focus:ring"/>
            </div>
            <div>
              <label class="block font-medium mb-1">Vendor</label>
              <input type="text" name="vendor"
                value="${data.vendor}"
                class="w-full border rounded px-3 py-2 focus:ring"/>
            </div>
          </div>
          <div>
            <label class="block font-medium mb-1">Terakhir di­update</label>
            <input type="date" name="updatedAt"
              value="${data.updatedAt}"
              class="w-full border rounded px-3 py-2 bg-gray-100"/>
          </div>
          <div class="flex justify-end space-x-4 pt-4">
            <button type="submit"
              class="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded">
              ${prod ? 'Update' : 'Simpan'}
            </button>
            <button type="button" id="cancel-btn"
              class="bg-gray-300 hover:bg-gray-400 text-black px-6 py-2 rounded">
              Batal
            </button>
          </div>
        </form>
      </div>
    `;

    this.afterRender(prodId);
  },

  afterRender(prodId) {
    const form = document.getElementById('product-form');

    form.addEventListener('submit', e => {
      e.preventDefault();
      const f = e.target;
      const payload = {
        id: prodId || undefined,
        productCode: f.productCode.value,
        name: f.name.value.trim(),
        clientId: f.clientId.value,
        sewingCost: Number(f.sewingCost.value),
        fabricConsumption: Number(f.fabricConsumption.value),
        price: Number(f.price.value),
        vendor: f.vendor.value.trim(),
        updatedAt: f.updatedAt.value
      };
      ProductService.saveProduct(payload);
      AlertService.show(`Produk berhasil ${prodId?'diupdate':'disimpan'}.`, 'success');
      location.hash = '#product-list';
    });

    document.getElementById('cancel-btn')
      .addEventListener('click', () => location.hash = '#product-list');
  }
};
