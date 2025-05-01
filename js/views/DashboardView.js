import { DashboardService } from '../services/DashboardService.js';

export const DashboardView = {
  render() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="dashboard-container">
        <header class="dashboard-header">
          <h1>Dashboard</h1>
          <div class="date-filter">
            <label for="month-select">Bulan:</label>
            <select id="month-select">
              ${[...Array(12)].map((_, m) => `
                <option value="${m}" ${m === new Date().getMonth() ? 'selected':''}>
                  ${new Date(0, m).toLocaleString('id-ID', { month: 'long' })}
                </option>`).join('')}
            </select>
          </div>
        </header>

        <section class="kpi-cards">
          <!-- Kartu KPI Dasar -->
          <div class="card"><div class="card-body">
            <div class="card-title">Order Bulan Ini</div>
            <div id="kpi-current-orders" class="card-value">0</div>
          </div></div>
          <div class="card"><div class="card-body">
            <div class="card-title">Target Order</div>
            <div id="kpi-target-orders" class="card-value">0</div>
          </div></div>
          <div class="card"><div class="card-body">
            <div class="card-title">Growth vs Target</div>
            <div id="kpi-growth" class="card-value">0%</div>
          </div></div>
          <div class="card"><div class="card-body">
            <div class="card-title">Repeat Order</div>
            <div id="kpi-repeat" class="card-value">0%</div>
          </div></div>

          <!-- Kartu KPI Ekstra -->
          <div class="card"><div class="card-body">
            <div class="card-title">Total Revenue</div>
            <div id="kpi-revenue" class="card-value">0</div>
          </div></div>
          <div class="card"><div class="card-body">
            <div class="card-title">Avg Order Value</div>
            <div id="kpi-aov" class="card-value">0</div>
          </div></div>
          <div class="card"><div class="card-body">
            <div class="card-title">Outstanding Inv.</div>
            <div id="kpi-outstanding" class="card-value">0 (0)</div>
          </div></div>
          <div class="card"><div class="card-body">
            <div class="card-title">Operational Cost</div>
            <div id="kpi-opcost" class="card-value">0</div>
          </div></div>
          <div class="card"><div class="card-body">
            <div class="card-title">Net Margin</div>
            <div id="kpi-netmargin" class="card-value">0%</div>
          </div></div>
          <div class="card"><div class="card-body">
            <div class="card-title">New vs Returning</div>
            <div id="kpi-newret" class="card-value">0% / 0%</div>
          </div></div>
        </section>

        <!-- Chart 1: Order vs Target -->
        <section class="chart-section">
          <h2>Order vs Target</h2>
          <canvas id="order-chart"></canvas>
        </section>

        <!-- Chart 2: Revenue vs Operational Cost -->
        <section class="chart-section">
          <h2>Revenue vs Operational Cost</h2>
          <canvas id="rev-cost-chart"></canvas>
        </section>

        <!-- Chart 3: Orders / Invoices / Payments -->
        <section class="chart-section">
          <h2>Orders / Invoices / Payments</h2>
          <canvas id="oino-chart"></canvas>
        </section>

        <!-- Top Clients -->
        <section class="top-clients">
          <h2>Top 5 Klien</h2>
          <ul id="top-client-list" class="client-list"></ul>
        </section>
      </div>
    `;
    this.afterRender();
  },

  afterRender() {
    const month = Number(document.getElementById('month-select').value);
    const year  = new Date().getFullYear();

    // 1) KPI: Order, Target, Growth, Repeat
    const allCounts = DashboardService.getMonthlyOrderCounts(year);
    const targets   = DashboardService.getMonthlyTargets(allCounts);
    const growths   = DashboardService.getGrowthPercent(allCounts, targets);
    const repeat    = DashboardService.getRepeatOrderRatio();

    document.getElementById('kpi-current-orders').textContent = allCounts[month];
    document.getElementById('kpi-target-orders').textContent  = targets[month];
    const grw = growths[month];
    document.getElementById('kpi-growth').textContent = (grw >= 0 ? '+' : '') + grw + '%';
    document.getElementById('kpi-repeat').textContent = repeat + '%';

    // 2) KPI: Revenue & AOV
    const rev = DashboardService.getMonthlyRevenues(year)[month];
    const aov = DashboardService.getAverageOrderValue(month, year);
    document.getElementById('kpi-revenue').textContent = rev.toLocaleString();
    document.getElementById('kpi-aov').textContent     = Math.round(aov).toLocaleString();

    // 3) KPI: Outstanding Invoices
    const out = DashboardService.getOutstandingInvoices(month, year);
    document.getElementById('kpi-outstanding').textContent =
      `${out.count} (${out.total.toLocaleString()})`;

    // 4) KPI: Operational Cost & Net Margin
    const opCost = DashboardService.getMonthlyCosts(year)[month];
    const nmPct  = DashboardService.getNetMarginPercent(month, year);
    document.getElementById('kpi-opcost').textContent    = opCost.toLocaleString();
    document.getElementById('kpi-netmargin').textContent = `${Math.round(nmPct)}%`;

    // 5) KPI: New vs Returning
    const { newPct, retPct } = DashboardService.getNewReturningRatio(month, year);
    document.getElementById('kpi-newret').textContent = `${newPct}% / ${retPct}%`;

    // Array bulan untuk label chart
    const months = [...Array(12).keys()].map(m =>
      new Date(0, m).toLocaleString('id-ID', { month: 'short' })
    );

    // Chart 1: Order vs Target
    const ctx1 = document.getElementById('order-chart').getContext('2d');
    if (this._chart1) this._chart1.destroy();
    this._chart1 = new window.Chart(ctx1, {
      type: 'line',
      data: {
        labels: months.slice(0, month + 1),
        datasets: [
          { label: 'Order',  data: allCounts.slice(0, month + 1), borderColor: '#2a9d8f', tension: 0.3 },
          { label: 'Target', data: targets.slice(0, month + 1),  borderColor: '#e76f51', tension: 0.3 }
        ]
      },
      options: { scales: { y: { beginAtZero: true } } }
    });

    // Chart 2: Revenue vs Cost
    const revs  = DashboardService.getMonthlyRevenues(year);
    const costs = DashboardService.getMonthlyCosts(year);
    const ctx2  = document.getElementById('rev-cost-chart').getContext('2d');
    if (this._chart2) this._chart2.destroy();
    this._chart2 = new window.Chart(ctx2, {
      type: 'bar',
      data: {
        labels: months,
        datasets: [
          { label: 'Revenue',  data: revs,  backgroundColor: '#2a9d8f' },
          { label: 'Op. Cost', data: costs, backgroundColor: '#e76f51' }
        ]
      },
      options: { scales: { y: { beginAtZero: true } } }
    });

    // Chart 3: Orders / Invoices / Payments
    const invoices = DashboardService.getMonthlyInvoiceCounts(year);
    const payments = DashboardService.getMonthlyPaymentCounts(year);
    const ctx3     = document.getElementById('oino-chart').getContext('2d');
    if (this._chart3) this._chart3.destroy();
    this._chart3 = new window.Chart(ctx3, {
      type: 'line',
      data: {
        labels: months,
        datasets: [
          { label: 'Orders',   data: allCounts, borderColor: '#264653', fill: false },
          { label: 'Invoices', data: invoices,  borderColor: '#2a9d8f', fill: false },
          { label: 'Payments', data: payments,  borderColor: '#e9c46a', fill: false }
        ]
      },
      options: { scales: { y: { beginAtZero: true } } }
    });

    // Top Clients
    const ul = document.getElementById('top-client-list');
    ul.innerHTML = '';
    DashboardService.getTopClients().forEach(tc => {
      const li = document.createElement('li');
      li.textContent = `${tc.name} — ${tc.count} order`;
      ul.appendChild(li);
    });

    // Re-render on change
    document.getElementById('month-select')
      .addEventListener('change', () => this.render());
  }
};
