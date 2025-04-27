// /js/services/StorageService.js

export const StorageService = {
    getAll(entity) {
      const raw = localStorage.getItem(entity);
      return raw ? JSON.parse(raw) : [];
    },
  
    getById(entity, id) {
      const list = this.getAll(entity);
      return list.find(item => item.id === id) || null;
    },
  
    create(entity, object) {
      const list = this.getAll(entity);
      object.id = this._generateId();
      list.push(object);
      localStorage.setItem(entity, JSON.stringify(list));
      return object;
    },
  
    update(entity, updatedObject) {
      const list = this.getAll(entity);
      const index = list.findIndex(item => item.id === updatedObject.id);
      if (index !== -1) {
        list[index] = updatedObject;
        localStorage.setItem(entity, JSON.stringify(list));
        return true;
      }
      return false;
    },
  
    delete(entity, id) {
      let list = this.getAll(entity);
      list = list.filter(item => item.id !== id);
      localStorage.setItem(entity, JSON.stringify(list));
      return true;
    },
  
    clear(entity) {
      localStorage.removeItem(entity);
    },
  
    _generateId() {
      // Membuat ID acak sederhana
      return '_' + Math.random().toString(36).substr(2, 9);
    }
  };
  