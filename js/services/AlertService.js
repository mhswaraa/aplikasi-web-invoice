// /js/services/AlertService.js
export const AlertService = {
  show(message, type = 'info') {
    const icons = {
      success: 'success',
      error:   'error',
      warning: 'warning',
      info:    'info'
    };
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: icons[type] || 'info',
      title: message,
      showConfirmButton: false,
      timer: 2000,
      timerProgressBar: true,
      didOpen: (toast) => {
        toast.addEventListener('mouseenter', Swal.stopTimer);
        toast.addEventListener('mouseleave', Swal.resumeTimer);
      }
    });
  }
};
