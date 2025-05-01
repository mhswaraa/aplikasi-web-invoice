import { StorageService } from './StorageService.js';

const ENTITY = 'operations';

export const OperationService = {
  /** Ambil semua operasi untuk sebuah invoice */
  getByInvoice(invoiceId) {
    return StorageService
      .getAll(ENTITY)
      .filter(op => op.invoiceId === invoiceId);
  },

  /** Buat entry operasi baru */
  addOperation({ invoiceId, itemName, qty, unitCost }) {
    const op = {
      invoiceId,
      itemName,
      qty,
      unitCost,
      totalCost: qty * unitCost,
      id: undefined  // generate oleh StorageService
    };
    return StorageService.create(ENTITY, op);
  },

  /** Hapus entry operasi */
  deleteOperation(id) {
    return StorageService.delete(ENTITY, id);
  }
};
