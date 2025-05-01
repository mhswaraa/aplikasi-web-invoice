// /js/services/InvoiceService.js

import { StorageService } from './StorageService.js';

const ENTITY = 'invoices';

export const InvoiceService = {
  /**
   * Buat invoice baru.
   * @param {{
   *   buyerName: string,
   *   items: Array<{
   *     name: string,
   *     model?: string,
   *     color?: string,
   *     size: string,
   *     qty: number,
   *     price: number
   *   }>,
   *   taxPercent?: number,
   *   discountPercent?: number
   * }} params
   * @returns {object} invoice yang baru dibuat
   */
  createInvoice({ buyerName, items, taxPercent = 0, discountPercent = 0 }) {
    // 1) Tanggal hari ini (YYYY-MM-DD)
    const date   = new Date().toISOString().split('T')[0];
    // 2) Generate nomor invoice
    const number = this.generateInvoiceNumber();

    // 3) Clone dan normalisasi items—pastikan model & color ikut tersimpan
    const invoiceItems = (items || []).map(it => ({
      name:  it.name       || '',
      model: it.model      || '',
      color: it.color      || '',
      size:  it.size       || '',
      qty:   Number(it.qty)   || 0,
      price: Number(it.price) || 0
    }));

    // 4) Hitung subtotal
    const subtotal = invoiceItems
      .reduce((sum, it) => sum + it.qty * it.price, 0);

    // 5) Hitung tax & discount
    const taxAmount      = subtotal * (taxPercent      / 100);
    const discountAmount = subtotal * (discountPercent / 100);
    const total          = subtotal + taxAmount - discountAmount;

    // 6) Siapkan object invoice lengkap
    const invoice = {
      buyerName,
      date,
      number,
      items:             invoiceItems,
      subtotal,
      taxPercent,
      taxAmount,
      discountPercent,
      discountAmount,
      total,
      paid: false       // status paid/unpaid
    };

    // 7) Simpan ke storage dan kembalikan data hasil create
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

  /**
   * Generate nomor unik: INV-YYYYMMDD-XXX
   * XXX = urutan invoice di hari ini (001, 002, dst)
   */
  generateInvoiceNumber() {
    const all   = this.getAllInvoices() || [];
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const seq   = String(
      all.filter(inv => inv.number.includes(today)).length + 1
    ).padStart(3, '0');
    return `INV-${today}-${seq}`;
  }
};
