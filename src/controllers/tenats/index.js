const Config = require("../../models/config");
const Tenant = require("../../models/tenant");

const verifyTenant = async (req, res) => {
  const { subdomain } = req.query;

  try {
    const tenant = await Tenant.findOne({ subdomain });
    if (tenant) {
      // Guarda el token en la sesión, pero no lo envíes en la respuesta
      req.session.mercadopagoAccessToken = tenant.mercadoPagoToken;

      // Crear una copia del objeto tenant sin el token
      const { mercadoPagoToken, ...tenantWithoutToken } = tenant.toObject();

      return res.json({
        ok: true,
        tenant: tenantWithoutToken, // Enviamos el objeto sin el token
      });

      console.log(tenant);
    } else {
      throw new Error("subdomain error");
    }
  } catch (error) {
    console.error("Tenant error", error);
    res.status(404).json({
      ok: false,
      message: error.message,
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
