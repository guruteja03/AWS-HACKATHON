const { resourceRepository } = require('../models/resourceRepository');

const getInstances = async () => {
  // TODO: Replace mock with EC2Client + DescribeInstancesCommand
  return resourceRepository.get('instances');
};

const getSecurityGroups = async () => {
  // TODO: Replace mock with EC2Client + DescribeSecurityGroupsCommand
  return resourceRepository.get('securityGroups');
};

const getNetworkAcls = async () => {
  // TODO: Replace mock with EC2Client + DescribeNetworkAclsCommand
  return resourceRepository.get('networkAcls');
};

const getAccounts = async () => {
  // TODO: Replace mock with OrganizationsClient + ListAccountsCommand
  return resourceRepository.get('accounts');
};

module.exports = { getInstances, getSecurityGroups, getNetworkAcls, getAccounts };
