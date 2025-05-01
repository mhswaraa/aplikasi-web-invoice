// /js/views/ProductionFormView.js
import { ProductionService } from '../services/ProductionService.js';
import { AlertService }      from '../services/AlertService.js';

export const ProductionFormView = {
  render() {
    const app = document.getElementById('app');
    const [, prodId] = location.hash.split('/');
    const prod = ProductionService.getProduction(prodId);

    if (!prod) {
      app.innerHTML = `<p>Produksi ID \"${prodId}\" tidak ditemukan.</p>`;
      return;
    }

    // Bangun baris per item, sertakan kolom warna
    const rows = prod.items.map((it, idx) => `
      <tr data-index="${idx}">
        <td>${idx + 1}</td>
        <td>${it.size}</td>
        <td>${it.color || '-'}</td>
        <td class="text-right">${it.qtyFabric}</td>
        <td>
          <input
            type="number"
            name="qtyJadi"
            min="0"
            value="${it.qtyJadi || 0}"
            required
          />
        </td>
        <td>
          <input
            type="number"
            name="defect"
            min="0"
            value="${it.defect || 0}"
            required
          />
        </td>
      </tr>
    `).join('');

    app.innerHTML = `
      <div class="production-form-container">
        <h2>Edit Produksi – Order ${prod.orderCode}</h2>
        <form id="production-form">
          <table class="item-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Size</th>
                <th>Warna</th>
                <th>Qty Kain</th>
                <th>Qty Jadi</th>
                <th>Defect</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>

          <div class="form-group">
            <label for="status">Status Produksi</label>
            <select id="status" name="status">
              ${['pending','in_progress','done']
                .map(s => `<option value="${s}" ${prod.status === s ? 'selected' : ''}>
                              ${s.replace(/_/g,' ')}
                            </option>`)
                .join('')}
            </select>
          </div>

          <div class="form-group">
            <button type="submit" class="btn">Simpan</button>
            <button type="button" id="back-list" class="btn">Batal</button>
            ${prod.status === 'done'
              ? `<button type="button" id="to-invoice" class="btn">Buat Invoice</button>`
              : ''}
          </div>
        </form>
      </div>
    `;

    this.afterRender(prod);
  },

  afterRender(prod) {
    const form = document.getElementById('production-form');

    form.addEventListener('submit', e => {
      e.preventDefault();
      const updatedItems = Array.from(form.querySelectorAll('tbody tr')).map(tr => ({
        size:      tr.children[1].textContent,
        color:     tr.children[2].textContent,
        qtyFabric: Number(tr.children[3].textContent),
        qtyJadi:   Number(tr.querySelector('input[name="qtyJadi"]').value),
        defect:    Number(tr.querySelector('input[name="defect"]').value),
      }));
      prod.items  = updatedItems;
      prod.status = form.status.value;
      ProductionService.saveProduction(prod);

      AlertService.show('Laporan produksi tersimpan.', 'success');
      this.render();
    });

    document.getElementById('back-list')
      .addEventListener('click', () => location.hash = '#production-list');

    const btnInv = document.getElementById('to-invoice');
    if (btnInv) {
      btnInv.addEventListener('click', () => {
        location.hash = `#invoice-form?productionId=${prod.id}`;
      });
    }
  }
};
