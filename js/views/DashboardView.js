// /js/views/DashboardView.js
import { DashboardService } from '../services/DashboardService.js';

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
            <select id="month-select" class="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400">
              ${[...Array(12).keys()]
                .map(m => `
                  <option value="${m}" ${m === new Date().getMonth() ? 'selected' : ''}>
                    ${new Date(0, m).toLocaleString('id-ID', { month: 'long' })}
                  </option>`)
                .join('')}
            </select>
          </div>
        </div>

        <!-- KPI Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-8">
          <!-- Order Bulan Ini -->
          <div class="bg-white shadow-lg rounded-xl p-5 flex flex-col">
            <div class="text-gray-600 font-medium">Order Bulan Ini</div>
            <div id="kpi-current-orders" class="text-3xl font-bold mt-2">–</div>
          </div>
          <!-- Target Order -->
          <div class="bg-white shadow-lg rounded-xl p-5 flex flex-col">
            <div class="text-gray-600 font-medium">Target Order</div>
            <div id="kpi-target-orders" class="text-3xl font-bold mt-2">–</div>
          </div>
          <!-- Growth vs Target -->
          <div class="bg-white shadow-lg rounded-xl p-5 flex flex-col">
            <div class="text-gray-600 font-medium">Growth vs Target</div>
            <div id="kpi-growth" class="text-3xl font-bold mt-2">–%</div>
          </div>
          <!-- Repeat Order -->
          <div class="bg-white shadow-lg rounded-xl p-5 flex flex-col">
            <div class="text-gray-600 font-medium">Repeat Order</div>
            <div id="kpi-repeat" class="text-3xl font-bold mt-2">–%</div>
          </div>
          <!-- Total Revenue -->
          <div class="bg-white shadow-lg rounded-xl p-5 flex flex-col">
            <div class="text-gray-600 font-medium">Total Revenue</div>
            <div id="kpi-revenue" class="text-3xl font-bold mt-2">–</div>
          </div>
          <!-- Avg Order Value -->
          <div class="bg-white shadow-lg rounded-xl p-5 flex flex-col">
            <div class="text-gray-600 font-medium">Avg Order Value</div>
            <div id="kpi-aov" class="text-3xl font-bold mt-2">–</div>
          </div>
          <!-- Outstanding Invoices -->
          <div class="bg-white shadow-lg rounded-xl p-5 flex flex-col">
            <div class="text-gray-600 font-medium">Outstanding Inv.</div>
            <div id="kpi-outstanding" class="text-3xl font-bold mt-2">–</div>
          </div>
          <!-- Operational Cost -->
          <div class="bg-white shadow-lg rounded-xl p-5 flex flex-col">
            <div class="text-gray-600 font-medium">Operational Cost</div>
            <div id="kpi-opcost" class="text-3xl font-bold mt-2">–</div>
          </div>
          <!-- Net Margin -->
          <div class="bg-white shadow-lg rounded-xl p-5 flex flex-col">
            <div class="text-gray-600 font-medium">Net Margin</div>
            <div id="kpi-netmargin" class="text-3xl font-bold mt-2">–%</div>
          </div>
          <!-- New vs Returning -->
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
        <div class="mt-12">
          <h2 class="text-2xl font-semibold text-gray-800 mb-4">Top 5 Klien</h2>
          <ul id="top-client-list" class="space-y-2"></ul>
        </div>
      </div>
    `;

    this.afterRender();
  },

  afterRender() {
    // attach filter & initialize data
    document.getElementById('month-select')
      .addEventListener('change', () => this._updateDashboard());
    this._updateDashboard();
  },

  _updateDashboard() {
    // … existing update logic unchanged …
    // (leave all JS calls to DashboardService & Chart.js)
  }
};
