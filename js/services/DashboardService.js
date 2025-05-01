// /js/services/DashboardService.js

import { OrderService } from './OrderService.js';
import { ClientService } from './ClientService.js';

export const DashboardService = {
  /** 
   * Kembalikan array [0..11] jumlah order per bulan tahun ini 
   */
  getMonthlyOrderCounts(year = new Date().getFullYear()) {
    const counts = Array(12).fill(0);
    const orders = OrderService.getAllOrders();
    orders.forEach(o => {
      const m = new Date(o.createdAt).getMonth(); // 0..11
      const y = new Date(o.createdAt).getFullYear();
      if (y === year) counts[m]++;
    });
    return counts;
  },

  /**
   * Hitung target bulan ke-i: 
   * target[i] = max(orderCounts[0..i])
   */
  getMonthlyTargets(counts) {
    const targets = [];
    let maxSoFar = 0;
    counts.forEach(c => {
      if (c > maxSoFar) maxSoFar = c;
      targets.push(maxSoFar);
    });
    return targets;
  },

  /** Growth % bulan ini vs target */
  getGrowthPercent(counts, targets) {
    return counts.map((c,i) =>
      targets[i] > 0 ? Math.round((c - targets[i]) / targets[i] * 100) : 0
    );
  },

  /** Repeat‐order ratio = order dari klien lama / total order */
  getRepeatOrderRatio() {
    const orders = OrderService.getAllOrders();
    const seen = new Set();
    let repeat = 0;
    orders.forEach(o => {
      if (seen.has(o.clientId)) repeat++;
      seen.add(o.clientId);
    });
    return orders.length ? Math.round(repeat / orders.length * 100) : 0;
  },

  /** Top 5 klien by order count */
  getTopClients(limit = 5) {
    const orders = OrderService.getAllOrders();
    const tally = {};
    orders.forEach(o => tally[o.clientId] = (tally[o.clientId]||0)+1);
    const arr = Object.entries(tally)
      .map(([cid,cnt]) => {
        const c = ClientService.getClient(cid) || { name: cid };
        return { name: c.name, count: cnt };
      })
      .sort((a,b) => b.count - a.count)
      .slice(0,limit);
    return arr;
  }
};
