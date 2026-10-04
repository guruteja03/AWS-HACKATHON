const { z } = require('zod');
const { successResponse, AppError } = require('../utils/response');

const cidrSchema = z.object({ cidr: z.string().min(3, 'CIDR input is required.') });

function ipToInt(ip) {
  return ip.split('.').reduce((acc, part) => (acc << 8) + Number(part), 0) >>> 0;
}

function intToIp(value) {
  return [
    (value >>> 24) & 255,
    (value >>> 16) & 255,
    (value >>> 8) & 255,
    value & 255,
  ].join('.');
}

function parseCidr(cidr) {
  const [ip, prefixRaw] = cidr.split('/');
  const prefix = Number(prefixRaw);

  const octets = ip?.split('.').map(Number);
  if (
    !ip ||
    cidr.split('/').length !== 2 ||
    Number.isNaN(prefix) ||
    !Number.isInteger(prefix) ||
    prefix < 0 ||
    prefix > 32 ||
    octets.length !== 4 ||
    octets.some((octet, index) => !/^\d{1,3}$/.test(ip.split('.')[index]) || octet < 0 || octet > 255)
  ) {
    throw new Error('CIDR must be in the form 10.0.0.0/24');
  }

  const ipInt = ipToInt(ip);
  const mask = prefix === 0 ? 0 : ((0xffffffff << (32 - prefix)) >>> 0);
  const network = ipInt & mask;
  const broadcast = network | (~mask >>> 0);
  const totalAddresses = 2 ** (32 - prefix);
  const usableHosts = Math.max(0, totalAddresses - 2);
  const reservedHosts = 5;

  return {
    network: intToIp(network),
    broadcast: intToIp(broadcast),
    firstHost: prefix < 31 ? intToIp(network + 1) : intToIp(network),
    lastHost: prefix < 31 ? intToIp(broadcast - 1) : intToIp(broadcast),
    totalAddresses,
    usableHosts,
    reservedHosts,
    availableInstanceIps: Math.max(0, totalAddresses - reservedHosts),
  };
}

const calculateCidr = async (req, res, next) => {
  try {
    const parsed = cidrSchema.safeParse(req.body);
    if (!parsed.success) {
      return next(new AppError(parsed.error.issues[0].message, 400));
    }

    const cidr = parsed.data.cidr;
    const output = parseCidr(cidr);
    return res.json(successResponse({ cidr, ...output }));
  } catch (error) {
    next(new AppError(error.message || 'Invalid CIDR calculation input.', 422));
  }
};

module.exports = { calculateCidr };
