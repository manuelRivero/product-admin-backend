const Config = require("../../models/config");
const Tenant = require("../../models/tenant");

const verifyTenant = async (req, res) => {
  const { subdomain } = req.query;

  if (!subdomain) {
    return res.status(400).json({
      ok: false,
      message: "El subdominio es requerido.",
    });
  }

  try {
    const tenant = await Tenant.findOne({ subdomain }).lean();
    console.log("Tenant encontrado:", tenant);

    if (!tenant) {
      throw new Error("Subdominio no encontrado");
    }

    // Crear una copia del objeto tenant sin el token
    const { mercadoPagoToken, ...tenantWithoutToken } = tenant;

    return res.json({
      ok: true,
      tenant: tenantWithoutToken,
    });
  } catch (error) {
    console.error("Error al verificar el tenant:", error.message);
    res.status(404).json({
      ok: false,
      message: error.message,
    });
  }
};

const verifyAdminTenant = async (req, res) => {
  const { subdomain } = req.query;

  if (!subdomain) {
    return res.status(400).json({
      ok: false,
      message: "El subdominio es requerido.",
    });
  }

  try {
    const tenant = await Tenant.findOne({ adminTenant:subdomain }).lean();
    console.log("Tenant encontrado:", tenant);

    if (!tenant) {
      throw new Error("Subdominio no encontrado");
    }

    // Crear una copia del objeto tenant sin el token
    const { mercadoPagoToken, ...tenantWithoutToken } = tenant;

    return res.json({
      ok: true,
      tenant: tenantWithoutToken,
    });
  } catch (error) {
    console.error("Error al verificar el tenant:", error.message);
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
  verifyAdminTenant,
};
