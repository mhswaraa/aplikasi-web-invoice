// /js/services/ImportExportService.js

import { StorageService } from './StorageService.js';

export const ImportExportService = {
  exportCSV(entity) {
    const data = StorageService.getAll(entity);
    if (!data.length) {
      alert('Tidak ada data untuk diexport!');
      return;
    }

    const keys = Object.keys(data[0]);
    const header = keys.join(',') + '\n';

    const rows = data.map(obj => {
      return keys.map(k => {
        let val = obj[k];
        // Jika array atau object, stringify
        if (val !== null && typeof val === 'object') {
          val = JSON.stringify(val);
        }
        return `"${String(val).replace(/"/g,'""')}"`;
      }).join(',');
    }).join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `${entity}-${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  importCSV(entity, file, onComplete) {
    if (typeof Papa === 'undefined') {
      alert('PapaParse belum ter‐load!');
      return onComplete(0, new Error('PapaParse tidak ditemukan'));
    }
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: results => {
        const parsed = results.data.map(row => {
          // Parse kembali items JSON
          if (row.items) {
            try {
              row.items = JSON.parse(row.items);
            } catch {
              row.items = [];
            }
          } else {
            row.items = [];
          }
          // Pastikan tiap item valid
          if (Array.isArray(row.items)) {
            row.items = row.items.map(it => ({
              name: it.name || '',
              size: it.size || '',
              qty: Number(it.qty) || 0,
              price: Number(it.price) || 0
            }));
          } else {
            row.items = [];
          }
          // Konversi angka top‐level
          row.subtotal        = Number(row.subtotal)        || 0;
          row.taxPercent      = Number(row.taxPercent)      || 0;
          row.taxAmount       = Number(row.taxAmount)       || 0;
          row.discountPercent = Number(row.discountPercent) || 0;
          row.discountAmount  = Number(row.discountAmount)  || 0;
          row.total           = Number(row.total)           || 0;
          return row;
        });

        parsed.forEach(row => StorageService.create(entity, row));
        onComplete(parsed.length);
      },
      error: err => onComplete(0, err)
    });
  }
};

window.ImportExportService = ImportExportService;
