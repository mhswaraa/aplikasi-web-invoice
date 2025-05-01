import { OrderService }     from './OrderService.js';
import { InvoiceService }   from './InvoiceService.js';
import { OperationService } from './OperationService.js';
import { ClientService }    from './ClientService.js';

export const DashboardService = {
  /** Order per bulan tahun ini */
  getMonthlyOrderCounts(year = new Date().getFullYear()) {
    const counts = Array(12).fill(0);
    OrderService.getAllOrders().forEach(o => {
      const d = new Date(o.createdAt);
      if (d.getFullYear() === year) {
        counts[d.getMonth()]++;
      }
    });
    return counts;
  },

  /** Target = max kumulatif sampai bulan i */
  getMonthlyTargets(counts) {
    const targets = [];
    let maxSoFar = 0;
    counts.forEach(c => {
      if (c > maxSoFar) maxSoFar = c;
      targets.push(maxSoFar);
    });
    return targets;
  },

  /** Growth % vs target */
  getGrowthPercent(counts, targets) {
    return counts.map((c, i) =>
      targets[i] > 0 ? Math.round((c - targets[i]) / targets[i] * 100) : 0
    );
  },

  /** Repeat‐order ratio (%) */
  getRepeatOrderRatio() {
    const orders = OrderService.getAllOrders();
    const seen = new Set();
    let repeat = 0;
    orders.forEach(o => {
      if (seen.has(o.clientId)) repeat++;
      seen.add(o.clientId);
    });
    return orders.length ? Math.round((repeat / orders.length) * 100) : 0;
  },

  /** Top N klien by order count */
  getTopClients(limit = 5) {
    const tally = {};
    OrderService.getAllOrders().forEach(o => {
      tally[o.clientId] = (tally[o.clientId] || 0) + 1;
    });
    return Object.entries(tally)
      .map(([cid, cnt]) => {
        const c = ClientService.getClient(cid) || { name: cid };
        return { name: c.name, count: cnt };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  },

  /** 1. Total Revenue bulan X */
  getMonthlyRevenue(month, year = new Date().getFullYear()) {
    return InvoiceService.getAllInvoices()
      .filter(inv => {
        const d = new Date(inv.date);
        return d.getMonth() === month && d.getFullYear() === year;
      })
      .reduce((sum, inv) => sum + (inv.total || 0), 0);
  },

  /** 2. Average Order Value = revenue ÷ jumlah order */
  getAverageOrderValue(month, year = new Date().getFullYear()) {
    const revenue = this.getMonthlyRevenue(month, year);
    const count = OrderService.getAllOrders()
      .filter(o => {
        const d = new Date(o.createdAt);
        return d.getMonth() === month && d.getFullYear() === year;
      }).length;
    return count ? revenue / count : 0;
  },

  /** 3. Outstanding Invoices: count & total unpaid */
  getOutstandingInvoices(month, year = new Date().getFullYear()) {
    const invs = InvoiceService.getAllInvoices()
      .filter(inv => {
        const d = new Date(inv.date);
        return d.getMonth() === month && d.getFullYear() === year;
      });
    const unpaid = invs.filter(inv => !inv.paid);
    return {
      count: unpaid.length,
      total: unpaid.reduce((sum, inv) => sum + (inv.total || 0), 0)
    };
  },

  /** 4. Operational Cost bulan X */
  getMonthlyOperationalCost(month, year = new Date().getFullYear()) {
    return OperationService
      .getAllOperations()    // ← pakai method ini
      .filter(op => {
        const inv = InvoiceService.getInvoice(op.invoiceId);
        if (!inv) return false;
        const d = new Date(inv.date);
        return d.getMonth() === month && d.getFullYear() === year;
      })
      .reduce((sum, op) => sum + (op.totalCost||0), 0);
  },

  /** 5. Net Margin % = (rev – opCost) / rev *100 */
  getNetMarginPercent(month, year = new Date().getFullYear()) {
    const rev  = this.getMonthlyRevenue(month, year);
    const cost = this.getMonthlyOperationalCost(month, year);
    return rev ? ((rev - cost) / rev * 100) : 0;
  },

  /** 6. New vs Returning ratio (%) */
  getNewReturningRatio(month, year = new Date().getFullYear()) {
    const orders = OrderService.getAllOrders()
      .filter(o => {
        const d = new Date(o.createdAt);
        return d.getMonth() === month && d.getFullYear() === year;
      });
    const seen = new Set();
    let newCount = 0, retCount = 0;
    orders.forEach(o => {
      if (seen.has(o.clientId)) retCount++;
      else { newCount++; seen.add(o.clientId); }
    });
    const total = orders.length;
    return {
      newPct: total ? Math.round((newCount / total) * 100) : 0,
      retPct: total ? Math.round((retCount / total) * 100) : 0
    };
  },
   /** Revenue per bulan */
   getMonthlyRevenues(year = new Date().getFullYear()) {
    const revs = Array(12).fill(0);
    InvoiceService.getAllInvoices().forEach(inv => {
      const d = new Date(inv.date);
      if (d.getFullYear() === year) revs[d.getMonth()] += inv.total || 0;
    });
    return revs;
  },

  /** Cost (operasional) per bulan */
  getMonthlyCosts(year = new Date().getFullYear()) {
    const costs = Array(12).fill(0);
    // ambil semua operasi
    OperationService.getAllOperations().forEach(op => {
      const inv = InvoiceService.getInvoice(op.invoiceId);
      if (!inv) return;
      const d = new Date(inv.date);
      if (d.getFullYear() === year) costs[d.getMonth()] += op.totalCost || 0;
    });
    return costs;
  },

  /** Jumlah Orders per bulan (sudah ada: getMonthlyOrderCounts) */
  /** Jumlah Invoices per bulan */
  getMonthlyInvoiceCounts(year = new Date().getFullYear()) {
    const counts = Array(12).fill(0);
    InvoiceService.getAllInvoices().forEach(inv => {
      const d = new Date(inv.date);
      if (d.getFullYear() === year) counts[d.getMonth()]++;
    });
    return counts;
  },

  /** Jumlah Payments per bulan (diasumsikan paid invoices) */
  getMonthlyPaymentCounts(year = new Date().getFullYear()) {
    const counts = Array(12).fill(0);
    InvoiceService.getAllInvoices()
      .filter(inv => inv.paid)
      .forEach(inv => {
        const d = new Date(inv.datePaid || inv.date);
        if (d.getFullYear() === year) counts[d.getMonth()]++;
      });
    return counts;
  }
};
