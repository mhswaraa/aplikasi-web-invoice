// /js/views/DashboardView.js

import { DashboardService }    from '../services/DashboardService.js';
import { OrderService }        from '../services/OrderService.js';
import { InvoiceService }      from '../services/InvoiceService.js';
import { ClientService }       from '../services/ClientService.js';
import { ProductionService }   from '../services/ProductionService.js';

export const DashboardView = {
  render() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="min-h-screen bg-gray-50 p-6">
        <!-- Header & Filter -->
        <div class="flex flex-col md:flex-row items-center justify-between mb-6">
          <h1 class="text-3xl font-bold text-gray-800">Dashboard</h1>
          <div class="mt-4 md:mt-0">
            <label for="month-select" class="mr-2 text-gray-700">Filter Bulan:</label>
            <select id="month-select"
                    class="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400">
              ${[...Array(12).keys()].map(m => `
                <option value="${m}" ${m === new Date().getMonth() ? 'selected' : ''}>
                  ${new Date(0, m).toLocaleString('id-ID', { month: 'long' })}
                </option>`).join('')}
            </select>
          </div>
        </div>

        <!-- KPI Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
          <div class="bg-white shadow-lg rounded-xl p-5 flex flex-col">
            <div class="text-gray-600 font-medium">Order Bulan Ini</div>
            <div id="kpi-current-orders" class="text-3xl font-bold mt-2">–</div>
          </div>
          <div class="bg-white shadow-lg rounded-xl p-5 flex flex-col">
            <div class="text-gray-600 font-medium">Target Order</div>
            <div id="kpi-target-orders" class="text-3xl font-bold mt-2">–</div>
          </div>
          <div class="bg-white shadow-lg rounded-xl p-5 flex flex-col">
            <div class="text-gray-600 font-medium">Growth vs Target</div>
            <div id="kpi-growth" class="text-3xl font-bold mt-2">–%</div>
          </div>
          <div class="bg-white shadow-lg rounded-xl p-5 flex flex-col">
            <div class="text-gray-600 font-medium">Repeat Order</div>
            <div id="kpi-repeat" class="text-3xl font-bold mt-2">–%</div>
          </div>
          <div class="bg-white shadow-lg rounded-xl p-5 flex flex-col">
            <div class="text-gray-600 font-medium">Total Revenue</div>
            <div id="kpi-revenue" class="text-3xl font-bold mt-2">–</div>
          </div>
          <div class="bg-white shadow-lg rounded-xl p-5 flex flex-col">
            <div class="text-gray-600 font-medium">Avg Order Value</div>
            <div id="kpi-aov" class="text-3xl font-bold mt-2">–</div>
          </div>
          <div class="bg-white shadow-lg rounded-xl p-5 flex flex-col">
            <div class="text-gray-600 font-medium">Outstanding Inv.</div>
            <div id="kpi-outstanding" class="text-3xl font-bold mt-2">–</div>
          </div>
          <div class="bg-white shadow-lg rounded-xl p-5 flex flex-col">
            <div class="text-gray-600 font-medium">Operational Cost</div>
            <div id="kpi-opcost" class="text-3xl font-bold mt-2">–</div>
          </div>
          <div class="bg-white shadow-lg rounded-xl p-5 flex flex-col">
            <div class="text-gray-600 font-medium">Net Margin</div>
            <div id="kpi-netmargin" class="text-3xl font-bold mt-2">–%</div>
          </div>
          <div class="bg-white shadow-lg rounded-xl p-5 flex flex-col">
            <div class="text-gray-600 font-medium">New vs Returning</div>
            <div id="kpi-newret" class="text-3xl font-bold mt-2">– / –</div>
          </div>
        </div>

        <!-- Charts -->
        <div class="space-y-12">
          <div class="bg-white shadow-lg rounded-xl p-6">
            <h2 class="text-xl font-semibold mb-4">Order vs Target</h2>
            <canvas id="order-chart"></canvas>
          </div>
          <div class="bg-white shadow-lg rounded-xl p-6">
            <h2 class="text-xl font-semibold mb-4">Revenue vs Operational Cost</h2>
            <canvas id="rev-cost-chart"></canvas>
          </div>
          <div class="bg-white shadow-lg rounded-xl p-6">
            <h2 class="text-xl font-semibold mb-4">Orders / Invoices / Payments</h2>
            <canvas id="oino-chart"></canvas>
          </div>
        </div>

        <!-- Top Clients -->
        <div class="mt-12 bg-white p-6 rounded-lg shadow-md">
          <h2 class="text-2xl font-semibold text-gray-800 mb-4">Top 5 Klien</h2>
          <div id="top-client-list"></div>
        </div>
      </div>
    `;
    this.afterRender();
  },

  afterRender() {
    document.getElementById('month-select')
      .addEventListener('change', () => this._updateDashboard());
    this._updateDashboard();
  },

  _updateDashboard() {
    const month = +document.getElementById('month-select').value;
    const year  = new Date().getFullYear();

    // === KPI ===
    const orderCounts = DashboardService.getMonthlyOrderCounts(year);
    const targets     = DashboardService.getMonthlyTargets(orderCounts);
    const growth      = DashboardService.getGrowthPercent(orderCounts, targets);
    const repeatRatio = DashboardService.getRepeatOrderRatio();
    const revenue     = DashboardService.getMonthlyRevenue(month, year);
    const avgOrderVal = DashboardService.getAverageOrderValue(month, year);
    const outstanding = DashboardService.getOutstandingInvoices(month, year);
    const opCost      = DashboardService.getMonthlyOperationalCost(month, year);
    const netMargin   = DashboardService.getNetMarginPercent(month, year);
    const nrRatio     = DashboardService.getNewReturningRatio(month, year);

    document.getElementById('kpi-current-orders').textContent = orderCounts[month] || 0;
    document.getElementById('kpi-target-orders').textContent  = targets[month]   || 0;
    document.getElementById('kpi-growth').textContent         = `${growth[month] || 0}%`;
    document.getElementById('kpi-repeat').textContent         = `${repeatRatio}%`;
    document.getElementById('kpi-revenue').textContent        = revenue.toLocaleString('id-ID');
    document.getElementById('kpi-aov').textContent            = avgOrderVal.toLocaleString('id-ID');
    document.getElementById('kpi-outstanding').textContent    = `${outstanding.count} / ${outstanding.total.toLocaleString('id-ID')}`;
    document.getElementById('kpi-opcost').textContent         = opCost.toLocaleString('id-ID');
    document.getElementById('kpi-netmargin').textContent      = `${Math.round(netMargin)}%`;
    document.getElementById('kpi-newret').textContent         = `${nrRatio.newPct}% / ${nrRatio.retPct}%`;

    // === Charts ===
    const labels = [...Array(12).keys()].map(m =>
      new Date(0, m).toLocaleString('id-ID', { month: 'short' })
    );

    // Chart 1
    const ctx1 = document.getElementById('order-chart').getContext('2d');
    if (this._chart1) this._chart1.destroy();
    this._chart1 = new Chart(ctx1, {
      type: 'line',
      data: { labels, datasets: [
        { label: 'Order', data: orderCounts, fill: false },
        { label: 'Target', data: targets, fill: false }
      ] }
    });

    // Chart 2
    const revs  = DashboardService.getMonthlyRevenues(year);
    const costs = DashboardService.getMonthlyCosts(year);
    const ctx2  = document.getElementById('rev-cost-chart').getContext('2d');
    if (this._chart2) this._chart2.destroy();
    this._chart2 = new Chart(ctx2, {
      type: 'bar',
      data: { labels, datasets: [
        { label: 'Revenue', data: revs },
        { label: 'Cost',    data: costs }
      ] }
    });

    // Chart 3
    const invCounts = DashboardService.getMonthlyInvoiceCounts(year);
    const payCounts = DashboardService.getMonthlyPaymentCounts(year);
    const ctx3      = document.getElementById('oino-chart').getContext('2d');
    if (this._chart3) this._chart3.destroy();
    this._chart3 = new Chart(ctx3, {
      type: 'line',
      data: { labels, datasets: [
        { label: 'Orders',   data: orderCounts },
        { label: 'Invoices', data: invCounts },
        { label: 'Payments', data: payCounts }
      ] }
    });

    // === Top 5 Klien by Total Unit Jadi & Total Revenue ===
    const clients      = ClientService.getAllClients();
    const productions  = ProductionService.getAllProductions();
    const orders       = OrderService.getAllOrders();
    const invoices     = InvoiceService.getAllInvoices();

    const dataByClient = clients.map(c => {
      const totalJadi = productions
        .filter(p => p.clientId === c.id)
        .reduce((sum, p) => sum + p.items.reduce((s, it) => s + (it.qtyJadi||0), 0), 0);

      const totalRev = orders
        .filter(o => o.clientId === c.id)
        .reduce((sum, o) => {
          const inv = invoices.find(i => i.buyerName === c.name && i.total);
          return sum + (inv?.total || 0);
        }, 0);

      return { name: c.name, totalJadi, totalRev };
    });

    // Urutkan & ambil top 5
    dataByClient.sort((a,b) => {
      if (b.totalJadi !== a.totalJadi) return b.totalJadi - a.totalJadi;
      return b.totalRev  - a.totalRev;
    });
    const top5 = dataByClient.slice(0,5);

    // Render table
    const tableHTML = `
      <table class="min-w-full table-auto border-collapse">
        <thead>
          <tr class="bg-gray-100">
            <th class="px-4 py-2 text-left">#</th>
            <th class="px-4 py-2 text-left">Nama Klien</th>
            <th class="px-4 py-2 text-right">Total Unit Jadi</th>
            <th class="px-4 py-2 text-right">Total Revenue</th>
          </tr>
        </thead>
        <tbody>
          ${top5.map((c, i) => `
            <tr class="${i%2===0?'bg-white':'bg-gray-50'}">
              <td class="px-4 py-2">${i+1}</td>
              <td class="px-4 py-2">${c.name}</td>
              <td class="px-4 py-2 text-right">${c.totalJadi}</td>
              <td class="px-4 py-2 text-right">${c.totalRev.toLocaleString('id-ID')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>`;

    document.getElementById('top-client-list').innerHTML = tableHTML;
  }
};
