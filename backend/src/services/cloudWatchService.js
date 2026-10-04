const { resourceRepository } = require('../models/resourceRepository');

const getCloudWatchMetrics = async (range = '1h') => {
  // TODO: Replace mock with CloudWatchClient + GetMetricDataCommand
  const metricSet = await resourceRepository.get('cloudWatchMetrics');
  return {
    range,
    labels: metricSet.cpu.map((entry) => entry.time),
    metrics: {
      CPU: metricSet.cpu,
      NetworkIn: metricSet.networkIn,
      NetworkOut: metricSet.networkOut,
      instanceStatus: metricSet.instanceStatus,
    },
    summary: {
      currentCpu: 23,
      status: 'Healthy',
      label: 'DEMO DATA',
    },
  };
};

module.exports = { getCloudWatchMetrics };
