// /js/views/InvoiceFormView.js

import { InvoiceService }    from '../services/InvoiceService.js';
import { ProductionService } from '../services/ProductionService.js';
import { OrderService }      from '../services/OrderService.js';
import { AlertService }      from '../services/AlertService.js';

export const InvoiceFormView = {
  render() {
    const app = document.getElementById('app');

    // parse productionId dari query string
    const [, query] = location.hash.split('?');
    const params    = new URLSearchParams(query);
    const prodId    = params.get('productionId');

    // default
    let buyerName   = '';
    let packageType = '';
    let modelName   = '';
    let initialItems = [{
      name:   '',
      model:  '',
      size:   '',
      color:  '',
      qty:    1,
      defect: 0,
      price:  0
    }];

    if (prodId) {
      const prod = ProductionService.getProduction(prodId);
      if (prod) {
        const ord = OrderService.getOrder(prod.orderId) || {};
        buyerName   = prod.clientName;
        packageType = ord.package || '';
        modelName   = ord.model   || '';

        initialItems = prod.items
          .map(it => ({
            name:   ord.orderCode || '',
            model:  ord.model     || '',
            size:   it.size       || '',
            color:  it.color || (ord.items || []).find(o => o.size===it.size)?.color || '',
            qty:    Math.max(0, it.qtyJadi - it.defect),
            defect: it.defect     || 0,
            price:  it.price != null
                    ? it.price
                    : (ord.items||[]).find(o=>o.size===it.size)?.price || 0
          }))
          .filter(it => it.qty > 0);
      }
    }

    // build rows
    const rowsHTML = initialItems
      .map((it, i) => this._genRow(i+1, it))
      .join('');

    app.innerHTML = `
      <div class="container mx-auto p-6 bg-white shadow-md rounded-lg">
        <div class="mb-6">
          <h2 class="text-2xl font-semibold text-gray-800">Buat Invoice</h2>
        </div>
        <form id="invoice-form" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label class="block mb-1 font-medium text-gray-700">Nama Klien</label>
              <input
                type="text"
                name="buyerName"
                value="${buyerName}"
                readonly
                required
                class="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label class="block mb-1 font-medium text-gray-700">Paket Produksi</label>
              <input
                type="text"
                name="packageType"
                value="${packageType}"
                readonly
                class="w-full px-3 py-2 border rounded"
              />
            </div>
            <div>
              <label class="block mb-1 font-medium text-gray-700">Model</label>
              <input
                type="text"
                name="modelName"
                value="${modelName}"
                readonly
                class="w-full px-3 py-2 border rounded"
              />
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="min-w-full table-auto border-collapse mb-4">
              <thead>
                <tr class="bg-gray-100">
                  <th class="px-4 py-2 text-left text-gray-600">No</th>
                  <th class="px-4 py-2 text-left text-gray-600">OrderCode</th>
                  <th class="px-4 py-2 text-left text-gray-600">Model</th>
                  <th class="px-4 py-2 text-left text-gray-600">Size</th>
                  <th class="px-4 py-2 text-left text-gray-600">Warna</th>
                  <th class="px-4 py-2 text-right text-gray-600">Qty</th>
                  <th class="px-4 py-2 text-right text-gray-600">Defect</th>
                  <th class="px-4 py-2 text-right text-gray-600">Harga</th>
                  <th class="px-4 py-2 text-center text-gray-600">Aksi</th>
                </tr>
              </thead>
              <tbody id="item-rows">
                ${rowsHTML}
              </tbody>
            </table>
          </div>

          <button
            type="button"
            id="add-row-btn"
            class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg"
          >+ Tambah Item</button>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label class="block mb-1 font-medium text-gray-700" for="taxPercent">
                Tax (%)
              </label>
              <input
                type="number"
                id="taxPercent"
                name="taxPercent"
                min="0"
                value="0"
                class="w-full px-3 py-2 border rounded text-right"
              />
            </div>
            <div>
              <label class="block mb-1 font-medium text-gray-700" for="discountPercent">
                Discount (%)
              </label>
              <input
                type="number"
                id="discountPercent"
                name="discountPercent"
                min="0"
                value="0"
                class="w-full px-3 py-2 border rounded text-right"
              />
            </div>
          </div>

          <div class="bg-gray-50 p-4 rounded-lg space-y-2 text-right">
            <div>Subtotal: <span id="sum-subtotal">0</span></div>
            <div>Tax: <span id="sum-tax">0</span></div>
            <div>Discount: <span id="sum-discount">0</span></div>
            <div class="font-semibold">Total: <span id="sum-total">0</span></div>
          </div>

          <div class="flex flex-wrap gap-4">
            <button
              type="submit"
              class="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
            >Terbitkan Invoice</button>
            <button
              type="button"
              id="to-list"
              class="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg"
            >Daftar Invoice</button>
          </div>
        </form>
      </div>
    `;

    this.afterRender();
  },

  afterRender() {
    const form      = document.getElementById('invoice-form');
    const rowsBody  = document.getElementById('item-rows');
    const addBtn    = document.getElementById('add-row-btn');
    const taxInput  = form.taxPercent;
    const discInput = form.discountPercent;
    const sumSub    = document.getElementById('sum-subtotal');
    const sumTax    = document.getElementById('sum-tax');
    const sumDisc   = document.getElementById('sum-discount');
    const sumTot    = document.getElementById('sum-total');
    let rowCount    = rowsBody.children.length;

    const recalc = () => {
      let subtotal = 0;
      rowsBody.querySelectorAll('tr').forEach(tr => {
        const q = +tr.querySelector('[name="productQty"]').value   || 0;
        const p = +tr.querySelector('[name="productPrice"]').value || 0;
        subtotal += q * p;
      });
      const tp = +taxInput.value  || 0;
      const dp = +discInput.value || 0;
      const taxAmt  = subtotal * tp/100;
      const discAmt = subtotal * dp/100;
      const total   = subtotal + taxAmt - discAmt;

      sumSub.textContent  = subtotal.toLocaleString();
      sumTax.textContent  = taxAmt.toLocaleString();
      sumDisc.textContent = discAmt.toLocaleString();
      sumTot.textContent  = total.toLocaleString();
    };

    // tambah baris
    addBtn.addEventListener('click', () => {
      rowCount++;
      rowsBody.insertAdjacentHTML('beforeend',
        this._genRow(rowCount, {
          name:'', model:'', size:'', color:'', qty:1, defect:0, price:0
        })
      );
    });

    // hapus baris
    rowsBody.addEventListener('click', e => {
      if (!e.target.classList.contains('delete-row-btn')) return;
      e.target.closest('tr').remove();
      Array.from(rowsBody.children).forEach((tr, idx) => {
        tr.dataset.index = idx + 1;
        tr.cells[0].textContent = idx + 1;
      });
      rowCount = rowsBody.children.length;
      recalc();
    });

    rowsBody.addEventListener('input', recalc);
    taxInput.addEventListener('input', recalc);
    discInput.addEventListener('input', recalc);

    form.addEventListener('submit', e => {
      e.preventDefault();
      const rows = Array.from(rowsBody.querySelectorAll('tr'));
      const items = rows.map(tr => ({
        name:   tr.querySelector('input[name="productName"]').value.trim(),
        model:  tr.querySelector('input[name="productModel"]').value.trim(),
        size:   tr.querySelector('input[name="productSize"]').value.trim(),
        color:  tr.querySelector('input[name="productColor"]').value.trim(),
        qty:    parseFloat(tr.querySelector('input[name="productQty"]').value),
        defect: parseFloat(tr.querySelector('input[name="productDefect"]').value),
        price:  parseFloat(tr.querySelector('input[name="productPrice"]').value)
      }));

      const inv = InvoiceService.createInvoice({
        buyerName:       form.buyerName.value.trim(),
        items,
        taxPercent:      parseFloat(form.taxPercent.value)      || 0,
        discountPercent: parseFloat(form.discountPercent.value) || 0
      });

      AlertService.show('Invoice berhasil diterbitkan.', 'success');
      location.hash = `#invoice-detail/${inv.id}`;
    });

    document.getElementById('to-list')
      .addEventListener('click', () => location.hash = '#invoice-list');

    recalc();
  },

  _genRow(i, it) {
    return `
      <tr class="${i % 2 === 1 ? 'bg-white' : 'bg-gray-50'}" data-index="${i}">
        <td class="px-4 py-2 text-center">${i}</td>
        <td class="px-4 py-2">
          <input
            name="productName"
            type="text"
            value="${it.name||''}"
            readonly
            required
            class="w-full px-2 py-1 border rounded"
          />
        </td>
        <td class="px-4 py-2">
          <input
            name="productModel"
            type="text"
            value="${it.model||''}"
            readonly
            class="w-full px-2 py-1 border rounded"
          />
        </td>
        <td class="px-4 py-2">
          <input
            name="productSize"
            type="text"
            value="${it.size||''}"
            readonly
            required
            class="w-full px-2 py-1 border rounded"
          />
        </td>
        <td class="px-4 py-2">
          <input
            name="productColor"
            type="text"
            value="${it.color||''}"
            readonly
            class="w-full px-2 py-1 border rounded"
          />
        </td>
        <td class="px-4 py-2">
          <input
            name="productQty"
            type="number"
            min="0"
            value="${it.qty||0}"
            required
            class="w-20 px-2 py-1 border rounded text-right"
          />
        </td>
        <td class="px-4 py-2">
          <input
            name="productDefect"
            type="number"
            value="${it.defect||0}"
            readonly
            class="w-20 px-2 py-1 border rounded text-right"
          />
        </td>
        <td class="px-4 py-2">
          <input
            name="productPrice"
            type="number"
            min="0"
            value="${it.price||0}"
            required
            class="w-24 px-2 py-1 border rounded text-right"
          />
        </td>
        <td class="px-4 py-2 text-center">
          <button
            type="button"
            class="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm delete-row-btn"
          >Hapus</button>
        </td>
      </tr>
    `;
  }
};
