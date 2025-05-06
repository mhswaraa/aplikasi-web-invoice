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
    const ord = OrderService.getOrder(orderId);
    if (!ord) return null;

    // salin setiap item termasuk color
    const items = (ord.items || []).map(it => ({
      size:     it.size,
      color:    it.color || '',
      price:    it.price,
      qtyFabric: it.qtyFabric,
      qtyJadi:   0,
      defect:    0
    }));

    const prod = {
      id:        '_' + Math.random().toString(36).substr(2,9),
      orderId,
      orderCode: ord.orderCode,
      clientName: ord.clientName,
      clientId:   ord.clientId,
      model:      ord.model,
      orderDate:  ord.orderDate,
      createdAt:  new Date().toISOString(),
      status:     'Pending',
      items
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