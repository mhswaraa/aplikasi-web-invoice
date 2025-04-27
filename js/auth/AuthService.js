// /js/auth/AuthService.js

export const AuthService = {
  login(username, password) {
    return new Promise((resolve, reject) => {
      const users = JSON.parse(localStorage.getItem('users')) || [];
      const user = users.find(u => u.username === username && u.password === password);
      if (user) {
        // Simpan session
        sessionStorage.setItem('currentUserId', user.id);
        resolve(user);
      } else {
        reject(new Error('Username atau password salah'));
      }
    });
  },

  logout() {
    sessionStorage.removeItem('currentUserId');
  },

  isAuthenticated() {
    return !!sessionStorage.getItem('currentUserId');
  },

  getCurrentUser() {
    const id = sessionStorage.getItem('currentUserId');
    if (!id) return null;
    const users = JSON.parse(localStorage.getItem('users')) || [];
    return users.find(u => u.id === id) || null;
  }
};
