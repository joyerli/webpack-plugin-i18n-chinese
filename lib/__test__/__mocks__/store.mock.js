let store = {};

module.exports = {
  getAll() {
    return store;
  },

  mockStore(__store) {
    store = __store;
  },
};
