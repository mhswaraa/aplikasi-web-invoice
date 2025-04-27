// /js/services/InvoiceService.js
import { StorageService } from './StorageService.js';

export const InvoiceService = {
  createInvoice({ buyerName, items, taxPercent = 0, discountPercent = 0 }) {
    const date = new Date().toISOString().split('T')[0];
    const number = this.generateInvoiceNumber();
    // Hitung subtotal
    const subtotal = items.reduce((sum, it) => sum + (it.qty * (it.price || 0)), 0);
    // Hitung tax & discount
    const taxAmount      = subtotal * (taxPercent / 100);
    const discountAmount = subtotal * (discountPercent / 100);
    const total          = subtotal + taxAmount - discountAmount;

    const invoice = {
      buyerName,
      items,
      date,
      number,
      subtotal,
      taxPercent,
      taxAmount,
      discountPercent,
      discountAmount,
      total
    };

    return StorageService.create('invoices', invoice);
  },

  getAllInvoices() {
    return StorageService.getAll('invoices');
  },

  getInvoice(id) {
    return StorageService.getById('invoices', id);
  },

  generateInvoiceNumber() {
    const invoices = this.getAllInvoices();
    const today = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const seq = String(invoices.filter(inv => inv.number.includes(today)).length + 1).padStart(3, '0');
    return `INV-${today}-${seq}`;
  },

  deleteInvoice(id) {
    return StorageService.delete('invoices', id);
  }
};
