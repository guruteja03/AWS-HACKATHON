const { successResponse } = require('../utils/response');
const { getAccounts, getSecurityGroups, getNetworkAcls, getInstances } = require('../services/ec2Service');
const { getVpcs, getSubnets, getArchitecture: getArchitectureView, getIpAddressing: getIpData } = require('../services/vpcService');
const { getResourceShares } = require('../services/ramService');
const { getCloudTrailEvents } = require('../services/cloudTrailService');
const { getCloudWatchMetrics } = require('../services/cloudWatchService');

const listAccounts = async (req, res, next) => {
  try {
    const data = await getAccounts();
    res.json(successResponse(data));
  } catch (error) {
    next(error);
  }
};

const listVpcs = async (req, res, next) => {
  try {
    res.json(successResponse(await getVpcs()));
  } catch (error) {
    next(error);
  }
};

const listSubnets = async (req, res, next) => {
  try {
    res.json(successResponse(await getSubnets()));
  } catch (error) {
    next(error);
  }
};

const listRamShares = async (req, res, next) => {
  try {
    res.json(successResponse(await getResourceShares()));
  } catch (error) {
    next(error);
  }
};

const listInstances = async (req, res, next) => {
  try {
    res.json(successResponse(await getInstances()));
  } catch (error) {
    next(error);
  }
};

const listSecurityGroups = async (req, res, next) => {
  try {
    res.json(successResponse(await getSecurityGroups()));
  } catch (error) {
    next(error);
  }
};

const listNetworkAcls = async (req, res, next) => {
  try {
    res.json(successResponse(await getNetworkAcls()));
  } catch (error) {
    next(error);
  }
};

const getCloudTrail = async (req, res, next) => {
  try {
    const filters = { ...req.query };
    for (const key of ['eventName', 'account', 'status', 'from', 'to', 'page', 'limit']) {
      if (filters[key] !== undefined && typeof filters[key] !== 'string') {
        return next({ statusCode: 400, message: `${key} must be a single string value.` });
      }
    }
    const page = Number(filters.page || 1);
    const limit = Number(filters.limit || 10);
    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
      return next({ statusCode: 400, message: 'page must be positive and limit must be between 1 and 100.' });
    }
    if (filters.from && Number.isNaN(Date.parse(filters.from))) {
      return next({ statusCode: 400, message: 'from must be a valid date.' });
    }
    if (filters.to && Number.isNaN(Date.parse(filters.to))) {
      return next({ statusCode: 400, message: 'to must be a valid date.' });
    }
    if (filters.from && filters.to && Date.parse(filters.from) > Date.parse(filters.to)) {
      return next({ statusCode: 400, message: 'from must be earlier than or equal to to.' });
    }
    if (filters.status && !['Success', 'Failed'].includes(filters.status)) {
      return next({ statusCode: 400, message: 'status must be Success or Failed.' });
    }
    if (filters.account && !/^\d{12}$/.test(filters.account)) {
      return next({ statusCode: 400, message: 'account must be a 12-digit AWS account ID.' });
    }
    const data = await getCloudTrailEvents(filters);
    res.json(successResponse(data.events, { ...data.pagination, dataLabel: 'DEMO DATA' }));
  } catch (error) {
    next(error);
  }
};

const getCloudWatch = async (req, res, next) => {
  try {
    const range = req.query.range || '1h';
    if (!['1h', '6h', '24h'].includes(range)) {
      return next({ statusCode: 400, message: 'range must be one of 1h, 6h, or 24h.' });
    }
    const data = await getCloudWatchMetrics(range);
    res.json(successResponse(data));
  } catch (error) {
    next(error);
  }
};

const getArchitecture = async (req, res, next) => {
  try {
    res.json(successResponse(await getArchitectureView()));
  } catch (error) {
    next(error);
  }
};

const getIpAddressing = async (req, res, next) => {
  try {
    res.json(successResponse(await getIpData()));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listAccounts,
  listVpcs,
  listSubnets,
  listRamShares,
  listInstances,
  listSecurityGroups,
  listNetworkAcls,
  getCloudTrail,
  getCloudWatch,
  getArchitecture,
  getIpAddressing,
};
