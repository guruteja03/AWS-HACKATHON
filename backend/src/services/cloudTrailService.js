const { resourceRepository } = require('../models/resourceRepository');

const getCloudTrailEvents = async (filters = {}) => {
  // TODO: Replace mock with CloudTrailClient + LookupEventsCommand
  let events = (await resourceRepository.get('cloudTrailEvents'))
    .map((event) => ({ ...event, dataLabel: 'DEMO DATA' }));

  if (filters.eventName) {
    events = events.filter((item) => item.eventName.toLowerCase().includes(filters.eventName.toLowerCase()));
  }

  if (filters.account) {
    events = events.filter((item) => item.account === filters.account || item.account === filters.account.toString());
  }

  if (filters.status) {
    events = events.filter((item) => item.status.toLowerCase() === filters.status.toLowerCase());
  }

  if (filters.from) {
    events = events.filter((item) => new Date(item.timestamp) >= new Date(filters.from));
  }

  if (filters.to) {
    events = events.filter((item) => new Date(item.timestamp) <= new Date(filters.to));
  }

  const page = Number(filters.page || 1);
  const limit = Number(filters.limit || 10);
  const total = events.length;
  const startIndex = (page - 1) * limit;
  const paged = events.slice(startIndex, startIndex + limit);

  return {
    events: paged,
    pagination: {
      page,
      limit,
      total,
      pageCount: Math.ceil(total / limit) || 1,
    },
  };
};

module.exports = { getCloudTrailEvents };
