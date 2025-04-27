import { AuthService } from './auth/AuthService.js';
import { LoginView } from './auth/LoginView.js';
import { InvoiceFormView } from './views/InvoiceFormView.js';
import { InvoiceDetailView } from './views/InvoiceDetailView.js';
import { InvoiceListView }        from './views/InvoiceListView.js';    
import { PDFService } from './services/PDFService.js';
// ... import view lainnya

function bootstrap() {
  // Inisialisasi default users (pindahkan dari utils.js jika perlu)
  if (!localStorage.getItem('users')) {
    const defaultUsers = [
      { id: 'user_1', username: 'admin', password: 'password123' }
    ];
    localStorage.setItem('users', JSON.stringify(defaultUsers));
  }

  // Routing dasar
  const route = location.hash.split('/')[0] || '#login';
  if (route !== '#login' && !AuthService.isAuthenticated()) {
    location.hash = '#login';
    return LoginView.render();
  }

  switch (route) {
    case '#login':
      return LoginView.render();
    case '#invoice-form':
      return InvoiceFormView.render();
    case '#invoice-list':                  // ← route baru
      return InvoiceListView.render();
    case '#invoice-detail':
      return InvoiceDetailView.render();
    default:
      return InvoiceFormView.render();
  }
}

window.addEventListener('DOMContentLoaded', bootstrap);
window.addEventListener('hashchange', bootstrap);

// Toggle nav-links on mobile
const toggle = document.querySelector('.nav-toggle');
const nav    = document.querySelector('.nav-links');
toggle.addEventListener('click', () => {
  nav.classList.toggle('show');
});

// Logout button
document.getElementById('logout-btn')
  .addEventListener('click', e => {
    e.preventDefault();
    AuthService.logout();
    location.hash = '#login';
  });
