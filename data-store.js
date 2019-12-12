
'use strict'

const Store = require('electron-store');

class DataStore extends Store {

  constructor(settings) {
    super(settings);
    this.items = this.get('items') || [];
  }

  saveItems(items) {
    this.set('items', items);
    return this.get('items') || [];
  }

  getItems() {
    return this.get('items') || [];
  }

}

module.exports = DataStore;
