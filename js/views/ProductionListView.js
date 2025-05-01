// /js/views/ProductionListView.js
import { ProductionService } from '../services/ProductionService.js';

export const ProductionListView = {
  render() {
    const app   = document.getElementById('app');
    const prods = ProductionService.getAllProductions();

    const rows = prods.map((p, i) => {
      const totalJadi   = p.items.reduce((sum, it) => sum + (it.qtyJadi || 0), 0);
      const totalDefect = p.items.reduce((sum, it) => sum + (it.defect  || 0), 0);

      // Ambil tanggal order jika ada, format ke "DD/MM/YYYY"
      const orderDate = p.orderDate
        ? new Date(p.orderDate).toLocaleDateString('id-ID')
        : '-';

      return `
        <tr>
          <td>${i + 1}</td>
          <!-- Ganti kode order dengan tanggal order -->
          <td>${orderDate}</td>

          <!-- Tambahkan kolom Model -->
          <td>${p.model || '-'}</td>

          <td>${p.clientName}</td>
          <td>${p.status.replace('_', ' ')}</td>
          
          <!-- Tanggal produksi mulai -->
          <td>${new Date(p.createdAt).toLocaleDateString('id-ID')}</td>

          <td>${totalJadi}</td>
          <td>${totalDefect}</td>
          <td>
            <button class="btn edit-prod" data-id="${p.id}">Edit</button>
            <button class="btn delete-prod" data-id="${p.id}">Hapus</button>
          </td>
        </tr>
      `;
    }).join('');

    app.innerHTML = `
      <div class="production-list-container">
        <h2>Laporan Produksi</h2>
        <table class="item-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Tgl Order</th>
              <th>Model</th>
              <th>Klien</th>
              <th>Status</th>
              <th>Tgl Mulai</th>
              <th>Total Jadi</th>
              <th>Total Defect</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            ${rows || `
              <tr>
                <td colspan="9" style="text-align:center">Belum ada produksi.</td>
              </tr>`}
          </tbody>
        </table>
      </div>
    `;
    this.afterRender();
  },

  afterRender() {
    // Tombol Edit → ke ProductionFormView
    document.querySelectorAll('.edit-prod').forEach(btn =>
      btn.addEventListener('click', e => {
        const id = e.currentTarget.dataset.id;
        location.hash = `#production-form/${id}`;
      })
    );

    // Tombol Hapus
    document.querySelectorAll('.delete-prod').forEach(btn =>
      btn.addEventListener('click', e => {
        if (!confirm('Yakin hapus laporan produksi ini?')) return;
        ProductionService.deleteProduction(e.currentTarget.dataset.id);
        this.render();
      })
    );
  }
};
