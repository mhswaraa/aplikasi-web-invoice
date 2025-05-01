// /js/services/ClientService.js
import { StorageService } from './StorageService.js';

const ENTITY = 'clients';

export const ClientService = {
  getAllClients() {
    return StorageService.getAll(ENTITY);
  },

  getClient(id) {
    return StorageService.getById(ENTITY, id);
  },

  generateClientCode() {
    const prefix = 'CLT';
    const now = new Date();
    const ym = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}`;
    const all = this.getAllClients().filter(c => c.clientCode.includes(ym));
    const seq = String(all.length + 1).padStart(3,'0');
    return `${prefix}-${ym}-${seq}`;
  },

  saveClient(client) {
    if (client.id) {
      // update existing
      return StorageService.update(ENTITY, client);
    } else {
      // create new
      client.clientCode = this.generateClientCode();
      return StorageService.create(ENTITY, client);
    }
  },

  deleteClient(id) {
    return StorageService.delete(ENTITY, id);
  }
};
