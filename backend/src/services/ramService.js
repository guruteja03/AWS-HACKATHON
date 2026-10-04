const { resourceRepository } = require('../models/resourceRepository');

const getResourceShares = async () => {
  // TODO: Replace mock with RAMClient + GetResourceSharesCommand
  return resourceRepository.get('ramShares');
};

module.exports = { getResourceShares };
