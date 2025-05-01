// /js/views/OperationalView.js
import { OperationService } from '../services/OperationService.js';
import { InvoiceService }   from '../services/InvoiceService.js';
import { AlertService }     from '../services/AlertService.js';

export const OperationalView = {
  render() {
    const app = document.getElementById('app');
    const [, invoiceId] = location.hash.split('/');
    const inv = InvoiceService.getInvoice(invoiceId);
    if (!inv) {
      app.innerHTML = `<p>Invoice "${invoiceId}" tidak ditemukan.</p>`;
      return;
    }

    // Ambil list operasi
    const ops = OperationService.getByInvoice(invoiceId);
    const rows = ops.map((op,i) => `
      <tr>
        <td>${i+1}</td>
        <td>${op.itemName}</td>
        <td class="text-right">${op.qty}</td>
        <td class="text-right">${op.unitCost.toLocaleString()}</td>
        <td class="text-right">${op.totalCost.toLocaleString()}</td>
        <td>
          <button class="btn delete-op" data-id="${op.id}">Hapus</button>
        </td>
      </tr>
    `).join('');

    app.innerHTML = `
      <div class="operation-container">
        <h2>Operasional Invoice ${inv.number}</h2>

        <!-- Form tambah item -->
        <form id="op-form">
          <div class="form-group">
            <label for="itemName">Nama Item Operasional</label>
            <input type="text" id="itemName" name="itemName" required />
          </div>
          <div class="form-group-inline">
            <div class="form-group-small">
              <label for="qty">Qty</label>
              <input type="number" id="qty" name="qty" min="1" value="1" required />
            </div>
            <div class="form-group-small">
              <label for="unitCost">Unit Cost</label>
              <input type="number" id="unitCost" name="unitCost" min="0" value="0" required />
            </div>
          </div>
          <button type="submit" class="btn">Tambah Operasional</button>
          <button type="button" id="back-inv" class="btn">Kembali ke Invoice</button>
        </form>

        <!-- Tabel list operasi -->
        <table class="item-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Item</th>
              <th>Qty</th>
              <th>Unit Cost</th>
              <th>Total Cost</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${rows || `
              <tr>
                <td colspan="6" style="text-align:center">Belum ada operasional.</td>
              </tr>`}
          </tbody>
        </table>

        <!-- Ringkasan Keuangan -->
        <div class="form-summary" style="margin-top:1.5rem;">
          <div>Total Operasional: <strong id="total-ops">0</strong></div>
          <div>Sisa dari Invoice: <strong id="remaining-income">0</strong></div>
        </div>
      </div>
    `;

    this.afterRender(invoiceId);
  },

  afterRender(invoiceId) {
    // Submit form
    document.getElementById('op-form')
      .addEventListener('submit', e => {
        e.preventDefault();
        const f = e.target;
        OperationService.addOperation({
          invoiceId,
          itemName: f.itemName.value.trim(),
          qty:      Number(f.qty.value),
          unitCost: Number(f.unitCost.value)
        });
        AlertService.show('Item operasional ditambahkan', 'success');
        this.render();
      });

    // Hapus operasional
    document.querySelectorAll('.delete-op').forEach(btn =>
      btn.addEventListener('click', e => {
        const id = e.currentTarget.dataset.id;
        if (!confirm('Hapus item operasional ini?')) return;
        OperationService.deleteOperation(id);
        this.render();
      })
    );

    // Kembali ke invoice
    document.getElementById('back-inv')
      .addEventListener('click', () => {
        location.hash = `#invoice-detail/${invoiceId}`;
      });

    // Hitung dan tampilkan ringkasan keuangan
    const inv  = InvoiceService.getInvoice(invoiceId);
    const ops  = OperationService.getByInvoice(invoiceId);
    const sumOps = ops.reduce((s, op) => s + op.totalCost, 0);
    const remaining = (inv.total || 0) - sumOps;

    document.getElementById('total-ops').textContent       = sumOps.toLocaleString();
    document.getElementById('remaining-income').textContent = remaining.toLocaleString();
  }
};
