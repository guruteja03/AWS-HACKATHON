const { z } = require('zod');
const { successResponse } = require('../utils/response');

const simulationSchema = z.object({
  orgSharingEnabled: z.boolean(),
  principalInSameOrg: z.boolean(),
  subnetShared: z.boolean(),
  sgAllowsSsh: z.boolean(),
});

const ramShareCheck = async (req, res, next) => {
  try {
    const parsed = simulationSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        error: {
          message: parsed.error.issues[0]?.message || 'Simulation validation failed.',
          statusCode: 400,
        },
      });
    }

    const { orgSharingEnabled, principalInSameOrg, subnetShared, sgAllowsSsh } = parsed.data;

    const checks = [
      ['Org sharing enabled?', orgSharingEnabled],
      ['Principal in same Org?', principalInSameOrg],
      ['Subnet shared?', subnetShared],
      ['Security group allows SSH?', sgAllowsSsh],
    ];

    const passed = checks.filter(([, value]) => value).length;
    const shareAvailable = orgSharingEnabled && principalInSameOrg && subnetShared;
    let outcome;
    let recommendation;

    if (!shareAvailable) {
      outcome = 'Launch blocked';
      recommendation = 'For this same-organization scenario, enable RAM organization sharing, confirm the principal is in the Org, and share the subnet. An external-account invitation flow is not modeled here.';
    } else if (!sgAllowsSsh) {
      outcome = 'Launch allowed; SSH blocked';
      recommendation = 'The member account can launch in the shared subnet. SSH is not permitted by the security group, which does not prevent instance launch.';
    } else {
      outcome = 'Launch allowed; SSH permitted';
      recommendation = 'The member account can launch in the shared subnet and the configured security group permits SSH. Restrict the SSH source range in a real environment.';
    }

    return res.json(successResponse({
      outcome,
      launchAllowed: shareAvailable,
      sshAllowed: shareAvailable && sgAllowsSsh,
      passedChecks: passed,
      totalChecks: checks.length,
      checks,
      recommendation,
      label: 'Simulation – no AWS changes made',
    }));
  } catch (error) {
    next(error);
  }
};

module.exports = { ramShareCheck };
