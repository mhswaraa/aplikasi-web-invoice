import { AuthService } from './AuthService.js';
import { AlertService } from '../services/AlertService.js';

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
    const form   = document.getElementById('login-form');
    const errMsg = document.getElementById('login-error');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errMsg.style.display = 'none';

      const username = form.username.value.trim();
      const password = form.password.value;

      try {
        await AuthService.login(username, password);
        AlertService.show('Berhasil login!', 'success');
        // redirect ke rute semula jika ada, atau ke dashboard
        const dest = sessionStorage.getItem('redirectHash') || '#dashboard';
        sessionStorage.removeItem('redirectHash');
        location.hash = dest;
      } catch (err) {
        AlertService.show(err.message, 'error');
        errMsg.textContent = err.message;
        errMsg.style.display = 'block';
      }
    });
  }
};
