// /js/App.js

import { AuthService }       from './auth/AuthService.js';
import { LoginView }         from './auth/LoginView.js';
import { InvoiceFormView }   from './views/InvoiceFormView.js';
import { InvoiceListView }   from './views/InvoiceListView.js';
import { InvoiceDetailView } from './views/InvoiceDetailView.js';
import { AlertService } from './services/AlertService.js';
import { PDFService }        from './services/PDFService.js';

function bootstrap() {
  // 1) Inisialisasi default user
  if (!localStorage.getItem('users')) {
    const defaultUsers = [
      { id: 'user_1', username: 'admin', password: 'password123' }
    ];
    localStorage.setItem('users', JSON.stringify(defaultUsers));
  }

  // 2) Tentukan route dari location.hash
  const hash  = location.hash || '#login';
  const route = hash.split('/')[0];

  // 3) Proteksi route selain login
  if (route !== '#login' && !AuthService.isAuthenticated()) {
    location.hash = '#login';
    return LoginView.render();
  }

  // 4) Tambahkan class no-header pada body jika di halaman login
  if (route === '#login') {
    document.body.classList.add('no-header');
  } else {
    document.body.classList.remove('no-header');
  }

  // 5) Routing ke view yang sesuai
  switch (route) {
    case '#login':
      LoginView.render();
      break;
    case '#invoice-form':
      InvoiceFormView.render();
      break;
    case '#invoice-list':
      InvoiceListView.render();
      break;
    case '#invoice-detail':
      InvoiceDetailView.render();
      break;
    default:
      LoginView.render();
  }
}

// 6) Pasang bootstrap saat DOM siap dan saat hash berubah
window.addEventListener('DOMContentLoaded', () => {
  bootstrap();

  // Toggle nav-links on mobile
  const toggle = document.querySelector('.nav-toggle');
  const nav    = document.querySelector('.nav-links');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('show');
    });
  }

  // Logout button
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      AuthService.logout();
      location.hash = '#login';
    });
  }
});

window.addEventListener('hashchange', bootstrap);
