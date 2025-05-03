// /js/auth/LoginView.js

import { AuthService } from './AuthService.js';
import { AlertService } from '../services/AlertService.js';

export const LoginView = {
  render() {
    const app = document.getElementById('app');
    app.innerHTML = `
      <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-teal-100">
        <div
          class="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 animate-fadeInDown"
        >
          <h2 class="text-3xl font-extrabold text-teal-600 mb-6 text-center">
            Welcome Back
          </h2>
          <form id="login-form" class="space-y-4">
            <div>
              <label for="username" class="block text-gray-700 mb-1">Username</label>
              <input
                type="text"
                id="username"
                name="username"
                required
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
              />
            </div>
            <div>
              <label for="password" class="block text-gray-700 mb-1">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                required
                class="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400 transition"
              />
            </div>
            <div>
              <button
                type="submit"
                class="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 rounded-lg shadow-md transform hover:scale-105 transition"
              >
                Login
              </button>
            </div>
            <p
              id="login-error"
              class="text-red-500 text-sm mt-2 text-center hidden"
            ></p>
          </form>
        </div>
      </div>
    `;
    this.afterRender();
  },

  afterRender() {
    const form   = document.getElementById('login-form');
    const errMsg = document.getElementById('login-error');

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errMsg.classList.add('hidden');

      const username = form.username.value.trim();
      const password = form.password.value;

      try {
        await AuthService.login(username, password);
        AlertService.show('Berhasil login!', 'success');
        const dest = sessionStorage.getItem('redirectHash') || '#dashboard';
        sessionStorage.removeItem('redirectHash');
        location.hash = dest;
      } catch (err) {
        AlertService.show(err.message, 'error');
        errMsg.textContent = err.message;
        errMsg.classList.remove('hidden');
      }
    });
  }
};
