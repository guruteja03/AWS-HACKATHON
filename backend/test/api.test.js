const { before, after, test } = require('node:test');
const assert = require('node:assert/strict');
const app = require('../server');
const { config } = require('../src/config');

let server;
let baseUrl;
let token;

before(async () => {
  server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}/api`;
  const response = await fetch(`${baseUrl}/auth/demo-login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'admin@example.com', password: 'Admin@123' }),
  });
  const result = await response.json();
  token = result.data.token;
});

after(async () => {
  await new Promise((resolve, reject) => server.close((error) => (error ? reject(error) : resolve())));
});

const get = (path) => fetch(`${baseUrl}${path}`, {
  headers: { authorization: `Bearer ${token}` },
});

test('public health returns mock mode', async () => {
  const response = await fetch(`${baseUrl}/health`);
  const result = await response.json();
  assert.equal(response.status, 200);
  assert.equal(result.data.mode, 'mock');
});

test('demo login validates credentials', async () => {
  assert.ok(token);
  const response = await fetch(`${baseUrl}/auth/demo-login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'admin@example.com', password: 'wrongpass' }),
  });
  assert.equal(response.status, 401);
});

test('protected routes reject absent and invalid tokens', async () => {
  const absent = await fetch(`${baseUrl}/accounts`);
  const invalid = await fetch(`${baseUrl}/accounts`, {
    headers: { authorization: 'Bearer demo-token' },
  });

  assert.equal(absent.status, 401);
  assert.equal(invalid.status, 401);
});

test('live mode fails closed with HTTP 503 until AWS integration exists', async () => {
  const original = config.useMockData;
  config.useMockData = false;
  try {
    const response = await get('/accounts');
    const result = await response.json();
    assert.equal(response.status, 503);
    assert.equal(result.success, false);
    assert.match(result.error.message, /AWS credentials|AWS integration/i);
  } finally {
    config.useMockData = original;
  }
});

for (const route of [
  '/dashboard',
  '/accounts',
  '/vpcs',
  '/subnets',
  '/ram/resource-shares',
  '/ec2/instances',
  '/security-groups',
  '/network-acls',
  '/cloudtrail/events',
  '/cloudwatch/metrics?range=24h',
  '/architecture',
  '/ip-addressing',
]) {
  test(`GET ${route} returns the response envelope`, async () => {
    const response = await get(route);
    const result = await response.json();
    assert.equal(response.status, 200);
    assert.equal(result.success, true);
    assert.ok('data' in result);
  });
}

test('CloudTrail query and CloudWatch range validation return 400', async () => {
  assert.equal((await get('/cloudtrail/events?page=0')).status, 400);
  assert.equal((await get('/cloudwatch/metrics?range=2d')).status, 400);
});

test('mock monitoring endpoints identify their data as demo data', async () => {
  const trailResponse = await get('/cloudtrail/events?status=Failed');
  const trail = await trailResponse.json();
  const watchResponse = await get('/cloudwatch/metrics');
  const watch = await watchResponse.json();
  assert.equal(trail.meta.dataLabel, 'DEMO DATA');
  assert.equal(trail.data[0].dataLabel, 'DEMO DATA');
  assert.equal(trail.data[0].status, 'Failed');
  assert.equal(watch.data.summary.label, 'DEMO DATA');
});

test('CIDR calculator returns correct AWS /24 usable addresses', async () => {
  const response = await fetch(`${baseUrl}/tools/cidr-calc`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ cidr: '10.0.1.0/24' }),
  });
  const result = await response.json();
  assert.equal(response.status, 200);
  assert.equal(result.data.usableHosts, 254);
  assert.equal(result.data.availableInstanceIps, 251);
  assert.equal(result.data.network, '10.0.1.0');
  assert.equal(result.data.broadcast, '10.0.1.255');
});

test('invalid CIDR and invalid simulation input fail clearly', async () => {
  const badCidr = await fetch(`${baseUrl}/tools/cidr-calc`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ cidr: '999.1.1.0/24' }),
  });
  const badSimulation = await fetch(`${baseUrl}/simulations/ram-share-check`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ subnetShared: 'yes' }),
  });
  assert.equal(badCidr.status, 422);
  assert.equal(badSimulation.status, 400);
});

test('RAM what-if distinguishes launch permission from SSH permission', async () => {
  const response = await fetch(`${baseUrl}/simulations/ram-share-check`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      orgSharingEnabled: true,
      principalInSameOrg: true,
      subnetShared: true,
      sgAllowsSsh: false,
    }),
  });
  const result = await response.json();
  assert.equal(response.status, 200);
  assert.equal(result.data.launchAllowed, true);
  assert.equal(result.data.sshAllowed, false);
});

test('unknown API paths return the standard 404 envelope', async () => {
  const response = await get('/missing');
  const result = await response.json();
  assert.equal(response.status, 404);
  assert.equal(result.success, false);
  assert.equal(result.error.statusCode, 404);
});
