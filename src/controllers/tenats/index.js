const Config = require("../../models/config");
const Tenant = require("../../models/tenant");

const verifyTenant = async (req, res) => {
  const { subdomain } = req.query;
  try {
    const tenant = await Tenant.findOne({
      subdomain,
    });
    if (tenant) {
      res.json({
        ok: true,
        tenant: tenant,
      });

      console.log(tenant);
    } else {
      throw new Error("subdomain error");
    }
  } catch (error) {
    console.log("tenat error", error);
    res.status(404).json({
      ok: false,
    });
  }
};

const getTenantConfig = async (req, res) => {
  const { tenant } = req.query;

  try {
    const config = await Config.findOne({
      subdomain: tenant,
    }).lean();

    if (config) {
      console.log("config", config);
      res.json({
        ok: true,
        config,
      });
    } else {
      throw new Error("subdomain error");
    }
  } catch (error) {
    res.status(404).json({
      ok: false,
    });
  }
};

module.exports = {
  verifyTenant,
  getTenantConfig,
};
