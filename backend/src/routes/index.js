const express = require('express');
const { getHealth, getDashboard } = require('../controllers/dashboardController');
const {
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
} = require('../controllers/resourceController');
const { calculateCidr } = require('../controllers/toolsController');
const { ramShareCheck } = require('../controllers/simulationController');

const router = express.Router();

router.get('/health', getHealth);
router.get('/dashboard', getDashboard);
router.get('/accounts', listAccounts);
router.get('/vpcs', listVpcs);
router.get('/subnets', listSubnets);
router.get('/ram/resource-shares', listRamShares);
router.get('/ec2/instances', listInstances);
router.get('/security-groups', listSecurityGroups);
router.get('/network-acls', listNetworkAcls);
router.get('/cloudtrail/events', getCloudTrail);
router.get('/cloudwatch/metrics', getCloudWatch);
router.get('/architecture', getArchitecture);
router.get('/ip-addressing', getIpAddressing);
router.post('/tools/cidr-calc', calculateCidr);
router.post('/simulations/ram-share-check', ramShareCheck);

module.exports = router;
