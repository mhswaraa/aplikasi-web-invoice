// app.js

import { AuthService }        from './auth/AuthService.js';
import { LoginView }          from './auth/LoginView.js';
import { DashboardView }      from './views/DashboardView.js';
import { ClientListView }     from './views/ClientListView.js';
import { ClientFormView }     from './views/ClientFormView.js';
import { OrderListView }      from './views/OrderListView.js';
import { OrderFormView }      from './views/OrderFormView.js';
import { OrderDetailView }    from './views/OrderDetailView.js';
import { ProductionListView } from './views/ProductionListView.js';
import { ProductionFormView } from './views/ProductionFormView.js';
import { InvoiceFormView }    from './views/InvoiceFormView.js';
import { InvoiceListView }    from './views/InvoiceListView.js';
import { InvoiceDetailView }  from './views/InvoiceDetailView.js';
import { OperationalView }    from './views/OperationalView.js';
import { ProductListView }    from './views/ProductListView.js';
import { ProductFormView }    from './views/ProductFormView.js';
import { AlertService }       from './services/AlertService.js';

function bootstrap() {
  // 1) Inisialisasi user default
  if (!localStorage.getItem('users')) {
    const defaultUsers = [{ id:'user_1', username:'admin', password:'password123' }];
    localStorage.setItem('users', JSON.stringify(defaultUsers));
  }

  // 2) Parse location.hash
  //    - strip leading '#'
  //    - split off queryString
  //    - split fullRoute on '/'
  const rawHash      = location.hash.slice(1);                 // e.g. "production-form/abc123" atau "invoice-form?productionId=abc123"
  const [fullRoute, queryString] = rawHash.split('?');         // ["production-form/abc123",""] atau ["invoice-form","productionId=abc123"]
  const [routeKey, slashParam]   = fullRoute.split('/');       // ["production-form","abc123"] atau ["invoice-form",undefined]
  const route       = routeKey ? `#${routeKey}` : '#login';    // "#production-form" atau "#login"
  const param       = slashParam || queryString || null;       // "abc123" atau "productionId=abc123" atau null

  // 3) Protect routes (redirect to login jika belum auth)
  if (route !== '#login' && !AuthService.isAuthenticated()) {
    sessionStorage.setItem('redirectHash', location.hash);
    location.hash = '#login';
    return LoginView.render();
  }

  // 4) Show/hide header & sidebar
  document.body.classList.toggle('no-header', route === '#login');

  // 5) Routing
  switch (route) {
    case '#login':
      return LoginView.render();

    case '#dashboard':
      return DashboardView.render();

    case '#clients':
      return ClientListView.render();
    case '#client-form':
      return ClientFormView.render(param);

    case '#order-list':
      return OrderListView.render();
    case '#order-form':
      return OrderFormView.render(param);
    case '#order-detail':
      return OrderDetailView.render(param);

    case '#production-list':
      return ProductionListView.render();
    case '#production-form':
      return ProductionFormView.render(param);

    case '#invoice-list':
      return InvoiceListView.render();
    case '#invoice-form':
      return InvoiceFormView.render(param);
    case '#invoice-detail':
      return InvoiceDetailView.render(param);

    case '#operation':
      return OperationalView.render();

    case '#product-list':
      return ProductListView.render();
    case '#product-form':
      return ProductFormView.render(param);

    default:
      // unknown route → kirim ke login
      return LoginView.render();
  }
}

// ---------------
// Event listeners
// ---------------
window.addEventListener('DOMContentLoaded', () => {
  bootstrap();

  // Logout button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', e => {
      e.preventDefault();
      AuthService.logout();
      location.hash = '#login';
    });
  }

  // (Optional) Mobile nav-toggle
  const toggle = document.querySelector('.nav-toggle');
  const nav    = document.querySelector('.nav-links');
  if (toggle && nav) {
    toggle.addEventListener('click', () => nav.classList.toggle('show'));
  }
});

window.addEventListener('hashchange', bootstrap);
