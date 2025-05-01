// /js/views/InvoiceFormView.js

import { InvoiceService }    from '../services/InvoiceService.js';
import { ProductionService } from '../services/ProductionService.js';
import { OrderService }      from '../services/OrderService.js';
import { AlertService }      from '../services/AlertService.js';

export const InvoiceFormView = {
  render() {
    const app = document.getElementById('app');

    // parse produksiId dari hash, misal: #invoice-form?productionId=abc123
    const [ , query ] = location.hash.split('?');
    const params      = new URLSearchParams(query);
    const prodId      = params.get('productionId');

    // default manual (kosong)
    let buyerName    = '';
    let packageType  = '';
    let modelName    = '';
    let initialItems = [{ name:'', size:'', qty:1, defect:0, price:0 }];

    if (prodId) {
      const prod = ProductionService.getProduction(prodId);
      console.log('>> InvoiceFormView, loaded production:', prod);
      if (prod) {
        const ord = OrderService.getOrder(prod.orderId) || {};
        buyerName   = prod.clientName;
        packageType = ord.package   || '';
        modelName   = ord.model     || '';

        initialItems = prod.items
          .map(it => {
            // fallback harga: pakai it.price, kalau undefined ambil dari order.items
            let price = it.price;
            if (price == null) {
              const ordItem = (ord.items || []).find(o => o.size === it.size);
              price = ordItem ? ordItem.price : 0;
            }
            return {
              name:   ord.orderCode,
              size:   it.size,
              qty:    Math.max(0, it.qtyJadi - it.defect),
              defect: it.defect,
              price
            };
          })
          .filter(it => it.qty > 0);
      }
    }

    // bangun baris HTML
    const rowsHTML = initialItems
      .map((it, i) => this._genRow(i+1, it))
      .join('');

    app.innerHTML = `
      <div class="invoice-form-container">
        <h2>Buat Invoice</h2>
        <form id="invoice-form">
          <!-- Info Klien & Order -->
          <div class="form-group">
            <label>Nama Klien</label>
            <input type="text" name="buyerName" value="${buyerName}" readonly required />
          </div>
          <div class="form-group">
            <label>Paket Produksi</label>
            <input type="text" name="packageType" value="${packageType}" readonly />
          </div>
          <div class="form-group">
            <label>Model</label>
            <input type="text" name="modelName" value="${modelName}" readonly />
          </div>

          <!-- Tabel Item -->
          <table class="item-table">
            <thead>
              <tr>
                <th>No</th><th>Produk</th><th>Size</th>
                <th>Qty</th><th>Defect</th><th>Harga</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody id="item-rows">
              ${rowsHTML}
            </tbody>
          </table>
          <button type="button" id="add-row-btn" class="btn">+ Tambah Item</button>

          <!-- Tax & Discount -->
          <div class="form-group-inline">
            <div class="form-group-small">
              <label for="taxPercent">Tax (%)</label>
              <input type="number" id="taxPercent" name="taxPercent" min="0" value="0" />
            </div>
            <div class="form-group-small">
              <label for="discountPercent">Discount (%)</label>
              <input type="number" id="discountPercent" name="discountPercent" min="0" value="0" />
            </div>
          </div>

          <!-- Summary -->
          <div class="form-summary">
            <div>Subtotal: <span id="sum-subtotal">0</span></div>
            <div>Tax: <span id="sum-tax">0</span></div>
            <div>Discount: <span id="sum-discount">0</span></div>
            <div class="grand-total">Total: <span id="sum-total">0</span></div>
          </div>

          <!-- Actions -->
          <div class="form-group">
            <button type="submit" class="btn">Terbitkan Invoice</button>
            <button type="button" id="to-list" class="btn">Daftar Invoice</button>
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

      sumSub.textContent   = subtotal.toLocaleString();
      sumTax.textContent   = taxAmt.toLocaleString();
      sumDisc.textContent  = discAmt.toLocaleString();
      sumTot.textContent   = total.toLocaleString();
    };

    // Tambah baris
    addBtn.addEventListener('click', () => {
      rowCount++;
      rowsBody.insertAdjacentHTML('beforeend', this._genRow(rowCount, {
        name:'', size:'', qty:1, defect:0, price:0
      }));
    });

    // Hapus baris
    rowsBody.addEventListener('click', e => {
      if (e.target.classList.contains('delete-row-btn')) {
        e.target.closest('tr').remove();
        Array.from(rowsBody.children).forEach((tr, idx) => {
          tr.dataset.index = idx+1;
          tr.cells[0].textContent = idx+1;
        });
        rowCount = rowsBody.children.length;
        recalc();
      }
    });

    // Recalc on input
    rowsBody.addEventListener('input', recalc);
    taxInput.addEventListener('input', recalc);
    discInput.addEventListener('input', recalc);

    // Submit invoice
    form.addEventListener('submit', e => {
      e.preventDefault();
      const buyer = form.buyerName.value.trim();
      const items = Array.from(rowsBody.children).map(tr => ({
        name:  tr.querySelector('[name="productName"]').value.trim(),
        size:  tr.querySelector('[name="productSize"]').value.trim(),
        qty:   +tr.querySelector('[name="productQty"]').value,
        price: +tr.querySelector('[name="productPrice"]').value
      }));
      const inv = InvoiceService.createInvoice({
        buyerName:      buyer,
        items,
        taxPercent:     +taxInput.value,
        discountPercent:+discInput.value
      });
      AlertService.show('Invoice berhasil diterbitkan!', 'success');
      location.hash = `#invoice-detail/${inv.id}`;
    });

    // Kembali ke list
    document.getElementById('to-list')
      .addEventListener('click', () => location.hash = '#invoice-list');

    recalc();
  },

  _genRow(i, it) {
    return `
      <tr data-index="${i}">
        <td>${i}</td>
        <td><input name="productName"  value="${it.name||''}" readonly required /></td>
        <td><input name="productSize"  value="${it.size||''}" readonly required /></td>
        <td><input name="productQty"   type="number" min="0" value="${it.qty||0}" required /></td>
        <td><input name="productDefect" type="number" value="${it.defect||0}" readonly /></td>
        <td><input name="productPrice"  type="number" min="0" value="${it.price||0}" required /></td>
        <td><button type="button" class="delete-row-btn">Hapus</button></td>
      </tr>
    `;
  }
};
