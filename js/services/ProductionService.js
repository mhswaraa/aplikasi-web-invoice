// /js/services/ProductionService.js
import { StorageService } from './StorageService.js';
import { OrderService }   from './OrderService.js';

const ENTITY = 'productions';

export const ProductionService = {
  getAllProductions() {
    return StorageService.getAll(ENTITY);
  },

  getProduction(id) {
    return StorageService.getById(ENTITY, id);
  },

  initFromOrder(orderId) {
    // 1) Ambil data order
    const ord = OrderService.getOrder(orderId);
    if (!ord) throw new Error('Order tidak ditemukan');

    // 2) Bangun object produksi dengan warisan properti order
    const prod = {
      id: '_' + Math.random().toString(36).substr(2, 9),
      orderId: ord.id,
      orderCode: ord.orderCode,
      orderDate: ord.orderDate || ord.createdAt.slice(0,10),  // wariskan tanggal
      model: ord.model,
      clientId: ord.clientId,
      clientName: ord.clientName,
      status: 'Pending',
      createdAt: new Date().toISOString(),
      items: ord.items.map(it => ({
        size: it.size,
        qtyFabric: it.qtyFabric,
        price: it.price,
        qtyJadi: 0,
        defect: 0
      }))
    };

    StorageService.create(ENTITY, prod);
    return prod;
  },

  saveProduction(prod) {
    return StorageService.update(ENTITY, prod);
  },

  deleteProduction(id) {
    return StorageService.delete(ENTITY, id);
  }
};
