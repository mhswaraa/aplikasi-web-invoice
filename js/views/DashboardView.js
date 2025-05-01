// /js/views/DashboardView.js

import { DashboardService } from '../services/DashboardService.js';
import Chart from 'chart.js/auto';

export const DashboardView = {
  render() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="dashboard-container">
        <h2>Dashboard</h2>
        <div class="kpi-cards">
          <div class="card">
            <h3>Total Order Bulan Ini</h3>
            <div id="kpi-current-orders" class="kpi-value">0</div>
          </div>
          <div class="card">
            <h3>Target Order Bulan Ini</h3>
            <div id="kpi-target-orders" class="kpi-value">0</div>
          </div>
          <div class="card">
            <h3>Growth vs Target</h3>
            <div id="kpi-growth" class="kpi-value">0%</div>
          </div>
          <div class="card">
            <h3>Repeat Order Ratio</h3>
            <div id="kpi-repeat" class="kpi-value">0%</div>
          </div>
        </div>

        <div class="chart-container">
          <canvas id="order-chart"></canvas>
        </div>

        <div class="top-clients">
          <h3>Top 5 Klien</h3>
          <ul id="top-client-list"></ul>
        </div>
      </div>
    `;
    this.afterRender();
  },

  afterRender() {
    // Ambil data
    const counts  = DashboardService.getMonthlyOrderCounts();
    const targets = DashboardService.getMonthlyTargets(counts);
    const growths = DashboardService.getGrowthPercent(counts, targets);
    const repeat  = DashboardService.getRepeatOrderRatio();
    const top5    = DashboardService.getTopClients();

    // KPI saat ini (bulan terakhir)
    const idx      = new Date().getMonth();
    document.getElementById('kpi-current-orders').textContent = counts[idx];
    document.getElementById('kpi-target-orders').textContent  = targets[idx];
    document.getElementById('kpi-growth').textContent         = (growths[idx] >= 0 ? '+' : '') + growths[idx] + '%';
    document.getElementById('kpi-repeat').textContent         = repeat + '%';

    // Chart order vs target
    const ctx = document.getElementById('order-chart').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
        datasets: [
          {
            label: 'Order',
            data: counts,
            borderColor: '#2a9d8f',
            tension: 0.3
          },
          {
            label: 'Target',
            data: targets,
            borderColor: '#e76f51',
            tension: 0.3
          }
        ]
      },
      options: {
        scales: {
          y: { beginAtZero: true, ticks: { precision:0 } }
        }
      }
    });

    // Top clients list
    const ul = document.getElementById('top-client-list');
    top5.forEach(tc => {
      const li = document.createElement('li');
      li.textContent = `${tc.name} — ${tc.count} order`;
      ul.appendChild(li);
    });
  }
};
