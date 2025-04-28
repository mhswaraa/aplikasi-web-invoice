// /js/services/AlertService.js

export const AlertService = {
    /**
     * Tampilkan toast notifikasi
     * @param {string} message  – teks pesan
     * @param {'success'|'error'|'info'} type
     * @param {number} duration – ms sebelum auto-hide
     */
    show(message, type = 'info', duration = 3000) {
      // Buat container jika belum ada
      let container = document.querySelector('.alert-container');
      if (!container) {
        container = document.createElement('div');
        container.className = 'alert-container';
        document.body.appendChild(container);
      }
      // Buat toast
      const toast = document.createElement('div');
      toast.className = `toast toast--${type}`;
      toast.textContent = message;
      container.appendChild(toast);
  
      // Muncul + auto-hide
      setTimeout(() => toast.classList.add('show'), 50);
      setTimeout(() => {
        toast.classList.remove('show');
        toast.addEventListener('transitionend', () => toast.remove());
      }, duration);
    }
  };
  
  // Expose untuk kemudahan panggil dari console/JS lain
  window.AlertService = AlertService;
  