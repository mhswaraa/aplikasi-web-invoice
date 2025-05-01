// /js/services/OrderService.js

import { StorageService } from './StorageService.js';

const ENTITY = 'orders';

export const OrderService = {
  getAllOrders() {
    return StorageService.getAll(ENTITY);
  },

  getOrder(id) {
    return StorageService.getById(ENTITY, id);
  },

  generateOrderCode() {
    const prefix = 'ORD';
    const now = new Date();
    const ymd = now.toISOString().slice(0,10).replace(/-/g,'');
    const all = this.getAllOrders().filter(o => o.orderCode.includes(ymd));
    const seq = String(all.length + 1).padStart(3,'0');
    return `${prefix}-${ymd}-${seq}`;
  },

  saveOrder(order) {
    // Pastikan property items ada dan berbentuk array
    order.items = Array.isArray(order.items) ? order.items : [];

    if (order.id) {
      // Update existing order
      return StorageService.update(ENTITY, order);
    } else {
      // Create new order
      order.id        = '_' + Math.random().toString(36).substr(2, 9);
      order.orderCode = this.generateOrderCode();
      order.status    = 'Draft';
      order.createdAt = new Date().toISOString();
      StorageService.create(ENTITY, order);
      return order;
    }
  },

  deleteOrder(id) {
    return StorageService.delete(ENTITY, id);
  }
};
