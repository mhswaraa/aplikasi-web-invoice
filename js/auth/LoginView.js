// /js/auth/LoginView.js

import { AuthService } from './AuthService.js';

export const LoginView = {
  render() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="login-container">
        <h2>Login</h2>
        <form id="login-form">
          <div class="form-group">
            <label for="username">Username</label>
            <input type="text" id="username" name="username" required />
          </div>
          <div class="form-group">
            <label for="password">Password</label>
            <input type="password" id="password" name="password" required />
          </div>
          <div class="form-group">
            <button type="submit">Login</button>
          </div>
          <p id="login-error" class="error-message" style="display:none;"></p>
        </form>
      </div>
    `;
    this.afterRender();
  },

  afterRender() {
    const form = document.getElementById('login-form');
    const errMsg = document.getElementById('login-error');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errMsg.style.display = 'none';

      const username = form.username.value.trim();
      const password = form.password.value;

      try {
        await AuthService.login(username, password);
        // Tampilkan alert sukses
        AlertService.show('Berhasil login!', 'success');
        // Redirect ke halaman form invoice
        location.hash = '#invoice-form';
      } catch (err) {
        // Gagal login: tampilkan pesan
        AlertService.show(err.message, 'error');
        errMsg.style.display = 'block';
      }
    });
  }
};
