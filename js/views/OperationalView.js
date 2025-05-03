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
      app.innerHTML = `
        <div class="container mx-auto p-6">
          <p class="text-red-600">Invoice "${invoiceId}" tidak ditemukan.</p>
        </div>
      `;
      return;
    }

    // Ambil data operasional
    const ops = OperationService.getByInvoice(invoiceId);
    const rowsHTML = ops.map((op, i) => `
      <tr class="${i % 2 === 0 ? 'bg-gray-50' : ''}">
        <td class="px-4 py-2 text-center">${i + 1}</td>
        <td class="px-4 py-2">${op.itemName}</td>
        <td class="px-4 py-2 text-right">${op.qty}</td>
        <td class="px-4 py-2 text-right">${op.unitCost.toLocaleString()}</td>
        <td class="px-4 py-2 text-right">${op.totalCost.toLocaleString()}</td>
        <td class="px-4 py-2 text-center">
          <button
            class="px-2 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-sm"
            data-id="${op.id}"
            title="Hapus Operasional"
          >
            Hapus
          </button>
        </td>
      </tr>
    `).join('');

    const emptyRow = `
      <tr>
        <td colspan="6" class="px-4 py-8 text-center text-gray-500">
          Belum ada operasional.
        </td>
      </tr>
    `;

    app.innerHTML = `
      <div class="container mx-auto p-6 bg-white shadow rounded-lg">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-2xl font-semibold text-gray-800">
            Operasional Invoice ${inv.number}
          </h2>
          <button
            id="back-inv"
            class="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm"
          >
            ← Kembali ke Invoice
          </button>
        </div>

        <!-- Form Tambah Item -->
        <form id="op-form" class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div class="md:col-span-1">
            <label for="itemName" class="block text-gray-700 mb-1">Nama Item</label>
            <input
              type="text" id="itemName" name="itemName"
              class="w-full border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div class="md:col-span-1">
            <label for="qty" class="block text-gray-700 mb-1">Qty</label>
            <input
              type="number" id="qty" name="qty" min="1" value="1"
              class="w-full border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div class="md:col-span-1">
            <label for="unitCost" class="block text-gray-700 mb-1">Unit Cost</label>
            <input
              type="number" id="unitCost" name="unitCost" min="0" value="0"
              class="w-full border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div class="md:col-span-3 flex space-x-2 mt-2">
            <button
              type="submit"
              class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm"
            >
              + Tambah Operasional
            </button>
          </div>
        </form>

        <!-- Tabel Operasional -->
        <div class="overflow-x-auto mb-6">
          <table class="min-w-full table-auto border-collapse">
            <thead>
              <tr class="bg-gray-100">
                <th class="px-4 py-2 text-left text-gray-600">No</th>
                <th class="px-4 py-2 text-left text-gray-600">Item</th>
                <th class="px-4 py-2 text-right text-gray-600">Qty</th>
                <th class="px-4 py-2 text-right text-gray-600">Unit Cost</th>
                <th class="px-4 py-2 text-right text-gray-600">Total Cost</th>
                <th class="px-4 py-2 text-center text-gray-600">Aksi</th>
              </tr>
            </thead>
            <tbody>
              ${ops.length ? rowsHTML : emptyRow}
            </tbody>
          </table>
        </div>

        <!-- Ringkasan Keuangan -->
        <div class="bg-gray-50 p-4 rounded-lg flex justify-end space-x-8">
          <div>
            <div class="text-gray-700">Total Operasional</div>
            <div id="total-ops" class="text-xl font-semibold text-right">0</div>
          </div>
          <div>
            <div class="text-gray-700">Sisa dari Invoice</div>
            <div id="remaining-income" class="text-xl font-semibold text-right">0</div>
          </div>
        </div>
      </div>
    `;

    this.afterRender(invoiceId);
  },

  afterRender(invoiceId) {
    // Submit form
    document.getElementById('op-form').addEventListener('submit', e => {
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
    document.querySelectorAll('button[title="Hapus Operasional"]').forEach(btn =>
      btn.addEventListener('click', e => {
        const id = e.currentTarget.dataset.id;
        if (!confirm('Hapus item operasional ini?')) return;
        OperationService.deleteOperation(id);
        this.render();
      })
    );

    // Kembali ke invoice
    document.getElementById('back-inv').addEventListener('click', () => {
      location.hash = `#invoice-detail/${invoiceId}`;
    });

    // Hitung ringkasan
    const inv  = InvoiceService.getInvoice(invoiceId);
    const ops  = OperationService.getByInvoice(invoiceId);
    const sumOps = ops.reduce((s, op) => s + op.totalCost, 0);
    const remaining = (inv.total || 0) - sumOps;

    document.getElementById('total-ops').textContent        = sumOps.toLocaleString();
    document.getElementById('remaining-income').textContent = remaining.toLocaleString();
  }
};
