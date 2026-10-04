const { mockData } = require('../data/inMemoryDb');

const createInMemoryResourceRepository = (data = mockData) => ({
  async get(collection) {
    if (!(collection in data)) {
      throw new Error(`Unknown mock resource collection: ${collection}`);
    }
    return structuredClone(data[collection]);
  },
});

const resourceRepository = createInMemoryResourceRepository();

module.exports = { createInMemoryResourceRepository, resourceRepository };
