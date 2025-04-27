// /js/views/InvoiceListView.js

import { InvoiceService } from '../services/InvoiceService.js';

export const InvoiceListView = {
  render() {
    const app = document.getElementById('app');
    const invoices = InvoiceService.getAllInvoices();

    if (invoices.length === 0) {
      app.innerHTML = `
        <div class="invoice-list-container">
          <h2>Daftar Invoice</h2>
          <p>Belum ada invoice yang dibuat.</p>
          <button id="back-to-form" class="btn">Buat Invoice Baru</button>
        </div>`;
      this.afterRender();
      return;
    }

    const rows = invoices.map(inv => {
      const totalQty = inv.items.reduce((sum, i) => sum + i.qty, 0);
      return `
        <tr>
          <td>${inv.number}</td>
          <td>${inv.date}</td>
          <td>${inv.buyerName}</td>
          <td>${totalQty}</td>
          <td>
            <button class="btn view-detail" data-id="${inv.id}">
              Lihat
            </button>
            <button class="btn delete-inv" data-id="${inv.id}">
              Hapus
            </button>
          </td>
        </tr>`;
    }).join('');

    app.innerHTML = `
      <div class="invoice-list-container">
        <h2>Daftar Invoice</h2>
        <table class="item-table">
          <thead>
            <tr>
              <th>Nomor</th>
              <th>Tanggal</th>
              <th>Buyer</th>
              <th>Total Qty</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <button id="back-to-form" class="btn">Buat Invoice Baru</button>
      </div>`;

    this.afterRender();
  },

  afterRender() {
    // Tombol “Buat Invoice Baru”
    document.getElementById('back-to-form')
      .addEventListener('click', () => {
        location.hash = '#invoice-form';
      });

    // Tombol “Lihat”
    document.querySelectorAll('.view-detail').forEach(btn => {
      btn.addEventListener('click', e => {
        location.hash = `#invoice-detail/${e.currentTarget.dataset.id}`;
      });
    });

    // ** Tombol “Hapus” **
    document.querySelectorAll('.delete-inv').forEach(btn => {
      btn.addEventListener('click', e => {
        const id = e.currentTarget.dataset.id;
        const confirmDelete = window.confirm('Yakin ingin menghapus invoice ini?');
        if (!confirmDelete) return;

        InvoiceService.deleteInvoice(id);
        // Rerender list setelah hapus
        this.render();
      });
    });
  }
};
