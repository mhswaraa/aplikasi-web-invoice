// /js/services/ImportExportService.js

import { StorageService } from './StorageService.js';

export const ImportExportService = {
  /**
   * Import CSV dengan skip duplikat (atau update bila diinginkan)
   *
   * @param {string}   entity
   * @param {File}     file
   * @param {function} onComplete  → (result, err)
   * @param {{ uniqueKey?: string, updateExisting?: boolean }} options
   */
  importCSV(entity, file, onComplete, options = {}) {
    const { uniqueKey = 'id', updateExisting = false } = options;

    if (typeof window.Papa === 'undefined') {
      return onComplete(null, new Error('PapaParse belum ter‐load'));
    }

    window.Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: results => {
        try {
          // 1) Normalisasi data
          const parsed = results.data.map(row => {
            // parse JSON di kolom "items" bila ada
            if (row.items) {
              try { row.items = JSON.parse(row.items); }
              catch { row.items = []; }
            }
            // konversi string angka
            for (const key in row) {
              const v = row[key];
              if (v != null && v !== '' && !isNaN(v) && v.toString().trim() === v.toString()) {
                row[key] = Number(v);
              }
            }
            return row;
          });

          // 2) Dedup & update/create
          const all = StorageService.getAll(entity);
          let added = 0, updated = 0;

          parsed.forEach(row => {
            const match = all.find(item => item[uniqueKey] === row[uniqueKey]);
            if (match) {
              if (updateExisting) {
                row.id = match.id;
                StorageService.update(entity, row);
                updated++;
              }
            } else {
              StorageService.create(entity, row);
              added++;
            }
          });

          onComplete({ added, updated }, null);
        } catch (err) {
          onComplete(null, err);
        }
      },
      error: err => onComplete(null, err)
    });
  },

  /**
   * Export all data entitas ke CSV dan auto-download
   * @param {string} entity
   */
  exportCSV(entity) {
    const data = StorageService.getAll(entity);
    if (!Array.isArray(data) || !data.length) {
      alert('Tidak ada data untuk diexport!');
      return;
    }

    const keys = Object.keys(data[0]);
    const header = keys.join(',') + '\n';

    const rows = data.map(obj => {
      return keys.map(k => {
        let val = obj[k];
        if (val != null && typeof val === 'object') {
          val = JSON.stringify(val);
        }
        const str = String(val ?? '');
        return `"${str.replace(/"/g,'""')}"`;
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
  }
};

// expose globally jika perlu
window.ImportExportService = ImportExportService;
