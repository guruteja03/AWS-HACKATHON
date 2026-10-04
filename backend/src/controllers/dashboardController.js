const { successResponse } = require('../utils/response');
const { isMockMode } = require('../config');
const { getAccounts } = require('../services/ec2Service');
const { getVpcs, getSubnets, getArchitecture, getIpAddressing } = require('../services/vpcService');
const { getResourceShares } = require('../services/ramService');
const { getInstances, getSecurityGroups, getNetworkAcls } = require('../services/ec2Service');
const { getCloudTrailEvents } = require('../services/cloudTrailService');
const { getCloudWatchMetrics } = require('../services/cloudWatchService');

const getHealth = async (req, res) => {
  const mode = isMockMode() ? 'mock' : 'live';
  const payload = {
    status: 'ok',
    mode,
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  };

  return res.json(successResponse(payload));
};

const getDashboard = async (req, res, next) => {
  try {
    const [accounts, vpcs, subnets, ramShares, instances, securityGroups, networkAcls, cloudTrail, cloudWatch] = await Promise.all([
      getAccounts(),
      getVpcs(),
      getSubnets(),
      getResourceShares(),
      getInstances(),
      getSecurityGroups(),
      getNetworkAcls(),
      getCloudTrailEvents({ limit: 5, page: 1 }),
      getCloudWatchMetrics('1h'),
    ]);

    const dashboard = {
      summary: {
        totalAccounts: accounts.length,
        totalVpcs: vpcs.length,
        totalSubnets: subnets.length,
        totalInstances: instances.length,
        ramShares: ramShares.length,
        securityWarnings: securityGroups.filter((group) => group.risk === 'High').length,
        status: 'System Status: Healthy',
      },
      accounts,
      vpcs,
      subnets,
      ramShares,
      instances,
      securityGroups,
      networkAcls,
      cloudTrailEvents: cloudTrail.events,
      cloudWatchMetrics: cloudWatch,
      architecture: await getArchitecture(),
      ipAddressing: await getIpAddressing(),
    };

    return res.json(successResponse(dashboard, { source: 'mock' }));
  } catch (error) {
    next(error);
  }
};

module.exports = { getHealth, getDashboard };
