// /js/views/InvoiceFormView.js
import { InvoiceService } from '../services/InvoiceService.js';

export const InvoiceFormView = {
  render() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="invoice-form-container">
        <h2>Buat Invoice</h2>
        <form id="invoice-form">
          <div class="form-group">
            <label for="buyerName">Nama Buyer</label>
            <input type="text" id="buyerName" name="buyerName" required />
          </div>

          <!-- Item Table -->
          <table class="item-table">
            <thead>
              <tr>
                <th>No</th><th>Produk</th><th>Size</th>
                <th>Qty</th><th>Harga</th><th>Aksi</th>
              </tr>
            </thead>
            <tbody id="item-rows">
              ${this._generateRowHTML(1)}
            </tbody>
          </table>
          <button type="button" id="add-row-btn" class="btn">+ Tambah Item</button>

          <!-- Summary Inputs -->
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

          <!-- Display Subtotal, Tax, Discount, Total -->
          <div class="form-summary">
            <div>Subtotal: <span id="sum-subtotal">0</span></div>
            <div>Tax: <span id="sum-tax">0</span></div>
            <div>Discount: <span id="sum-discount">0</span></div>
            <div class="grand-total">Total: <span id="sum-total">0</span></div>
          </div>

          <!-- Actions -->
          <button type="submit" id="submit-btn" class="btn">Terbitkan Invoice</button>
          <button id="to-list" class="btn">Daftar Invoice</button>
        </form>
      </div>
    `;
    this.afterRender();
  },

  _generateRowHTML(i) {
    return `
      <tr data-index="${i}">
        <td>${i}</td>
        <td><input type="text" name="productName" required /></td>
        <td><input type="text" name="productSize" required /></td>
        <td><input type="number" name="productQty" min="1" value="1" required /></td>
        <td><input type="number" name="productPrice" min="0" value="0" required /></td>
        <td><button type="button" class="delete-row-btn">Hapus</button></td>
      </tr>`;
  },

  afterRender() {
    const itemRows       = document.getElementById('item-rows');
    const addRowBtn      = document.getElementById('add-row-btn');
    const form           = document.getElementById('invoice-form');
    const taxInput       = form.taxPercent;
    const discInput      = form.discountPercent;
    const sumSub         = document.getElementById('sum-subtotal');
    const sumTaxElem     = document.getElementById('sum-tax');
    const sumDiscElem    = document.getElementById('sum-discount');
    const sumTotalElem   = document.getElementById('sum-total');
    let rowCount = 1;

    // Fungsi hitung summary
    const recalc = () => {
      const rows = itemRows.querySelectorAll('tr');
      let subtotal = 0;
      rows.forEach(tr => {
        const q = parseFloat(tr.querySelector('input[name="productQty"]').value) || 0;
        const p = parseFloat(tr.querySelector('input[name="productPrice"]').value) || 0;
        subtotal += q * p;
      });
      const taxPercent  = parseFloat(taxInput.value)  || 0;
      const discPercent = parseFloat(discInput.value) || 0;
      const taxAmt      = subtotal * (taxPercent / 100);
      const discAmt     = subtotal * (discPercent / 100);
      const total       = subtotal + taxAmt - discAmt;

      sumSub.textContent      = subtotal.toLocaleString();
      sumTaxElem.textContent  = taxAmt.toLocaleString();
      sumDiscElem.textContent = discAmt.toLocaleString();
      sumTotalElem.textContent= total.toLocaleString();
    };

    // Tambah baris
    addRowBtn.addEventListener('click', () => {
      rowCount++;
      itemRows.insertAdjacentHTML('beforeend', this._generateRowHTML(rowCount));
    });

    // Hapus baris
    itemRows.addEventListener('click', e => {
      if (e.target.classList.contains('delete-row-btn')) {
        e.target.closest('tr').remove();
      }
      recalc();
    });

    // Recalc on input change
    itemRows.addEventListener('input', recalc);
    taxInput.addEventListener('input', recalc);
    discInput.addEventListener('input', recalc);

    // Submit form
    form.addEventListener('submit', e => {
      e.preventDefault();
      const buyerName = form.buyerName.value.trim();
      const items = Array.from(itemRows.querySelectorAll('tr')).map(tr => ({
        name: tr.querySelector('input[name="productName"]').value.trim(),
        size: tr.querySelector('input[name="productSize"]').value.trim(),
        qty: parseFloat(tr.querySelector('input[name="productQty"]').value),
        price: parseFloat(tr.querySelector('input[name="productPrice"]').value)
      }));
      const inv = InvoiceService.createInvoice({
        buyerName,
        items,
        taxPercent: parseFloat(taxInput.value)  || 0,
        discountPercent: parseFloat(discInput.value) || 0
      });
      location.hash = `#invoice-detail/${inv.id}`;
    });

    // Link ke list
    document.getElementById('to-list')
      .addEventListener('click', () => location.hash = '#invoice-list');

    // Inisialisasi tampilan summary
    recalc();
  }
};
