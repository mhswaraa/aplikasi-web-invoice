// /js/services/ProductService.js

export const ProductService = {
    STORAGE_KEY: 'products',
  
    // Ambil semua produk
    getAllProducts() {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
    },
  
    // Ambil satu produk by ID
    getProduct(id) {
      return this.getAllProducts().find(p => p.id === id) || null;
    },
  
    // Simpan (baru/update)
    saveProduct(product) {
      const all = this.getAllProducts();
      if (product.id) {
        // Update existing
        const idx = all.findIndex(p => p.id === product.id);
        if (idx !== -1) all[idx] = product;
        else all.push(product);
      } else {
        // New product
        product.id = Date.now().toString();
        all.push(product);
      }
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(all));
      return product;
    },
  
    // Hapus produk
    deleteProduct(id) {
      const filtered = this.getAllProducts().filter(p => p.id !== id);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
    },
  
    // Generate kode produk unik: PROD-YYYYMMDD-XXX
    generateProductCode() {
      const prefix = 'PROD';
      const date   = new Date().toISOString().slice(0,10).replace(/-/g,'');
      const existing = this.getAllProducts()
        .filter(p => p.productCode?.includes(`${prefix}-${date}`)).length;
      const seq = String(existing + 1).padStart(3, '0');
      return `${prefix}-${date}-${seq}`;
    }
  };
  