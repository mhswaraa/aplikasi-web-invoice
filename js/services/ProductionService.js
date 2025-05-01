// js/services/ProductionService.js

import { StorageService } from './StorageService.js';
import { OrderService }   from './OrderService.js';

const ENTITY = 'productions';

export const ProductionService = {
  initFromOrder(orderId) {
    const order = OrderService.getOrder(orderId);
    if (!order) throw new Error(`Order ID ${orderId} tidak ditemukan`);

    // 1) Deep copy items, termasuk price dari order
    const itemsCopy = (order.items || []).map(it => ({
      size:      it.size,
      qtyFabric: it.qtyFabric,
      price:     it.price,    // <— PASTIAN field ini ada
      qtyJadi:   0,
      defect:    0
    }));

    const prod = { orderId, orderCode: order.orderCode, clientName: order.clientName,
                   items: itemsCopy, status: 'pending',
                   createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };

    return StorageService.create(ENTITY, prod);
  },

  getAllProductions() {
    return StorageService.getAll(ENTITY);
  },

  getProduction(id) {
    return StorageService.getById(ENTITY, id);
  },

  saveProduction(prod) {
    prod.updatedAt = new Date().toISOString();
    return StorageService.update(ENTITY, prod);
  },

  deleteProduction(id) {
    return StorageService.delete(ENTITY, id);
  }
};
