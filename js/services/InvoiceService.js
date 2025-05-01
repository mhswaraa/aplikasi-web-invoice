// /js/services/InvoiceService.js
import { StorageService } from './StorageService.js';

const ENTITY = 'invoices';

export const InvoiceService = {
  /**
   * Buat invoice baru.
   * @param {{ buyerName: string, items: Array<{name:string, model?:string, size:string, qty:number, price:number}>, taxPercent?:number, discountPercent?:number }} param0
   */
  createInvoice({ buyerName, items, taxPercent = 0, discountPercent = 0 }) {
    // 1) Tanggal hari ini (YYYY-MM-DD)
    const date   = new Date().toISOString().split('T')[0];
    // 2) Generate nomor invoice
    const number = this.generateInvoiceNumber();

    // 3) Clone dan normalisasi items, pastikan model ikut tercopy
    const invoiceItems = items.map(it => ({
      name:  it.name,
      model: it.model || '',    // wariskan model, fallback ke string kosong
      size:  it.size,
      qty:   it.qty,
      price: it.price
    }));

    // 4) Hitung subtotal
    const subtotal = invoiceItems
      .reduce((sum, it) => sum + (it.qty * (it.price || 0)), 0);

    // 5) Hitung tax & discount
    const taxAmount      = subtotal * (taxPercent      / 100);
    const discountAmount = subtotal * (discountPercent / 100);
    const total          = subtotal + taxAmount - discountAmount;

    // 6) Siapkan object invoice lengkap
    const invoice = {
      buyerName,
      date,
      number,
      items: invoiceItems,
      subtotal,
      taxPercent,
      taxAmount,
      discountPercent,
      discountAmount,
      total,
      paid: false          // kamu bisa gunakan ini untuk status paid/unpaid
    };

    // 7) Simpan ke storage dan kembalikan data
    return StorageService.create(ENTITY, invoice);
  },

  /** Ambil semua invoice */
  getAllInvoices() {
    return StorageService.getAll(ENTITY);
  },

  /** Ambil invoice berdasarkan ID */
  getInvoice(id) {
    return StorageService.getById(ENTITY, id);
  },

  /** Hapus invoice */
  deleteInvoice(id) {
    return StorageService.delete(ENTITY, id);
  },

  /** Buat nomor unik: INV-YYYYMMDD-xxx */
  generateInvoiceNumber() {
    const all = this.getAllInvoices();
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const seq   = String(
      all.filter(inv => inv.number.includes(today)).length + 1
    ).padStart(3, '0');
    return `INV-${today}-${seq}`;
  }
};
