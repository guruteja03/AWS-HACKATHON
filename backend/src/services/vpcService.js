const { resourceRepository } = require('../models/resourceRepository');

const getVpcs = async () => {
  // TODO: Replace mock with EC2Client + DescribeVpcsCommand
  return resourceRepository.get('vpcs');
};

const getSubnets = async () => {
  // TODO: Replace mock with EC2Client + DescribeSubnetsCommand
  return resourceRepository.get('subnets');
};

const getArchitecture = async () => {
  return {
    org: 'CloudShare Org',
    region: 'eu-north-1',
    az: 'eu-north-1a',
    resources: [
      { id: 'org-1', type: 'Org', label: 'CloudShare Org', x: 40, y: 180 },
      { id: 'acct-1', type: 'Account', label: 'Account 1', x: 220, y: 120 },
      { id: 'vpc-1', type: 'VPC', label: 'VPC: 10.0.0.0/16', x: 420, y: 120 },
      { id: 'subnet-1', type: 'Subnet', label: 'Subnet: 10.0.1.0/24', x: 620, y: 120 },
      { id: 'ram-1', type: 'RAM', label: 'RAM Share', x: 620, y: 230 },
      { id: 'acct-2', type: 'Account', label: 'Account 2', x: 820, y: 120 },
      { id: 'ec2-1', type: 'EC2', label: 'EC2: t3.micro', x: 820, y: 260 },
      { id: 'sg-1', type: 'SecurityGroup', label: 'SG: RAM-Test-SG', x: 1020, y: 260 },
      { id: 'acl-1', type: 'NetworkACL', label: 'NACL', x: 620, y: 340 },
      { id: 'ct-1', type: 'CloudTrail', label: 'CloudTrail', x: 410, y: 360 },
      { id: 'cw-1', type: 'CloudWatch', label: 'CloudWatch', x: 1020, y: 360 },
    ],
    links: [
      ['org-1', 'acct-1'],
      ['acct-1', 'vpc-1'],
      ['vpc-1', 'subnet-1'],
      ['subnet-1', 'ram-1'],
      ['ram-1', 'acct-2'],
      ['acct-2', 'ec2-1'],
      ['ec2-1', 'sg-1'],
      ['subnet-1', 'acl-1'],
      ['vpc-1', 'ct-1'],
      ['ec2-1', 'cw-1'],
    ],
  };
};

const getIpAddressing = async () => {
  return {
    cidr: '10.0.1.0/24',
    network: '10.0.1.0',
    broadcast: '10.0.1.255',
    firstHost: '10.0.1.1',
    lastHost: '10.0.1.254',
    usableHosts: 251,
    reservedHosts: 5,
    used: '10.0.1.144',
    freeIps: 250,
    region: 'eu-north-1',
    availabilityZone: 'eu-north-1a',
  };
};

module.exports = { getVpcs, getSubnets, getArchitecture, getIpAddressing };
